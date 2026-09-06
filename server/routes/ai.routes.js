const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/analyze-medicine', authenticate, aiController.analyzeMedicine);
router.post('/explain-interaction', authenticate, aiController.explainInteraction);

module.exports = router;
