const db = require('../config/dbConfig');

async function getOrganizationByUserId(userId) {
    const q = `
    SELECT
      o.id,
      o.name,
      o.slug,
      o.description,
      o.website,
      o.contact_email,
      o.phone,
      o.address,
      o.city,
      o.logo_url,
      o.nip_krs,
      o.metadata,
      o.status,
      o.created_at,
      o.updated_at
    FROM organizators oz
    JOIN organizations o ON oz.organization_id = o.id
    WHERE oz.user_id = $1
    LIMIT 1
  `;
    const res = await db.query(q, [userId]);
    return res.rows[0] || null;
}

async function updateOrganizationByUserId(userId, payload) {
  const allowed = ['name','website','contact_email','phone','address','city','nip_krs','logo_url','description','metadata'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, k)) {
      fields.push(k);
      values.push(payload[k]);
    }
  }

  if (!fields.length) {
    throw new Error('No valid fields to update');
  }

  const org = await getOrganizationByUserId(userId);
  if (!org) throw new Error('Organization not found for this user');

  const setClause = fields.map((f, i) => `${f} = $${i+1}`).join(', ');
  const queryParams = [...values, org.id];

  const q = `
    UPDATE organizations
    SET ${setClause}, updated_at = now()
    WHERE id = $${queryParams.length}
    RETURNING id, name, website, contact_email, phone, address, city, nip_krs, logo_url, description, metadata, status, created_at, updated_at
  `;

  const res = await db.query(q, queryParams);
  return res.rows[0];
}

module.exports = {
  getOrganizationByUserId,
  updateOrganizationByUserId
};
