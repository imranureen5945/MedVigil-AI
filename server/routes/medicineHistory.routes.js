const express = require('express');
const router = express.Router();
const medicineHistoryController = require('../controllers/medicineHistoryController');
const { requirePatient } = require('../middleware/authMiddleware');

router.get('/:familyMemberId', requirePatient, medicineHistoryController.getByFamilyMember);
router.post('/', requirePatient, medicineHistoryController.addMedication);
router.put('/:id', requirePatient, medicineHistoryController.updateMedication);
router.delete('/:id', requirePatient, medicineHistoryController.deleteMedication);

module.exports = router;
