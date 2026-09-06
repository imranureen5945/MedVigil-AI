const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin, validateDoctorLogin, validateDoctorSignup } = require('../validators/authValidator');

router.post('/signup', authLimiter, validateSignup, authController.signup);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/doctor-signup', authLimiter, validateDoctorSignup, authController.doctorSignup);
router.post('/doctor-login', authLimiter, validateDoctorLogin, authController.doctorLogin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
