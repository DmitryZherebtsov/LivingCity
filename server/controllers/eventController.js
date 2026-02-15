const eventModel = require('../models/eventModel');
const pool = require('../config/dbConfig');

const validateCoords = (lon, lat) => {
  if (lon === undefined || lat === undefined) return false;
  const ln = Number(lon), la = Number(lat);
  if (Number.isNaN(ln) || Number.isNaN(la)) return false;
  return ln >= -180 && ln <= 180 && la >= -90 && la <= 90;
};

const create = async (req, res) => {
  try {
    const body = req.body;

    if (!body.title) return res.status(400).json({ error: 'title is required' });
    if (!validateCoords(body.lon, body.lat)) return res.status(400).json({ error: 'valid lon and lat are required' });

    let organization_id = null;
    if (req.user && req.user.id) {
      const r = await require('../config/dbConfig').query(
        `SELECT organization_id FROM organizators WHERE user_id = $1 LIMIT 1`,
        [req.user.id]
      );
      if (r.rows.length) organization_id = r.rows[0].organization_id;
    }

    const payload = {
      ...body,
      status: 'pending',
      organization_id,
      created_by: req.user ? req.user.id : null
    };

    const event = await eventModel.createEvent(payload);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


const list = async (req, res) => {
  try {
    const { page, limit, event_type, q, lat, lon, radius_km, status } = req.query;
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? Math.min(parseInt(limit, 10), 200) : undefined,
      event_type,
      qtext: q,
      status 
    };

    if (lat !== undefined && lon !== undefined && radius_km !== undefined) {
      options.lat = parseFloat(lat);
      options.lon = parseFloat(lon);
      options.radius_km = parseFloat(radius_km);
    }

    const rows = await eventModel.getEvents(options);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await eventModel.getEventById(id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
const getMyEvents = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const r = await pool.query(
      `SELECT organization_id 
       FROM organizators 
       WHERE user_id = $1 
       LIMIT 1`,
      [req.user.id]
    );

    if (!r.rows.length) {
      return res.json([]);
    }

    const organizationId = r.rows[0].organization_id;

    const events = await pool.query(
      `SELECT *
       FROM events
       WHERE organization_id = $1
       ORDER BY created_at DESC`,
      [organizationId]
    );

    res.json(events.rows);
  } catch (err) {
    console.error("getMyEvents error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body;

    if ((body.lon !== undefined || body.lat !== undefined) && !validateCoords(body.lon, body.lat)) {
      return res.status(400).json({ error: 'valid lon and lat are required' });
    }

    const updated = await eventModel.updateEvent(id, body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await eventModel.deleteEvent(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const incrementVisitors = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedEvent = await eventModel.incrementVisitorCount(id);
    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    if (err.message === 'Event not found') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  incrementVisitors,
  getMyEvents
};