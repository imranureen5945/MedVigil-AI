const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/trends/:familyMemberId', analyticsController.getTrends);
router.get('/usage/:userId', analyticsController.getUsage);
router.get('/family-overview/:userId', analyticsController.getFamilyOverview);

module.exports = router;
