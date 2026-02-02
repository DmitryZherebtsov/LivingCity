const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ROLES = require('../config/roles');

router.get('/', requireAuth, requireRole([ROLES.ADMIN]), controller.list);
router.put('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.update);
router.delete('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.remove);

module.exports = router;
