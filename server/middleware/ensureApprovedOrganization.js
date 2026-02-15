const db = require('../config/db');

async function ensureApprovedOrganization(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    
    const result = await db.query(
      `
      SELECT 
        o.id AS organization_id,
        o.status,
        oz.role AS organizator_role
      FROM organizators oz
      JOIN organizations o ON oz.organization_id = o.id
      JOIN users u ON oz.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE oz.user_id = $1
        AND r.name = 'organizer'
        AND oz.is_active = true
      LIMIT 1
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        error: 'You are not linked to any organization'
      });
    }

    const org = result.rows[0];

    if (org.status !== 'approved') {
      return res.status(403).json({
        error: 'Organization is not approved yet'
      });
    }

    req.organizationId = org.organization_id;
    req.organizatorRole = org.organizator_role;

    next();

  } catch (err) {
    console.error('ensureApprovedOrganization error:', err);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

module.exports = ensureApprovedOrganization;
