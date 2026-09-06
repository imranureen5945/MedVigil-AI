const express = require('express');
const router = express.Router();
const doctorConnectController = require('../controllers/doctorConnectController');
const { authenticate, requirePatient, requireDoctor } = require('../middleware/authMiddleware');

router.get('/doctors', authenticate, doctorConnectController.listDoctors);

router.post('/send', requirePatient, doctorConnectController.sendMessage);
router.get('/patient', requirePatient, doctorConnectController.getPatientMessages);
router.put('/:id/seen', authenticate, doctorConnectController.markSeen);

router.get('/doctor', requireDoctor, doctorConnectController.getDoctorInbox);
router.put('/:id/reply', requireDoctor, doctorConnectController.replyMessage);

module.exports = router;
