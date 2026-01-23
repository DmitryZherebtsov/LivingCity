const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ROLES = require('../config/roles');

router.post('/', requireAuth, requireRole([ROLES.ADMIN]), controller.create);
router.get('/', requireAuth, requireRole([ROLES.ADMIN, ROLES.MODERATOR]), controller.list);
router.get('/:id', requireAuth, requireRole([ROLES.ADMIN, ROLES.MODERATOR]), controller.getOne);
router.put('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.update);
router.delete('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.remove);

module.exports = router;
