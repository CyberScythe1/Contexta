require('dotenv').config();
const db = require('./src/config/db');

async function run() {
  try {
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN DEFAULT FALSE');
    console.log('Successfully altered users table!');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
