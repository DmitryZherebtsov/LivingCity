const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const { hashToken, refreshTokenExpiryDate } = require('../utils/tokenUtil');

async function findUserByEmail(email) {
  const res = await pool.query('SELECT id, email, password_hash, role_id, is_active FROM users WHERE email = $1 LIMIT 1', [email]);
  return res.rows[0];
}

async function saveRefreshToken(userId, refreshTokenPlain, ip = null, userAgent = null) {
  const tokenHash = hashToken(refreshTokenPlain);
  const expiresAt = refreshTokenExpiryDate();
  const q = `INSERT INTO refresh_tokens (user_id, token_hash, ip, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5) RETURNING id, expires_at`;
  const res = await pool.query(q, [userId, tokenHash, ip, userAgent, expiresAt]);
  return res.rows[0];
}

module.exports = {
  findUserByEmail,
  saveRefreshToken
};
