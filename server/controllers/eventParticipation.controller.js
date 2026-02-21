const pool = require("../config/dbConfig");

exports.joinEvent = async (req, res) => {
  const userId = req.user.id; 
  const eventId = parseInt(req.params.eventId, 10);

  if (Number.isNaN(eventId)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const eventRes = await client.query(
      `SELECT capacity, visitor_count
       FROM events
       WHERE id = $1
       FOR UPDATE`,
      [eventId]
    );

    if (!eventRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Event not found" });
    }

    const { capacity, visitor_count } = eventRes.rows[0];

    if (capacity && visitor_count >= capacity) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Event is full" });
    }

    await client.query(
      `INSERT INTO event_participants (user_id, event_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, eventId]
    );

    await client.query(
      `UPDATE events
       SET visitor_count = visitor_count + 1
       WHERE id = $1`,
      [eventId]
    );

    await client.query("COMMIT");

    return res.json({ message: "Joined event" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("joinEvent error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};


exports.leaveEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = parseInt(req.params.eventId, 10);

  if (Number.isNaN(eventId)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deleteRes = await client.query(
      `DELETE FROM event_participants
       WHERE user_id = $1 AND event_id = $2
       RETURNING *`,
      [userId, eventId]
    );

    if (!deleteRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "You are not participating" });
    }

    await client.query(
      `UPDATE events
       SET visitor_count = GREATEST(visitor_count - 1, 0)
       WHERE id = $1`,
      [eventId]
    );

    await client.query("COMMIT");

    return res.json({ message: "Left event" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("leaveEvent error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};


exports.getMyEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT e.*
       FROM event_participants ep
       JOIN events e ON ep.event_id = e.id
       WHERE ep.user_id = $1
       ORDER BY ep.created_at DESC`,
      [userId]
    );

    return res.json(result.rows);

  } catch (err) {
    console.error("getMyEvents error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.checkParticipation = async (req, res) => {
  const userId = req.user.id;
  const eventId = parseInt(req.params.eventId, 10);

  if (Number.isNaN(eventId)) {
    return res.status(400).json({ error: "Invalid event id" });
  }

  try {
    const result = await pool.query(
      `SELECT 1
       FROM event_participants
       WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    return res.json({ going: result.rows.length > 0 });

  } catch (err) {
    console.error("checkParticipation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
