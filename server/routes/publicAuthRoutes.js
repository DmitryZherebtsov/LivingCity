const express = require('express');
const router = express.Router();
const multer = require('multer');

const authController = require('../auth/auth.controller');
const publicController = require('../controllers/publicAuth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/register', upload.single('profile_image'), publicController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// router.post('/logout', requireAuth, authController.logout);


module.exports = router;
