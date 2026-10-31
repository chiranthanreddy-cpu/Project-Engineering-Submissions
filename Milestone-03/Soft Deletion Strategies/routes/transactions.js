const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all active transactions in the system (excludes soft-deleted transactions)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, account_id, amount, type, description, created_at, deleted_at FROM transactions WHERE deleted_at IS NULL ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// GET active transactions by account_id (excludes soft-deleted transactions and verifies active account)
router.get('/account/:accountId', async (req, res) => {
  try {
    const accountCheck = await db.query(
      'SELECT id FROM accounts WHERE id = $1 AND deleted_at IS NULL',
      [req.params.accountId]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { rows } = await db.query(
      'SELECT id, account_id, amount, type, description, created_at, deleted_at FROM transactions WHERE account_id = $1 AND deleted_at IS NULL ORDER BY id ASC',
      [req.params.accountId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database retrieval error' });
  }
});

// CREATE a new transaction event (validates that destination account is active and not soft-deleted)
router.post('/', async (req, res) => {
  const { account_id, amount, type, description } = req.body;
  try {
    const accountCheck = await db.query(
      'SELECT id FROM accounts WHERE id = $1 AND deleted_at IS NULL',
      [account_id]
    );

    if (accountCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot create transaction: Account not found or inactive' });
    }

    const { rows } = await db.query(
      'INSERT INTO transactions (account_id, amount, type, description) VALUES ($1, $2, $3, $4) RETURNING id, account_id, amount, type, description, created_at, deleted_at',
      [account_id, amount, type, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Transaction record creation failed' });
  }
});

// SOFT DELETE single transaction from the record (sets deleted_at = NOW())
router.delete('/:id', async (req, res) => {
  try {
    // Individual soft-delete update using deleted_at = NOW()
    const { rowCount } = await db.query(
      'UPDATE transactions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Transaction ID not found' });
    }

    // Preserving existing response message for API consumer compatibility
    res.json({ message: 'Transaction record permanently erased from LedgerApp' });
  } catch (err) {
    res.status(500).json({ error: 'Delete operation failed' });
  }
});

module.exports = router;
