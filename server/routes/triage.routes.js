const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');
const { authenticate } = require('../middleware/authMiddleware');

// Self-Medication Risk Assessment — every endpoint is authenticated and
// re-verifies family profile ownership server-side.
router.post('/start', authenticate, triageController.startAssessment);
router.post('/questions', authenticate, triageController.getQuestions);
router.post('/assess', authenticate, triageController.assess);
router.post('/medication-check', authenticate, triageController.medicationCheck);
router.get('/history', authenticate, triageController.getHistory);
router.delete('/history/:id', authenticate, triageController.deleteHistory);

module.exports = router;
