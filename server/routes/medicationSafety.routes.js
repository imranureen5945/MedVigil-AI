const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/familyVaultController');
const { requirePatient } = require('../middleware/authMiddleware');

// Medication safety check against a Family Safety Vault profile.
// Requires explicit profile selection; the controller verifies ownership.
router.post('/check', requirePatient, vaultController.checkMedicineSafety);

module.exports = router;
