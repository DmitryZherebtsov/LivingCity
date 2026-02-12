const pool = require('../config/dbConfig');

const listUsers = async () => {
  const q = `
    SELECT u.id, u.email, u.name, u.is_active, u.created_at, r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
  `;
  const res = await pool.query(q);
  return res.rows;
};

const updateUser = async (id, { email, name, roleId, isActive }) => {
  const q = `
    UPDATE users
    SET
      email = COALESCE($2, email),
      name = COALESCE($3, name),
      role_id = COALESCE($4, role_id),
      is_active = COALESCE($5, is_active)
    WHERE id = $1
    RETURNING id, email, name, is_active
  `;
  const res = await pool.query(q, [id, email, name, roleId, isActive]);
  return res.rows[0];
};

const softDeleteUser = async (id) => {  // for admin to "deactivate" a user without removing their data? TODO
  const q = `
    UPDATE users
    SET is_active = false
    WHERE id = $1
    RETURNING id
  `;
  const res = await pool.query(q, [id]);
  return res.rows[0];
};

const deleteUser = async (id) => {
  const q = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
  `;
  const res = await pool.query(q, [id]);
  return res.rows[0];
};

const getUserById = async (id) => {
  const q = `
    SELECT id, email, name, password_hash, profile_image
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const res = await pool.query(q, [id]);
  return res.rows[0];
};

const updateUserProfile = async (id, { name, email, passwordHash, profile_image }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }

  if (email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }

  if (passwordHash) {
    fields.push(`password_hash = $${idx++}`);
    values.push(passwordHash);
  }

  if (profile_image) {
    fields.push(`profile_image = $${idx++}`);
    values.push(profile_image);
  }

  if (fields.length === 0) return null;

  const q = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, email, name, profile_image
  `;

  values.push(id);

  const res = await pool.query(q, values);
  return res.rows[0];
};


module.exports = { 
  listUsers,
  updateUser,
  deleteUser,
  softDeleteUser,
  getUserById,
  updateUserProfile
};