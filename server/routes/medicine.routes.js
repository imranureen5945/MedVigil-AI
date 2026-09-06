const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', medicineController.getAllMedicines);
router.get('/search', medicineController.searchMedicines);
router.get('/recalls', medicineController.getRecalled);
router.get('/compare/:id1/:id2', medicineController.compareMedicines);
router.get('/:id', medicineController.getMedicine);
router.get('/:id/interactions', medicineController.getInteractions);

module.exports = router;
