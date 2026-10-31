const express = require('express');
const router = express.Router();
const db = require('../db');

// GET active authentication sessions (ephemeral data)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, token, expires_at, created_at FROM sessions ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database execution error' });
  }
});

// GET single session by token
router.get('/:token', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, token, expires_at, created_at FROM sessions WHERE token = $1',
      [req.params.token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database retrieval error' });
  }
});

// CREATE a new session token for a user
router.post('/', async (req, res) => {
  const { user_id, token, expires_at } = req.body;
  try {
    // Validate that the user exists and is active
    const userCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot create session: User not found or inactive' });
    }

    const { rows } = await db.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id, user_id, token, expires_at, created_at',
      [user_id, token, expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Session creation failed' });
  }
});

// HARD DELETE session permanently (sessions/tokens are exempt from soft deletion)
router.delete('/:token', async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM sessions WHERE token = $1',
      [req.params.token]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session token permanently purged from LedgerApp' });
  } catch (err) {
    res.status(500).json({ error: 'Session delete failed' });
  }
});

module.exports = router;
