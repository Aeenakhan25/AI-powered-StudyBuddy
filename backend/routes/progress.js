const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', progressController.getProgress);
router.post('/', progressController.updateProgress);

module.exports = router;
