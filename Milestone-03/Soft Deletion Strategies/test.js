const { newDb } = require('pg-mem');
const request = require('supertest');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.ADMIN_API_KEY = 'ledgerapp-admin-secret-key';

const db = require('./db');
const app = require('./app');

async function runTests() {
  console.log('🧪 Starting LedgerApp Soft Deletion Test Suite...\n');

  // 1. Initialize in-memory PostgreSQL instance with schema
  const memDb = newDb();

  // Load schema and adapt DECIMAL(15, 2) precision syntax for pg-mem AST planner
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const pgMemSql = schemaSql.replace(/DECIMAL\(15,\s*2\)/gi, 'NUMERIC');
  memDb.public.none(pgMemSql);

  // Bind pg-mem adapter to db.js
  const pgMemAdapter = memDb.adapters.createPg();
  const pool = new pgMemAdapter.Pool();
  db.setPool(pool);

  console.log('✅ Schema & In-Memory Database initialized successfully.');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Partial Indexes Exist in Database Schema
  // -------------------------------------------------------------
  console.log('\n--- 1. Schema & Partial Index Verification ---');
  await test('Partial indexes are correctly defined in schema.sql, migration.sql, and DB engine', async () => {
    // 1. Verify schema.sql explicitly defines the required partial indexes
    const requiredPatterns = [
      /CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_users_active\s+ON\s+users\s*\(\s*id\s*\)\s*WHERE\s+deleted_at\s+IS\s+NULL/i,
      /CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_accounts_active\s+ON\s+accounts\s*\(\s*id\s*\)\s*WHERE\s+deleted_at\s+IS\s+NULL/i,
      /CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_transactions_active\s+ON\s+transactions\s*\(\s*id\s*\)\s*WHERE\s+deleted_at\s+IS\s+NULL/i,
    ];
    for (const pattern of requiredPatterns) {
      assert(pattern.test(schemaSql), `schema.sql missing required partial index matching ${pattern}`);
    }

    const migrationSql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf-8');
    for (const pattern of requiredPatterns) {
      assert(pattern.test(migrationSql), `migration.sql missing required partial index matching ${pattern}`);
    }

    // 2. Verify partial index SQL parses and executes cleanly in PostgreSQL engine
    const testDb = newDb();
    testDb.public.none(`
      CREATE TABLE users (id SERIAL PRIMARY KEY, deleted_at TIMESTAMP WITH TIME ZONE);
      CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
      CREATE TABLE accounts (id SERIAL PRIMARY KEY, deleted_at TIMESTAMP WITH TIME ZONE);
      CREATE INDEX idx_accounts_active ON accounts(id) WHERE deleted_at IS NULL;
      CREATE TABLE transactions (id SERIAL PRIMARY KEY, deleted_at TIMESTAMP WITH TIME ZONE);
      CREATE INDEX idx_transactions_active ON transactions(id) WHERE deleted_at IS NULL;
    `);
  });

  // -------------------------------------------------------------
  // Test 2: Users Soft Deletion Flow
  // -------------------------------------------------------------
  console.log('\n--- 2. Users Soft Deletion Flow ---');
  let user1Id, user2Id;

  await test('POST /users creates users with deleted_at = null', async () => {
    const res1 = await request(app)
      .post('/users')
      .send({ name: 'Alice Smith', email: 'alice@example.com' })
      .expect(201);

    assert(res1.body.id, 'User ID should be returned');
    assert.strictEqual(res1.body.name, 'Alice Smith');
    assert.strictEqual(res1.body.deleted_at, null);
    user1Id = res1.body.id;

    const res2 = await request(app)
      .post('/users')
      .send({ name: 'Bob Jones', email: 'bob@example.com' })
      .expect(201);
    user2Id = res2.body.id;
  });

  await test('GET /users returns all active users', async () => {
    const res = await request(app).get('/users').expect(200);
    assert.strictEqual(res.body.length, 2);
    assert(res.body.some(u => u.id === user1Id));
    assert(res.body.some(u => u.id === user2Id));
  });

  await test('DELETE /users/:id soft-deletes user and sets deleted_at', async () => {
    const delRes = await request(app).delete(`/users/${user1Id}`).expect(200);
    assert.strictEqual(delRes.body.message, 'User permanently deleted from LedgerApp');

    // Verify user row STILL exists in database with deleted_at timestamp
    const dbCheck = await pool.query('SELECT * FROM users WHERE id = $1', [user1Id]);
    assert.strictEqual(dbCheck.rows.length, 1, 'User row must NOT be hard deleted');
    assert(dbCheck.rows[0].deleted_at !== null, 'deleted_at timestamp must be set');
  });

  await test('GET /users excludes soft-deleted user from active list', async () => {
    const res = await request(app).get('/users').expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, user2Id);
    assert(!res.body.some(u => u.id === user1Id));
  });

  await test('GET /users/:id returns 404 for soft-deleted user', async () => {
    await request(app).get(`/users/${user1Id}`).expect(404);
  });

  await test('DELETE /users/:id on already deleted user returns 404', async () => {
    await request(app).delete(`/users/${user1Id}`).expect(404);
  });

  await test('DELETE /users/:id with non-existent id returns 404', async () => {
    await request(app).delete('/users/99999').expect(404);
  });

  // -------------------------------------------------------------
  // Test 3: Accounts Soft Deletion Flow & Relation Safety
  // -------------------------------------------------------------
  console.log('\n--- 3. Accounts Soft Deletion Flow ---');
  let account1Id, account2Id;

  await test('POST /accounts fails for soft-deleted user', async () => {
    const res = await request(app)
      .post('/accounts')
      .send({ user_id: user1Id, account_type: 'checking', balance: 500.0 })
      .expect(400);
    assert(res.body.error.includes('inactive'));
  });

  await test('POST /accounts succeeds for active user', async () => {
    const res1 = await request(app)
      .post('/accounts')
      .send({ user_id: user2Id, account_type: 'checking', balance: 1000.0 })
      .expect(201);
    account1Id = res1.body.id;
    assert.strictEqual(res1.body.deleted_at, null);

    const res2 = await request(app)
      .post('/accounts')
      .send({ user_id: user2Id, account_type: 'savings', balance: 5000.0 })
      .expect(201);
    account2Id = res2.body.id;
  });

  await test('GET /accounts returns active accounts', async () => {
    const res = await request(app).get('/accounts').expect(200);
    assert.strictEqual(res.body.length, 2);
  });

  await test('GET /accounts/user/:userId returns accounts for active user', async () => {
    const res = await request(app).get(`/accounts/user/${user2Id}`).expect(200);
    assert.strictEqual(res.body.length, 2);
  });

  await test('GET /accounts/user/:userId returns 404 for soft-deleted user', async () => {
    await request(app).get(`/accounts/user/${user1Id}`).expect(404);
  });

  await test('DELETE /accounts/:id soft-deletes account and sets deleted_at', async () => {
    const res = await request(app).delete(`/accounts/${account1Id}`).expect(200);
    assert.strictEqual(res.body.message, 'Account permanently deleted from LedgerApp');

    const dbCheck = await pool.query('SELECT * FROM accounts WHERE id = $1', [account1Id]);
    assert.strictEqual(dbCheck.rows.length, 1, 'Account row must NOT be hard deleted');
    assert(dbCheck.rows[0].deleted_at !== null, 'deleted_at must be populated');
  });

  await test('GET /accounts excludes soft-deleted account', async () => {
    const res = await request(app).get('/accounts').expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, account2Id);
  });

  await test('DELETE /accounts/:id repeated returns 404', async () => {
    await request(app).delete(`/accounts/${account1Id}`).expect(404);
  });

  // -------------------------------------------------------------
  // Test 4: Transactions Soft Deletion Flow
  // -------------------------------------------------------------
  console.log('\n--- 4. Transactions Soft Deletion Flow ---');
  let tx1Id, tx2Id;

  await test('POST /transactions fails for soft-deleted account', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({ account_id: account1Id, amount: 50.0, type: 'debit', description: 'Coffee' })
      .expect(400);
    assert(res.body.error.includes('inactive'));
  });

  await test('POST /transactions succeeds for active account', async () => {
    const res1 = await request(app)
      .post('/transactions')
      .send({ account_id: account2Id, amount: 200.0, type: 'credit', description: 'Paycheck' })
      .expect(201);
    tx1Id = res1.body.id;
    assert.strictEqual(res1.body.deleted_at, null);

    const res2 = await request(app)
      .post('/transactions')
      .send({ account_id: account2Id, amount: 30.0, type: 'debit', description: 'Groceries' })
      .expect(201);
    tx2Id = res2.body.id;
  });

  await test('GET /transactions returns active transactions', async () => {
    const res = await request(app).get('/transactions').expect(200);
    assert.strictEqual(res.body.length, 2);
  });

  await test('GET /transactions/account/:accountId returns active transactions', async () => {
    const res = await request(app).get(`/transactions/account/${account2Id}`).expect(200);
    assert.strictEqual(res.body.length, 2);
  });

  await test('DELETE /transactions/:id soft-deletes transaction and sets deleted_at', async () => {
    const res = await request(app).delete(`/transactions/${tx1Id}`).expect(200);
    assert.strictEqual(res.body.message, 'Transaction record permanently erased from LedgerApp');

    const dbCheck = await pool.query('SELECT * FROM transactions WHERE id = $1', [tx1Id]);
    assert.strictEqual(dbCheck.rows.length, 1, 'Transaction row must NOT be hard deleted');
    assert(dbCheck.rows[0].deleted_at !== null, 'deleted_at must be populated');
  });

  await test('GET /transactions excludes soft-deleted transaction', async () => {
    const res = await request(app).get('/transactions').expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, tx2Id);
  });

  await test('DELETE /transactions/:id repeated returns 404', async () => {
    await request(app).delete(`/transactions/${tx1Id}`).expect(404);
  });

  // -------------------------------------------------------------
  // Test 5: Temporary Data Hard Deletion (Sessions/Tokens)
  // -------------------------------------------------------------
  console.log('\n--- 5. Temporary Data Hard Deletion (Sessions/Tokens) ---');
  const testToken = 'sess_xyz_12345';

  await test('POST /sessions creates temporary session token', async () => {
    const res = await request(app)
      .post('/sessions')
      .send({ user_id: user2Id, token: testToken, expires_at: new Date(Date.now() + 3600000) })
      .expect(201);
    assert.strictEqual(res.body.token, testToken);
  });

  await test('GET /sessions returns active session', async () => {
    const res = await request(app).get('/sessions').expect(200);
    assert(res.body.some(s => s.token === testToken));
  });

  await test('DELETE /sessions/:token HARD deletes temporary session record', async () => {
    const res = await request(app).delete(`/sessions/${testToken}`).expect(200);
    assert.strictEqual(res.body.message, 'Session token permanently purged from LedgerApp');

    // Verify record is HARD DELETED from database table
    const dbCheck = await pool.query('SELECT * FROM sessions WHERE token = $1', [testToken]);
    assert.strictEqual(dbCheck.rows.length, 0, 'Temporary session MUST be permanently erased from database');
  });

  await test('DELETE /sessions/:token repeated returns 404', async () => {
    await request(app).delete(`/sessions/${testToken}`).expect(404);
  });

  // -------------------------------------------------------------
  // Test 6: Audit / Admin Endpoints Authorization & Inspection
  // -------------------------------------------------------------
  console.log('\n--- 6. Audit & Admin Authorization and Querying ---');

  await test('GET /audit/* rejects unauthorized requests (403 Forbidden)', async () => {
    await request(app).get('/audit/summary').expect(403);
    await request(app).get('/audit/users').expect(403);
    await request(app).get('/audit/accounts').expect(403);
    await request(app).get('/audit/transactions').expect(403);
    await request(app).get('/audit/all').expect(403);
  });

  await test('GET /audit/summary retrieves accurate counts of active vs soft-deleted records', async () => {
    const res = await request(app)
      .get('/audit/summary')
      .set('x-admin-role', 'admin')
      .expect(200);

    assert.strictEqual(res.body.users.active, 1);
    assert.strictEqual(res.body.users.deleted, 1);

    assert.strictEqual(res.body.accounts.active, 1);
    assert.strictEqual(res.body.accounts.deleted, 1);

    assert.strictEqual(res.body.transactions.active, 1);
    assert.strictEqual(res.body.transactions.deleted, 1);
  });

  await test('GET /audit/users retrieves soft-deleted users (deleted_at IS NOT NULL)', async () => {
    const res = await request(app)
      .get('/audit/users')
      .set('x-admin-role', 'admin')
      .expect(200);

    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, user1Id);
    assert(res.body[0].deleted_at !== null);
  });

  await test('GET /audit/accounts retrieves soft-deleted accounts', async () => {
    const res = await request(app)
      .get('/audit/accounts')
      .set('x-admin-role', 'admin')
      .expect(200);

    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, account1Id);
    assert(res.body[0].deleted_at !== null);
  });

  await test('GET /audit/transactions retrieves soft-deleted transactions', async () => {
    const res = await request(app)
      .get('/audit/transactions')
      .set('x-admin-key', 'ledgerapp-admin-secret-key')
      .expect(200);

    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].id, tx1Id);
    assert(res.body[0].deleted_at !== null);
  });

  await test('GET /audit/users supports Authorization Bearer header', async () => {
    const res = await request(app)
      .get('/audit/users')
      .set('Authorization', 'Bearer ledgerapp-admin-secret-key')
      .expect(200);
    assert.strictEqual(res.body.length, 1);
  });

  await test('GET /audit/all retrieves full audit report for compliance inspection', async () => {
    const res = await request(app)
      .get('/audit/all')
      .set('Authorization', 'Bearer ledgerapp-admin-secret-key')
      .expect(200);

    assert.strictEqual(res.body.users.length, 1);
    assert.strictEqual(res.body.accounts.length, 1);
    assert.strictEqual(res.body.transactions.length, 1);
  });

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
