const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const multer = require('multer');
const ROLES = require('../config/roles');

const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }// czyli 2MB
});

router.get('/', requireAuth, requireRole([ROLES.ADMIN]), controller.list);
router.put('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.update);
router.delete('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.remove);
router.patch('/me', requireAuth, upload.single('profile_image'), controller.updateMe);
router.delete('/me', requireAuth, controller.deleteMe);

module.exports = router;
