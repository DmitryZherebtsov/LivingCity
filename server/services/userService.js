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

module.exports = { listUsers };