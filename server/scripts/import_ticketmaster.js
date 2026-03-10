require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');
const pool = require('../config/dbConfig');

const TM_KEY = process.env.TM_KEY;
if (!TM_KEY) {
  console.error('Nie znalieziono TM_KEY w pliku .env');
  process.exit(1);
}

const PAGE_SIZE = 50;
const MAX_PAGES = 3;

const UPLOAD_BASE = path.join(__dirname, '..', 'uploads');
const EVENT_DIR = (eventId) => path.join(UPLOAD_BASE, 'events', String(eventId));

if (!fs.existsSync(path.join(UPLOAD_BASE, 'events'))) {
  fs.mkdirSync(path.join(UPLOAD_BASE, 'events'), { recursive: true });
}

const MAX_IMAGES_PER_EVENT = 4;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function sha1hex(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function canonicalImageIdFromUrl(url) {
  const match = url.match(/\/([0-9a-f-]{30,})_/i);
  if (match && match[1]) return match[1];
  return sha1hex(url);
}

async function fetchPage(page) {
  const url = 'https://app.ticketmaster.com/discovery/v2/events.json';

  const params = {
    apikey: TM_KEY,
    countryCode: 'PL',
    size: PAGE_SIZE,
    page,
    sort: 'date,asc',
    locale: 'pl-PL'
  };

  const res = await axios.get(url, { params, timeout: 15000 });
  return res.data._embedded?.events || [];
}

async function titleExists(title) {
  const res = await pool.query(
    `SELECT id FROM events WHERE title = $1 LIMIT 1`,
    [title]
  );
  return res.rows.length > 0;
}

async function insertEvent(mapped) {
  const res = await pool.query(
    `INSERT INTO events
     (title, description, event_type, url, organizer,
      address, city, lon, lat,
      start_time, end_time, is_free,
      metadata, source, source_id,
      created_at, updated_at)
     VALUES
     ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now(), now())
     ON CONFLICT (source, source_id) DO NOTHING
     RETURNING id`,
    [
      mapped.title,
      mapped.description,
      mapped.event_type,
      mapped.url,
      mapped.organizer,
      mapped.address,
      mapped.city,
      mapped.lon,
      mapped.lat,
      mapped.start_time,
      mapped.end_time,
      mapped.is_free,
      null,
      'ticketmaster',
      mapped.source_id
    ]
  );

  return res.rows[0]?.id || null;
}

async function upsertEventImage(eventId, filename, mime, size, position) {
  await pool.query(
    `INSERT INTO event_images (event_id, filename, mime, size, position)
     VALUES ($1,$2,$3,$4,$5)`,
    [eventId, filename, mime, size, position]
  );
}

async function ensureDownloadedImage(eventId, url) {
  const canonical = canonicalImageIdFromUrl(url);
  const filename = `${canonical}.jpg`;
  const eventDir = EVENT_DIR(eventId);

  if (!fs.existsSync(eventDir)) fs.mkdirSync(eventDir, { recursive: true });

  const filePath = path.join(eventDir, filename);

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return { filename, size: stats.size, mime: 'image/jpeg' };
  }

  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = await sharp(resp.data)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  fs.writeFileSync(filePath, buffer);
  const stats = fs.statSync(filePath);

  return { filename, size: stats.size, mime: 'image/jpeg' };
}

function mapEvent(tmEvent) {
  const venue = tmEvent._embedded?.venues?.[0] || {};
  const attraction = tmEvent._embedded?.attractions?.[0] || {};

  let start_time = tmEvent.dates?.start?.dateTime || null;

  if (!start_time && tmEvent.dates?.start?.localDate) {
    start_time = tmEvent.dates.start.localDate + "T00:00:00";
  }

  if (!start_time) return null;

  let end_time =
    tmEvent.dates?.end?.dateTime ||
    tmEvent.sales?.public?.endDateTime ||
    null;

  return {
    title: tmEvent.name,
    description: tmEvent.info || tmEvent.description || "",
    event_type: tmEvent.classifications?.[0]?.segment?.name || null,
    url: tmEvent.url || null,
    organizer: attraction.name || null,
    address: venue.address?.line1 || null,
    city: venue.city?.name || null,
    lon: venue.location?.longitude || null,
    lat: venue.location?.latitude || null,
    start_time,
    end_time,
    is_free: false,
    source_id: tmEvent.id
  };
}

async function processEvents() {
  console.log("Start import...");

  let imported = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const events = await fetchPage(page);
    if (!events.length) break;

    for (const ev of events) {
      const mapped = mapEvent(ev);
      if (!mapped) continue;

      // if (mapped.event_type === 'Muzyka') continue;

      if (await titleExists(mapped.title)) continue;

      const eventId = await insertEvent(mapped);
      if (!eventId) continue;

      console.log(`Dodano: ${mapped.title}`);

      const images = (ev.images || []).slice(0, MAX_IMAGES_PER_EVENT);

      let pos = 0;
      for (const img of images) {
        const { filename, size, mime } =
          await ensureDownloadedImage(eventId, img.url);
        await upsertEventImage(eventId, filename, mime, size, pos++);
      }

      imported++;
      await sleep(200);
    }
  }

  console.log(`Import finished. Total imported: ${imported}`);
  process.exit(0);
}

processEvents().catch(err => {
  console.error(err);
  process.exit(1);
});