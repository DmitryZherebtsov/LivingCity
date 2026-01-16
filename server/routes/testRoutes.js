const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.post('/', testController.create);
router.get('/', testController.getAll);
router.get('/:id', testController.getOne);
router.put('/:id', testController.update);
router.delete('/:id', testController.remove);

module.exports = router;
