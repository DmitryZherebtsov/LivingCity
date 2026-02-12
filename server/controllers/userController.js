const userService = require('../services/userService');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_BASE = path.join(__dirname, '..', 'uploads', 'users');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const list = async (req, res) => {
  try {
    const users = await userService.listUsers();
    return res.json(users);
  } catch (err) {
    console.error('List users error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, roleId, isActive } = req.body;

    const updated = await userService.updateUser(id, {
      email,
      name,
      roleId,
      isActive
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(updated);
  } catch (err) {
    console.error('Update user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete user error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    console.error('Get me error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id; 
    const { name, email, password } = req.body;

    let passwordHash = null;

    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    let newFilename = null;

    if (req.file && req.file.buffer) {
      ensureDir(path.join(UPLOAD_BASE, String(userId)));

      newFilename = `${Date.now()}-${uuidv4()}.jpg`;
      const outPath = path.join(UPLOAD_BASE, String(userId), newFilename);

      await sharp(req.file.buffer)
        .resize(256, 256, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outPath);


      const existing = await userService.getUserById(userId);
      if (existing && existing.profile_image) {
        const oldPath = path.join(
          UPLOAD_BASE,
          String(userId),
          existing.profile_image
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updated = await userService.updateUserProfile(userId, {
      name,
      email,
      passwordHash,
      profile_image: newFilename
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      profile_image: updated.profile_image
    });

  } catch (err) {
    console.error('UpdateMe error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { password, hard } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    if (hard === true || hard === 'true') {
      await userService.deleteUser(userId);

      const dir = path.join(UPLOAD_BASE, String(userId));
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } else {
      await userService.softDeleteUser(userId);
    }

    return res.json({ message: 'Account deleted' });

  } catch (err) {
    console.error('DeleteMe error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  list,
  update,
  remove,
  updateMe,
  deleteMe,
  getMe
};
