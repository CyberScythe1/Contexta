const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    // Verify Google Token (mocked if no client ID is present, to allow development without APIs)
    let email, name, picture;
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      // Mock logic for local dev without API keys
      email = 'dev@example.com';
      name = 'Dev User';
      picture = '';
    }

    // Upsert User
    const userQuery = `
      INSERT INTO users (email, name, avatar_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET name = $2, avatar_url = $3
      RETURNING *;
    `;
    let user;
    try {
      if (process.env.DATABASE_URL) {
        const result = await db.query(userQuery, [email, name, picture]);
        user = result.rows[0];
      } else {
        user = { id: 'mock-uuid', email, name, role: 'USER' };
      }
    } catch (e) {
       console.error("DB Error", e);
       user = { id: 'mock-uuid', email, name, role: 'USER' };
    }

    // Generate custom JWT
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { googleLogin };
