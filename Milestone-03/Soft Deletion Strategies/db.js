const { Pool } = require('pg');
require('dotenv').config();

// Pool configuration using DB_URL from environment variables
let pool = new Pool({
  connectionString: process.env.DB_URL,
});

// Logs connection errors for debugging
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  // Direct execution Helper
  query: (text, params) => pool.query(text, params),
  // Helper to retrieve the active pool
  getPool: () => pool,
  // Helper to swap pool for testing environments
  setPool: (newPool) => {
    pool = newPool;
  },
};
