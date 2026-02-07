const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { uploadImages, listImages, deleteImage } = require('../controllers/eventImageController');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ROLES = require('../config/roles');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 mb limit 
});

router.post('/:id/images', requireAuth, requireRole([ROLES.ADMIN]), upload.array('images', 10), uploadImages);
router.get('/:id/images', listImages);
router.delete('/images/:id', requireAuth, requireRole([ROLES.ADMIN]), deleteImage);

module.exports = router;
