const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const eventModel = require('../models/eventModel'); 
const eventImageModel = require('../models/eventImageModel');

const UPLOAD_BASE = path.join(__dirname, '..', 'uploads', 'events'); 

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const uploadImages = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) return res.status(400).json({ error: 'invalid event id' });

    const evt = await eventModel.getById ? await eventModel.getById(eventId) : true;
    if (!evt) return res.status(404).json({ error: 'Event not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const saved = [];
    const eventDir = path.join(UPLOAD_BASE, String(eventId));
    ensureDir(eventDir);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (!file.mimetype.startsWith('image/')) continue;

      const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
      const filename = `${Date.now()}-${uuidv4()}.${ext}`;
      const outPath = path.join(eventDir, filename);

      if (ext === 'jpg') {
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 300 })
          .jpeg({ quality: 80, chromaSubsampling: '4:4:4' })
          .toFile(outPath);
      } else {
        await sharp(file.buffer)
          .rotate()
          .resize({ width: 300 })
          .png({ compressionLevel: 8 })
          .toFile(outPath);
      }

      const publicUrl = `/uploads/events/${eventId}/${filename}`;

      const record = await eventImageModel.createImage({
        event_id: eventId,
        image_url: publicUrl,
        mime: file.mimetype,
        size: fs.statSync(outPath).size,
      });

      saved.push(record);
    }

    return res.json({ success: true, images: saved });
  } catch (err) {
    console.error('uploadImages error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const listImages = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (Number.isNaN(eventId)) return res.status(400).json({ error: 'invalid event id' });
    const images = await eventImageModel.getImagesByEvent(eventId);
    return res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });

    const img = await eventImageModel.removeImage(id);
    if (!img) return res.status(404).json({ error: 'Not found' });

    const filepath = path.join(__dirname, '..', img.image_url);
    const absPath = path.join(__dirname, '..', img.image_url);
    if (fs.existsSync(absPath)) {
      try { fs.unlinkSync(absPath); } catch (e) { console.warn('failed to unlink', absPath, e); }
    }

    return res.json({ success: true, image: img });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadImages,
  listImages,
  deleteImage,
};
