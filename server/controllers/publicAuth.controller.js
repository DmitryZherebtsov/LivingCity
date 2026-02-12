const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const sharp = require('sharp');

const publicService = require('../auth/publicAuth.service');
const authService = require('../auth/auth.service'); 
const { generateAccessToken, generateRefreshTokenPlain } = require('../utils/tokenUtil');

const UPLOAD_BASE = path.join(__dirname, '..', 'uploads', 'users');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const existing = await authService.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'User with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await publicService.createPublicUser({ email, name, passwordHash });

    if (req.file && req.file.buffer) {
      ensureDir(path.join(UPLOAD_BASE, String(user.id)));
      const filename = `${Date.now()}-${uuidv4()}.jpg`;
      const outPath = path.join(UPLOAD_BASE, String(user.id), filename);

      await sharp(req.file.buffer)
        .resize(256, 256, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outPath);

      await publicService.setProfileImage(user.id, filename);
      user.profile_image = filename;
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: 'user' });
    const refreshPlain = generateRefreshTokenPlain();

    await authService.saveRefreshToken(user.id, refreshPlain, req.ip || null, req.get('User-Agent') || null);

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, profile_image: user.profile_image || null },
      tokens: { accessToken, refreshToken: refreshPlain }
    });

  } catch (err) {
    console.error('Public register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register
};
