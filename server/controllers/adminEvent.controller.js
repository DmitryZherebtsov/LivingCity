const pool = require('../config/dbConfig');

exports.getPendingEvents = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT e.*, o.name AS organization_name
       FROM events e
       LEFT JOIN organizations o ON e.organization_id = o.id
       WHERE e.status = 'pending'
       ORDER BY e.created_at ASC`
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['approved', 'rejected', 'cancelled', 'active'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const r = await pool.query(
      `UPDATE events SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
