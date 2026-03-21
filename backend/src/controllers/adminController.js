const db = require('../config/db');

const getStats = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
       return res.json({ totalUsers: 3, totalDocs: 15, totalQueries: 42 });
    }

    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    const totalDocs = await db.query('SELECT COUNT(*) FROM documents');
    const totalQueries = await db.query('SELECT COUNT(*) FROM messages WHERE role = $1', ['user']);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalDocs: parseInt(totalDocs.rows[0].count),
      totalQueries: parseInt(totalQueries.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logic fetch stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
       return res.json([
         { id: '1', name: 'Admin', email: 'admin@local', role: 'ADMIN' },
         { id: '2', name: 'Test User', email: 'test@local', role: 'USER' }
       ]);
    }
    const result = await db.query('SELECT id, name, email, avatar_url, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to logic fetch users' });
  }
};

module.exports = { getStats, getUsers };
