const eventModel = require('../models/eventModel');

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

    const event = await eventModel.createEvent(body);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const list = async (req, res) => {
  try {
    const { page, limit, event_type, q, lat, lon, radius_km } = req.query;
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? Math.min(parseInt(limit, 10), 200) : undefined,
      event_type,
      qtext: q,
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
};