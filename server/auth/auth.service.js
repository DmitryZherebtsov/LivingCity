const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const { hashToken, refreshTokenExpiryDate } = require('../utils/tokenUtil');

const findUserByEmail = async (email) => {
  const q = `
    SELECT u.*, r.name AS role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
    LIMIT 1
  `;
  const res = await pool.query(q, [email]);
  return res.rows[0];
};


async function saveRefreshToken(userId, refreshTokenPlain, ip = null, userAgent = null) {
  const tokenHash = hashToken(refreshTokenPlain);
  const expiresAt = refreshTokenExpiryDate();
  const q = `INSERT INTO refresh_tokens (user_id, token_hash, ip, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5) RETURNING id, expires_at`;
  const res = await pool.query(q, [userId, tokenHash, ip, userAgent, expiresAt]);
  return res.rows[0];
}

const revokeAllUserRefreshTokens = async (userId) => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
    [userId]
  );
};


module.exports = {
  findUserByEmail,
  saveRefreshToken,
  revokeAllUserRefreshTokens
};

