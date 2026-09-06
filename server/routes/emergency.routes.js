const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/:familyMemberId', emergencyController.getEmergencyInfo);
router.put('/:familyMemberId', emergencyController.updateEmergencyInfo);

module.exports = router;
