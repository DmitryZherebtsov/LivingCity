const db = require('../config/dbConfig');
const bcrypt = require('bcrypt');

async function registerOrganizer(data) {
  const {
    orgName,
    description,
    website,
    contactEmail,
    facebookLink,
    instagramLink,
    phoneNumber,
    logoUrl,
    profilePicUrl,
    userName,
    email,
    password
  } = data;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const roleRes = await client.query(
      `SELECT id FROM roles WHERE name = 'organizer' LIMIT 1`
    );

    if (!roleRes.rows.length) {
      throw new Error('Organizer role not found');
    }

    const roleId = roleRes.rows[0].id;

    const orgRes = await client.query(
      `
      INSERT INTO organizations
      (name, description, website, contact_email,
       facebook_link, instagram_link, phone_number,
       logo_url, profile_pic_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
      `,
      [
        orgName,
        description,
        website,
        contactEmail,
        facebookLink,
        instagramLink,
        phoneNumber,
        logoUrl,
        profilePicUrl
      ]
    );

    const organizationId = orgRes.rows[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `
      INSERT INTO users
      (email, password_hash, name, role_id,
       organization_id, organizer_status)
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        email,
        hashedPassword,
        userName,
        roleId,
        organizationId,
        'pending'
      ]
    );

    await client.query('COMMIT');

    return { message: 'Organizer registered successfully' };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function approveOrganizer(userId) {
  const result = await db.query(
    `
    UPDATE users
    SET organizer_status = 'approved'
    WHERE id = $1
    RETURNING id, email, organizer_status
    `,
    [userId]
  );

  if (!result.rows.length) {
    throw new Error('User not found');
  }

  return result.rows[0];
}

async function rejectOrganizer(userId) {
  const result = await db.query(
    `
    UPDATE users
    SET organizer_status = 'rejected'
    WHERE id = $1
    RETURNING id, email, organizer_status
    `,
    [userId]
  );

  if (!result.rows.length) {
    throw new Error('User not found');
  }

  return result.rows[0];
}

async function getPendingOrganizers() {
  const result = await db.query(
    `
    SELECT id, email, name, organizer_status
    FROM users
    WHERE organizer_status = 'pending'
    `
  );

  return result.rows;
}


module.exports = {
  registerOrganizer,
  approveOrganizer,
  rejectOrganizer,
  getPendingOrganizers
};
