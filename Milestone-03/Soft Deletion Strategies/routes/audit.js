const express = require('express');
const router = express.Router();
const db = require('../db');

// Secure middleware to authenticate and authorize admin/auditor access
const requireAdminAuth = (req, res, next) => {
  const configuredSecret = process.env.ADMIN_API_KEY;

  // Fail closed: If no secret is configured on the server, deny access immediately
  if (!configuredSecret || typeof configuredSecret !== 'string' || configuredSecret.trim().length === 0) {
    console.error('Audit authorization failure: ADMIN_API_KEY is not configured on the server.');
    return res.status(500).json({
      error: 'Server configuration error: Admin authentication is not configured',
    });
  }

  // Retrieve token from Authorization header or x-admin-key header
  // Note: Arbitrary unverified role headers (e.g., x-admin-role) are strictly rejected
  const adminKeyHeader = req.headers['x-admin-key'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const suppliedSecret = adminKeyHeader || bearerToken;

  if (!suppliedSecret) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication token required to access audit records',
    });
  }

  if (suppliedSecret !== configuredSecret) {
    return res.status(403).json({
      error: 'Forbidden: Invalid admin credentials',
    });
  }

  return next();
};

// Apply admin authorization to all audit routes
router.use(requireAdminAuth);

// GET summary of active vs deleted records across the system
router.get('/summary', async (req, res) => {
  try {
    const usersActive = await db.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');
    const usersDeleted = await db.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NOT NULL');

    const accountsActive = await db.query('SELECT COUNT(*) FROM accounts WHERE deleted_at IS NULL');
    const accountsDeleted = await db.query('SELECT COUNT(*) FROM accounts WHERE deleted_at IS NOT NULL');

    const txActive = await db.query('SELECT COUNT(*) FROM transactions WHERE deleted_at IS NULL');
    const txDeleted = await db.query('SELECT COUNT(*) FROM transactions WHERE deleted_at IS NOT NULL');

    res.json({
      users: {
        active: parseInt(usersActive.rows[0].count, 10),
        deleted: parseInt(usersDeleted.rows[0].count, 10),
      },
      accounts: {
        active: parseInt(accountsActive.rows[0].count, 10),
        deleted: parseInt(accountsDeleted.rows[0].count, 10),
      },
      transactions: {
        active: parseInt(txActive.rows[0].count, 10),
        deleted: parseInt(txDeleted.rows[0].count, 10),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Audit summary query failed' });
  }
});

// GET all soft-deleted users (deleted_at IS NOT NULL)
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, created_at, deleted_at FROM users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Audit retrieval failed for users' });
  }
});

// GET all soft-deleted accounts (deleted_at IS NOT NULL)
router.get('/accounts', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, account_type, balance, created_at, deleted_at FROM accounts WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Audit retrieval failed for accounts' });
  }
});

// GET all soft-deleted transactions (deleted_at IS NOT NULL)
router.get('/transactions', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, account_id, amount, type, description, created_at, deleted_at FROM transactions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Audit retrieval failed for transactions' });
  }
});

// GET all soft-deleted records across all tables
router.get('/all', async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, name, email, created_at, deleted_at FROM users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    const accounts = await db.query(
      'SELECT id, user_id, account_type, balance, created_at, deleted_at FROM accounts WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    const transactions = await db.query(
      'SELECT id, account_id, amount, type, description, created_at, deleted_at FROM transactions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );

    res.json({
      users: users.rows,
      accounts: accounts.rows,
      transactions: transactions.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Audit retrieval failed' });
  }
});

module.exports = router;
