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

const softDeleteUser = async (id) => { // only making unactive (withou real delete from db)
  const q = `
    UPDATE users
    SET is_active = false
    WHERE id = $1
    RETURNING id
  `;
  const res = await pool.query(q, [id]);
  return res.rows[0];
};

const deleteUser = async (id) => { // real delete from db
  const q = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
  `;
  const res = await pool.query(q, [id]);
  return res.rows[0];
};

module.exports = { 
  listUsers,
  updateUser,
  deleteUser,
  softDeleteUser
};