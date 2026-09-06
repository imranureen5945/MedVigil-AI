const express = require('express');
const router = express.Router();
const safetyScoreController = require('../controllers/safetyScoreController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/score/:familyMemberId', safetyScoreController.getSafetyScore);
router.get('/alerts/:familyMemberId', safetyScoreController.getAlerts);
router.get('/insights/:userId', safetyScoreController.getInsights);
router.post('/check-single', safetyScoreController.checkSingle);

module.exports = router;
