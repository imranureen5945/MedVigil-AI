const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, auditController.getUserLogs);

module.exports = router;
