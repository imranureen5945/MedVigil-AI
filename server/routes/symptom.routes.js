const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/analyze', authenticate, symptomController.analyzeSymptoms);

module.exports = router;
