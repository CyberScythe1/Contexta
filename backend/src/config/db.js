const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A helper for ensuring the schema exists. In production, use migrations.
const initializeDatabase = async () => {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = await pool.connect();
    // we would run schema.sql here or manually. For now, just connect.
    console.log('Connected to PostgreSQL');
    client.release();
  } catch (err) {
    console.error('Database connection error', err.stack);
  }
};

initializeDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
