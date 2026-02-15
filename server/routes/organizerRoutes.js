const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizer.controller');
const ROLES = require('../config/roles');

const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');


router.post('/register', organizerController.register);

router.get('/pending', requireAuth, requireRole([ROLES.ADMIN]), organizerController.getPending);

router.patch('/approve/:userId', requireAuth, requireRole([ROLES.ADMIN]), organizerController.approve);

router.patch('/reject/:userId', requireAuth, requireRole([ROLES.ADMIN]), organizerController.reject);


module.exports = router;
