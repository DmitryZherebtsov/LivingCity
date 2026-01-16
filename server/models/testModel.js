const pool = require('../config/dbConfig');

// CREATE
const createTestItem = async (title) => {
  const result = await pool.query(
    'INSERT INTO test_items (title) VALUES ($1) RETURNING *',
    [title]
  );
  return result.rows[0];
};

// READ ALL
const getAllTestItems = async () => {
  const result = await pool.query(
    'SELECT * FROM test_items ORDER BY id'
  );
  return result.rows;
};

// READ ONE
const getTestItemById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM test_items WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// UPDATE
const updateTestItem = async (id, title) => {
  const result = await pool.query(
    'UPDATE test_items SET title = $1 WHERE id = $2 RETURNING *',
    [title, id]
  );
  return result.rows[0];
};

// DELETE
const deleteTestItem = async (id) => {
  await pool.query(
    'DELETE FROM test_items WHERE id = $1',
    [id]
  );
};

module.exports = {
  createTestItem,
  getAllTestItems,
  getTestItemById,
  updateTestItem,
  deleteTestItem
};
