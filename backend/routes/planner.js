const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', plannerController.getPlans);
router.post('/', plannerController.createPlan);
router.patch('/:id', plannerController.updatePlanStatus);
router.delete('/:id', plannerController.deletePlan);

module.exports = router;
