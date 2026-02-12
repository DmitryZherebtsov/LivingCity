const pool = require('../config/dbConfig');

const createPublicUser = async ({ email, name, passwordHash }) => {
  let roleRes = await pool.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', ['user']);
  let roleId;
  if (roleRes.rows.length === 0) {
    const insertRole = await pool.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', ['user']);
    roleId = insertRole.rows[0].id;
  } else {
    roleId = roleRes.rows[0].id;
  }

  const q = `
    INSERT INTO users (email, name, password_hash, role_id, is_active)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id, email, name, role_id, profile_image;
  `;
  const res = await pool.query(q, [email, name, passwordHash, roleId]);
  return res.rows[0];
};

const setProfileImage = async (userId, relativePath) => {
  const q = `UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING profile_image`;
  const res = await pool.query(q, [relativePath, userId]);
  return res.rows[0];
};

module.exports = {
  createPublicUser,
  setProfileImage
};
