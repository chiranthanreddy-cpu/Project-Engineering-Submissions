const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all active accounts in the system (excludes soft-deleted accounts)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, account_type, balance, created_at, deleted_at FROM accounts WHERE deleted_at IS NULL ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// GET active user accounts by user_id (excludes soft-deleted accounts and checks active user)
router.get('/user/:userId', async (req, res) => {
  try {
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.params.userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { rows } = await db.query(
      'SELECT id, user_id, account_type, balance, created_at, deleted_at FROM accounts WHERE user_id = $1 AND deleted_at IS NULL ORDER BY id ASC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database retrieval error' });
  }
});

// CREATE a new account for a user (validates that user is active and not soft-deleted)
router.post('/', async (req, res) => {
  const { user_id, account_type, balance } = req.body;
  try {
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot create account: User not found or inactive' });
    }

    const { rows } = await db.query(
      'INSERT INTO accounts (user_id, account_type, balance) VALUES ($1, $2, $3) RETURNING id, user_id, account_type, balance, created_at, deleted_at',
      [user_id, account_type, balance]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Account creation failed' });
  }
});

// SOFT DELETE single account from the system (sets deleted_at = NOW())
router.delete('/:id', async (req, res) => {
  try {
    // Individual soft-delete update using deleted_at = NOW()
    const { rowCount } = await db.query(
      'UPDATE accounts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Preserving existing response message for API consumer compatibility
    res.json({ message: 'Account permanently deleted from LedgerApp' });
  } catch (err) {
    res.status(500).json({ error: 'Delete operation failed' });
  }
});

module.exports = router;
