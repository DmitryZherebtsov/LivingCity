const db = require("../config/dbConfig");

exports.getPendingOrganizations = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, slug, description, website, contact_email, phone, address, city, logo_url, nip_krs, metadata, status, created_at
        FROM organizations
        WHERE status = 'pending'
        ORDER BY created_at ASC;
      `
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateOrganizationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const org = await db.query(
      `SELECT status FROM organizations WHERE id = $1`,
      [id]
    );

    if (!org.rows.length) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.rows[0].status !== "pending") {
      return res.status(400).json({
        error: "Only pending organizations can be updated",
      });
    }

    await db.query(
      `UPDATE organizations
       SET status = $1,
           updated_at = now()
       WHERE id = $2`,
      [status, id]
    );

    res.json({ message: `Organization ${status}` });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
