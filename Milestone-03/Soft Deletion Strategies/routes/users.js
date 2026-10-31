const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all active users in the system (excludes soft-deleted users)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, created_at, deleted_at FROM users WHERE deleted_at IS NULL ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// GET single user details by ID (only returns active user)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, created_at, deleted_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database retrieval error' });
  }
});

// CREATE a new user
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at, deleted_at',
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'User creation failed' });
  }
});

// SOFT DELETE user from the system (sets deleted_at = NOW() and cascades to child accounts/transactions)
router.delete('/:id', async (req, res) => {
  try {
    // Individual soft-delete update using deleted_at = NOW()
    const { rowCount } = await db.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cascade soft deletion to user's accounts to maintain relational consistency
    await db.query(
      'UPDATE accounts SET deleted_at = NOW() WHERE user_id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    // Cascade soft deletion to transactions linked to those accounts
    await db.query(
      `UPDATE transactions SET deleted_at = NOW() 
       WHERE account_id IN (SELECT id FROM accounts WHERE user_id = $1) 
         AND deleted_at IS NULL`,
      [req.params.id]
    );

    // Preserving existing response message for API consumer compatibility
    res.json({ message: 'User permanently deleted from LedgerApp' });
  } catch (err) {
    res.status(500).json({ error: 'Delete operation failed' });
  }
});

module.exports = router;
