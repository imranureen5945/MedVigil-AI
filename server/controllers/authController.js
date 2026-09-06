const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Doctor } = require('../models');
const env = require('../config/env');
const auditService = require('../services/auditService');

exports.signup = (req, res, next) => {
    try {
        const { name, email, password, language } = req.body;
        
        const existing = User.findByEmail(email);
        if (existing) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = User.create({
            name,
            email,
            passwordHash: hash,
            role: 'patient',
            language: language || 'en'
        });

        // Guard against null user (should not happen after fix, but defensive)
        if (!newUser || !newUser.id) {
            console.error('User.create returned null for email:', email);
            return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
        }
        
        const token = jwt.sign({ id: newUser.id, role: 'patient' }, env.jwtSecret, { expiresIn: '7d' });
        
        auditService.log(newUser.id, 'USER_SIGNUP', 'users', newUser.id, { email }, req);

        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'patient' } });
    } catch (err) {
        // Handle duplicate email UNIQUE constraint violation
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        console.error('Signup error:', err.message);
        next(err);
    }
};

exports.login = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = User.findByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
        
        auditService.log(user.id, 'USER_LOGIN', 'users', user.id, { email }, req);

        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role, activeMemberId: user.activeMemberId } });
    } catch (err) {
        console.error('Login error:', err.message);
        next(err);
    }
};

exports.doctorSignup = (req, res, next) => {
    try {
        const { name, email, doctorId, specialization, hospital, password } = req.body;
        const trimmedDoctorId = doctorId.trim();

        if (Doctor.findByDoctorId(trimmedDoctorId)) {
            return res.status(400).json({ success: false, message: 'This Doctor ID is already registered.' });
        }
        if (Doctor.findByEmail(email.trim())) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const doctor = Doctor.create({
            name: name.trim(),
            email: email.trim(),
            doctorId: trimmedDoctorId,
            specialization: specialization.trim(),
            hospital: hospital ? hospital.trim() : null,
            passwordHash: hash
        });

        if (!doctor || !doctor.id) {
            console.error('Doctor.create returned null for doctorId:', trimmedDoctorId);
            return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
        }

        const token = jwt.sign({ id: doctor.id, role: 'doctor', doctorId: doctor.doctorId }, env.jwtSecret, { expiresIn: '7d' });

        auditService.log(doctor.id, 'DOCTOR_SIGNUP', 'doctors', doctor.id, { doctorId: trimmedDoctorId }, req);

        res.status(201).json({ token, user: { id: doctor.id, name: doctor.name, role: 'doctor', specialization: doctor.specialization } });
    } catch (err) {
        // Handle duplicate Doctor ID UNIQUE constraint violation
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: 'This Doctor ID is already registered.' });
        }
        console.error('Doctor signup error:', err.message);
        next(err);
    }
};

exports.doctorLogin = (req, res, next) => {
    try {
        const { doctorId, password } = req.body;
        const doctor = Doctor.findByDoctorId(doctorId);
        if (!doctor || !bcrypt.compareSync(password, doctor.passwordHash)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: doctor.id, role: 'doctor', doctorId: doctor.doctorId }, env.jwtSecret, { expiresIn: '7d' });
        
        auditService.log(doctor.id, 'DOCTOR_LOGIN', 'doctors', doctor.id, { doctorId }, req);

        res.json({ token, user: { id: doctor.id, name: doctor.name, role: 'doctor', specialization: doctor.specialization } });
    } catch (err) {
        next(err);
    }
};

exports.getMe = (req, res, next) => {
    try {
        if (req.user.role === 'doctor') {
            const doctor = Doctor.findById(req.user.id);
            res.json(doctor);
        } else {
            const user = User.findById(req.user.id);
            res.json(user);
        }
    } catch (err) {
        next(err);
    }
};
