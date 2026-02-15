const pool = require('../config/dbConfig');


const createEvent = async (data) => {
  const {
    title,
    description,
    event_type,
    url,
    organizer,
    address,
    city,
    lon,
    lat,
    start_time,
    end_time,
    capacity,
    is_free,
    metadata = {},
    visitor_count = 0,
    status = 'active',
    organization_id = null,
    created_by = null
  } = data;

  const q = `
    INSERT INTO events
      (title, description, event_type, url, organizer, address, city, lon, lat, start_time, end_time, capacity, is_free, metadata, visitor_count, status, organization_id, created_by)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    RETURNING *;
  `;

  const values = [title, description, event_type, url, organizer, address, city, lon, lat, start_time, end_time, capacity, is_free, metadata, visitor_count, status, organization_id, created_by];

  const res = await pool.query(q, values);
  return res.rows[0];
};



const getEvents = async ({ page, limit, event_type, qtext, lat, lon, radius_km, status, includeAllStatuses = false } = {}) => {
  const params = [];
  let where = 'WHERE 1=1';

  if (status) {
    params.push(status);
    where += ` AND e.status = $${params.length}`;
  } else {
    params.push('approved');
    where += ` AND e.status = $${params.length}`;
  }

  if (event_type) {
    params.push(event_type);
    where += ` AND e.event_type = $${params.length}`;
  }

  if (qtext) {
    params.push(`%${qtext}%`);
    where += ` AND (e.title ILIKE $${params.length} OR e.description ILIKE $${params.length} OR e.organizer ILIKE $${params.length})`;
  }

  if (organization_id) {
    params.push(organization_id);
    where += ` AND e.organization_id = $${params.length}`;
  }

  if (!includeAllStatuses) {
    params.push('approved');
    where += ` AND e.status = $${params.length}`;
  }


  if (lat !== undefined && lon !== undefined && radius_km !== undefined) {
    params.push(lat, lon, radius_km);
    const idx = params.length - 2; 
    where += ` AND (
      6371 * acos(
        cos(radians($${idx})) * cos(radians(e.lat)) *
        cos(radians(e.lon) - radians($${idx+1})) +
        sin(radians($${idx})) * sin(radians(e.lat))
      )
    ) <= $${idx+2}`;
  }

  let q = `
    SELECT
      e.*,
      img.first_image,
      COALESCE(img.images, '[]') AS images
    FROM events e
    LEFT JOIN LATERAL (
      SELECT
        (SELECT row_to_json(i) FROM (
          SELECT id, filename, position
          FROM event_images ie1
          WHERE ie1.event_id = e.id
          ORDER BY position, id
          LIMIT 1
        ) i) AS first_image,
        (SELECT json_agg(row_to_json(ii)) FROM (
          SELECT id, filename, position
          FROM event_images ie2
          WHERE ie2.event_id = e.id
          ORDER BY position, id
        ) ii) AS images
    ) img ON true
    ${where}
    ORDER BY e.start_time NULLS LAST, e.created_at DESC
  `;

  if (page !== undefined && limit !== undefined) {
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    q += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;
  } else {
    q += ';';
  }

  const rows = (await pool.query(q, params)).rows;
  return rows;
};


const getEventById = async (id) => {
  const q = `
    SELECT
      e.*,
      img.first_image,
      COALESCE(img.images, '[]') AS images
    FROM events e
    LEFT JOIN LATERAL (
      SELECT
        (SELECT row_to_json(i) FROM (
          SELECT id, filename, position
          FROM event_images ie1
          WHERE ie1.event_id = e.id
          ORDER BY position, id
          LIMIT 1
        ) i) AS first_image,
        (SELECT json_agg(row_to_json(ii)) FROM (
          SELECT id, filename, position
          FROM event_images ie2
          WHERE ie2.event_id = e.id
          ORDER BY position, id
        ) ii) AS images
    ) img ON true
    WHERE e.id = $1
    LIMIT 1;
  `;
  const res = await pool.query(q, [id]);
  if (res.rows.length === 0) throw new Error('Event not found');
  return res.rows[0];
};


const updateEvent = async (id, data) => {

  const allowed = ['title','description','event_type','url','organizer','address',
    'city','lon','lat','start_time','end_time','capacity','is_free','metadata','visitor_count',
  'status','organization_id'];

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

  if (sets.length === 0) {
    return getEventById(id); 
  }

  sets.push(`updated_at = now()`);

  values.push(id);
  const q = `UPDATE events SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`;
  const res = await pool.query(q, values);
  return res.rows[0] || null; 
};

const deleteEvent = async (id) => {
  await pool.query('DELETE FROM events WHERE id = $1', [id]);
  return true;
};

const incrementVisitorCount = async (id) => {
  const q = `
    UPDATE events
    SET visitor_count = visitor_count + 1,
        updated_at = now()
    WHERE id = $1
    RETURNING *;
  `;
  const res = await pool.query(q, [id]);
  if (res.rows.length === 0) throw new Error('Event not found');
  return res.rows[0];
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  incrementVisitorCount,
};
