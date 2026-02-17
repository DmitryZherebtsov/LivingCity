const pool = require("../config/dbConfig");
const {
  sendApprovedEmail,
  sendRejectedEmail,
} = require("../services/emailService");

exports.getPendingEvents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, o.name AS organization_name
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      WHERE e.status = 'pending'
      ORDER BY e.created_at ASC
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error("getPendingEvents error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, reason } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    if (!["approved", "rejected", "cancelled", "active"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateResult = await pool.query(
      `UPDATE events
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (!updateResult.rows.length) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = updateResult.rows[0];

    let orgEmail = null;
    let orgName = null;

    if (event.organization_id) {
      const orgResult = await pool.query(
        `SELECT name, contact_email
         FROM organizations
         WHERE id = $1
         LIMIT 1`,
        [event.organization_id]
      );

      if (orgResult.rows.length) {
        orgEmail = orgResult.rows[0].contact_email;
        orgName = orgResult.rows[0].name;
      }
    }

    if (orgEmail) {
      try {
        if (status === "approved") {
          await sendApprovedEmail(orgEmail, {
            recipient_name: orgName || "",
            entity_type: "wydarzenie",
            entity_name: event.title,
            cta_url: `${process.env.SITE_URL}/events/${event.id}`,
            cta_text: "Zobacz wydarzenie",
          });
        }

        if (status === "rejected") {
          await sendRejectedEmail(orgEmail, {
            recipient_name: orgName || "",
            entity_type: "wydarzenie",
            entity_name: event.title,
            reason: reason || "Nie podano powodu.",
            cta_url: `${process.env.SITE_URL}/events/${event.id}/edit`,
            cta_text: "Edytuj wydarzenie",
          });
        }
      } catch (emailError) {
        console.error(
          "Event email failed:",
          emailError.response?.data || emailError.message
        );
      }
    }

    return res.json(event);

  } catch (err) {
    console.error("updateEventStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};








// exports.updateEventStatus = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id, 10);
//     const { status } = req.body;
//     if (!['approved', 'rejected', 'cancelled', 'active'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }
//     const r = await pool.query(
//       `UPDATE events SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
//       [status, id]
//     );
//     if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
//     res.json(r.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
