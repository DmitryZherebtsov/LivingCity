const bcrypt = require('bcrypt');
const db = require('../config/dbConfig');
const { generateAccessToken, generateRefreshTokenPlain, refreshTokenExpiryDate, hashToken } = require('../utils/tokenUtil');
const slugify = require('slugify');

async function registerOrganizer(data) {
  const client = await db.connect();

  try {

    console.log("REGISTER BODY (service):", data);
    console.log("DATA FROM FRONT:", data);

    await client.query('BEGIN');

    const {
      email,
      password,
      fullName,      
      orgName,
      description,
      website,
      phone,
      city,
      address,
      nipKrs,
      logoUrl,
      contactEmail     
    } = data;


    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      throw new Error('User already exists');
    }

    const roleRes = await client.query(
      `SELECT id FROM roles WHERE name = 'organizer'`
    );

    if (!roleRes.rows.length) {
      throw new Error('Organizer role not found');
    }

    const roleId = roleRes.rows[0].id;

    const password_hash = await bcrypt.hash(password, 10);

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, role_id, is_active, created_at)
       VALUES ($1,$2,$3,true,now())
       RETURNING id, email`,
      [email, password_hash, roleId]
    );

    const user = userRes.rows[0];

    const baseSlug = slugify(orgName, { lower: true, strict: true });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingSlug = await client.query(
        `SELECT id FROM organizations WHERE slug = $1`,
        [slug]
      );

      if (!existingSlug.rows.length) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const orgRes = await client.query(
      `
      INSERT INTO organizations
      (
        name,
        slug,
        description,
        website,
        contact_email,
        phone,
        address,
        city,
        logo_url,
        nip_krs,
        metadata,
        status,
        created_at
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',now())
      RETURNING id
      `,
      [
        orgName,
        slug,
        description || '',
        website || '',
        contactEmail || email || null,
        phone || '',
        address || null,
        city || '',
        logoUrl || null,
        nipKrs || '',
        {}
      ]
    );



    const organization = orgRes.rows[0];

    await client.query(
      `INSERT INTO organizators
       (user_id, organization_id, role, is_active, created_at)
       VALUES ($1,$2,'owner',true,now())`,
      [user.id, organization.id]
    );

    await client.query('COMMIT');

    const accessToken = generateAccessToken({
      id: user.id,
      role: 'organizer'
    });

    const refreshToken = generateRefreshTokenPlain();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = refreshTokenExpiryDate();

    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, token_hash, expires_at, created_at)
       VALUES ($1,$2,$3,now())`,
      [user.id, tokenHash, expiresAt]
    );

    return {
      user,
      organizationId: organization.id,
      accessToken,
      refreshToken
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function loginOrganizer(email, password) {

  const userRes = await db.query(
    `
    SELECT u.*, r.name AS role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1
      AND r.name = 'organizer'
    `,
    [email]
  );

  if (!userRes.rows.length) {
    throw new Error('Invalid credentials');
  }

  const user = userRes.rows[0];

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const orgRes = await db.query(
    `
    SELECT o.id, o.status
    FROM organizators oz
    JOIN organizations o ON oz.organization_id = o.id
    WHERE oz.user_id = $1
    LIMIT 1
    `,
    [user.id]
  );

  if (!orgRes.rows.length) {
    throw new Error('Organization not found');
  }

  const organization = orgRes.rows[0];

  if (organization.status === 'pending') {
    const err = new Error('Organization pending approval');
    err.statusCode = 403;
    throw err;
  }

  if (organization.status === 'rejected') {
    const err = new Error('Organization rejected');
    err.statusCode = 403;
    throw err;
  }

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    roleName: 'organizer'
  });



  const refreshToken = generateRefreshTokenPlain();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = refreshTokenExpiryDate();

  await db.query(
    `
    INSERT INTO refresh_tokens 
    (user_id, token_hash, expires_at, created_at)
    VALUES ($1,$2,$3,now())
    `,
    [user.id, tokenHash, expiresAt]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role_name
    },
    organizationId: organization.id,
    accessToken,
    refreshToken
  };
}


module.exports = {
  registerOrganizer,
  loginOrganizer
};
