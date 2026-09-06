const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/familyVaultController');
const { requirePatient } = require('../middleware/authMiddleware');

// Family Safety Vault — the central patient safety data layer.
// Every endpoint authenticates the patient and verifies profile ownership
// inside the controller, so one family's profiles are never reachable
// through another user's profile IDs.
router.use(requirePatient);

router.get('/profiles', vaultController.getProfiles);
router.post('/profiles', vaultController.createProfile);
router.get('/profiles/:id', vaultController.getProfile);
router.patch('/profiles/:id', vaultController.updateProfile);
router.delete('/profiles/:id', vaultController.deleteProfile);

router.post('/profiles/:id/medications', vaultController.addProfileMedication);
router.delete('/profiles/:id/medications/:medicationId', vaultController.deleteProfileMedication);

router.post('/profiles/:id/allergies', vaultController.addProfileAllergies);
router.delete('/profiles/:id/allergies/:allergyId', vaultController.deleteProfileAllergy);

router.post('/profiles/:id/conditions', vaultController.addProfileConditions);
router.delete('/profiles/:id/conditions/:conditionId', vaultController.deleteProfileCondition);

module.exports = router;
