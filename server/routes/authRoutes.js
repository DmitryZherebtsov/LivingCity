const express = require('express');
const router = express.Router();
const controller = require('../auth/auth.controller');

router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.post('/register', controller.register);

module.exports = router;
