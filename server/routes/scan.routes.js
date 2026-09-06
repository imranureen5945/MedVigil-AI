const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.post('/analyze-image', scanController.analyzeImage);
router.post('/lookup', scanController.lookupScan);
router.post('/save', scanController.saveScan);
router.get('/history/:familyMemberId', scanController.getScanHistory);

module.exports = router;
