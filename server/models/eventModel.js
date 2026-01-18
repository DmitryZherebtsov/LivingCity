const pool = require('../config/dbConfig');

// Create
// Create
const createEvent = async (data) => {
  const {
    title,
    description,
    event_type,
    url,
    organizer,
    address,
    lon,
    lat,
    start_time,
    end_time,
    capacity,
    is_free,
    metadata = {},
    visitor_count = 0, // <- нове поле
  } = data;

  const q = `
    INSERT INTO events
      (title, description, event_type, url, organizer, address, lon, lat, start_time, end_time, capacity, is_free, metadata, visitor_count)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *;
  `;

  const values = [title, description, event_type, url, organizer, address, lon, lat, start_time, end_time, capacity, is_free, metadata, visitor_count];

  const res = await pool.query(q, values);
  return res.rows[0];
};

// Read list with pagination, filters, and optional nearby search (lat, lon, radius_km)
const getEvents = async ({ page = 1, limit = 20, event_type, qtext, lat, lon, radius_km } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';

  if (event_type) {
    params.push(event_type);
    where += ` AND event_type = $${params.length}`;
  }

  if (qtext) {
    params.push(`%${qtext}%`);
    where += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR organizer ILIKE $${params.length})`;
  }

  if (lat !== undefined && lon !== undefined && radius_km !== undefined) {
    params.push(lat, lon, radius_km);
    const idx = params.length - 2; // starting index of lat
    where += ` AND (
      6371 * acos(
        cos(radians($${idx})) * cos(radians(lat)) *
        cos(radians(lon) - radians($${idx+1})) +
        sin(radians($${idx})) * sin(radians(lat))
      )
    ) <= $${idx+2}`;
  }

  params.push(limit, offset);
  const q = `
    SELECT *
    FROM events
    ${where}
    ORDER BY start_time NULLS LAST, created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;

  const rows = (await pool.query(q, params)).rows;

  return rows;
};

// Read one
const getEventById = async (id) => {
  const res = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  return res.rows[0];
};

// Update
const updateEvent = async (id, data) => {
  const allowed = ['title','description','event_type','url','organizer','address','lon','lat','start_time','end_time','capacity','is_free','metadata'];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sets.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (sets.length === 0) return getEventById(id);

  sets.push(`updated_at = now()`);

  values.push(id);
  const q = `UPDATE events SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
  const res = await pool.query(q, values);
  return res.rows[0];
};

// Delete
const deleteEvent = async (id) => {
  await pool.query('DELETE FROM events WHERE id = $1', [id]);
  return true;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
