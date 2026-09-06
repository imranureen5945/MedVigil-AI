const express = require('express');
const router = express.Router();
const allergyController = require('../controllers/allergyController');
const { requirePatient } = require('../middleware/authMiddleware');

router.get('/:familyMemberId', requirePatient, allergyController.getByFamilyMember);
router.post('/', requirePatient, allergyController.addAllergy);
router.delete('/:id', requirePatient, allergyController.deleteAllergy);

module.exports = router;
