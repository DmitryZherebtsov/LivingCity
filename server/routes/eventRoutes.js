const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ROLES = require('../config/roles');

router.get('/my', requireAuth, requireRole(['organizer']), controller.getMyEvents);

router.post('/', requireAuth, requireRole([ROLES.ADMIN, ROLES.ORGANIZER]), controller.create);
router.get('/', controller.list);
router.get('/event-types', controller.getEventTypes);
router.get('/:id', controller.getOne);
router.put('/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.update);
router.delete('/:id', requireAuth, requireRole([ROLES.ADMIN, ROLES.ORGANIZER]), controller.remove);

router.patch('/approve/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.approve);
router.patch('/reject/:id', requireAuth, requireRole([ROLES.ADMIN]), controller.reject);

module.exports = router;
