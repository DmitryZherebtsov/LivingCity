const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const { hashToken, refreshTokenExpiryDate } = require('../utils/tokenUtil');

const findUserByEmail = async (email) => {
  const q = `
    SELECT u.id, u.email, u.name, u.role_id, r.name AS role_name, u.password_hash, u.is_active
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.email) = LOWER($1)
    LIMIT 1;
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

const createUser = async ({ email, name, passwordHash }) => {
  const q = `
    INSERT INTO users (email, name, password_hash, role_id, is_active)
    VALUES (
      $1,
      $2,
      $3,
      (SELECT id FROM roles WHERE name = 'moderator' LIMIT 1),
      true
    )
    RETURNING id, email, name, role_id;
  `;
  const res = await pool.query(q, [email, name, passwordHash]);
  return res.rows[0];
};



module.exports = {
  findUserByEmail,
  saveRefreshToken,
  revokeAllUserRefreshTokens,
  createUser
};

