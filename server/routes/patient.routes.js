const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { requirePatient } = require('../middleware/authMiddleware');

router.use(requirePatient);
router.get('/members', patientController.getFamilyMembers);
router.post('/members', patientController.addFamilyMember);
router.put('/members/:id', patientController.updateFamilyMember);
router.delete('/members/:id', patientController.deleteFamilyMember);
router.put('/members/:id/activate', patientController.activateFamilyMember);

module.exports = router;
