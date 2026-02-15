const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminEvent.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ROLES = require('../config/roles');

router.get('/events/pending', requireAuth, requireRole([ROLES.ADMIN, ROLES.MODERATOR]), adminController.getPendingEvents);
router.patch('/events/:id/status', requireAuth, requireRole([ROLES.ADMIN, ROLES.MODERATOR]), adminController.updateEventStatus);

module.exports = router;
