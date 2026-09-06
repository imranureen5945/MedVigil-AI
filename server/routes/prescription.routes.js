const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.post('/interpret', prescriptionController.interpret);
router.get('/abbreviations', prescriptionController.getAbbreviations);

module.exports = router;
