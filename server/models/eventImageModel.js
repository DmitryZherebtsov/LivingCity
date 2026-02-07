const pool = require('../config/dbConfig');

const createImage = async ({ event_id, filename, mime, size, position = 0 }) => {
  const sql = `INSERT INTO event_images (event_id, filename, mime, size, position)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const values = [event_id, filename, mime, size, position];
  const { rows } = await pool.query(sql, values);
  return rows[0];
};

const getImagesByEvent = async (event_id) => {
  const { rows } = await pool.query(
    'SELECT id, event_id, filename, mime, size, position, created_at FROM event_images WHERE event_id = $1 ORDER BY position, id',
    [event_id]
  );
  return rows;
};

const removeImage = async (id) => {
  const { rows } = await pool.query('DELETE FROM event_images WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

module.exports = {
  createImage,
  getImagesByEvent,
  removeImage,
};
