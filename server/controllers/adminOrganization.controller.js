const db = require("../config/dbConfig");
const {
  sendApprovedEmail,
  sendRejectedEmail,
} = require("../services/emailService");

exports.getOrganizations = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT id, name, slug, description, website, contact_email,
             phone, address, city, logo_url, nip_krs,
             metadata, status, created_at
      FROM organizations
    `;

    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE status = $1`;
    }

    query += ` ORDER BY created_at ASC`;

    const result = await db.query(query, params);
    return res.json(result.rows);

  } catch (err) {
    console.error("getOrganizations error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateOrganizationStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, reason } = req.body;


    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const orgRes = await db.query(
      `SELECT * FROM organizations WHERE id = $1`,
      [id]
    );

    if (!orgRes.rows.length) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const org = orgRes.rows[0];

    if (org.status === status) {
      return res.status(400).json({
        error: "Organization already has this status",
      });
    }

    await db.query(
      `UPDATE organizations
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [status, id]
    );


    if (org.contact_email && status !== "pending") {
      try {
        if (status === "approved") {
          await sendApprovedEmail(org.contact_email, {
            recipient_name: org.name,
            entity_type: "organizacja",
            entity_name: org.name,
            cta_url: `${process.env.SITE_URL}/organizations/${org.id}`,
            cta_text: "Zobacz profil",
          });
        }

        if (status === "rejected") {
          await sendRejectedEmail(org.contact_email, {
            to_email: org.contact_email,
            recipient_name: org.name,
            entity_type: "organizacja",
            entity_name: org.name,
            reason: reason || "Nie podano powodu.",
            cta_url: `${process.env.SITE_URL}/profile`,
            cta_text: "Uzupełnij dane",
          });
        }
      } catch (emailErr) {
        console.error(
          "Organization email failed:",
          emailErr.response?.data || emailErr.message
        );
      }
    }

    return res.json({ message: `Organization ${status}` });

  } catch (err) {
    console.error("updateOrganizationStatus error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};





// exports.getPendingOrganizations = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT id, name, slug, description, website, contact_email, phone, address, city, logo_url, nip_krs, metadata, status, created_at
//         FROM organizations
//         WHERE status = 'pending'
//         ORDER BY created_at ASC;
//       `
//     );

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };