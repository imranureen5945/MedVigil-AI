const express = require('express');
const router = express.Router();
const conditionController = require('../controllers/conditionController');
const { requirePatient } = require('../middleware/authMiddleware');

router.get('/:familyMemberId', requirePatient, conditionController.getByFamilyMember);
router.post('/', requirePatient, conditionController.addCondition);
router.put('/:id', requirePatient, conditionController.updateCondition);
router.delete('/:id', requirePatient, conditionController.deleteCondition);

module.exports = router;
