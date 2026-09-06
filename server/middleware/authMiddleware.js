const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const requirePatient = [authenticate, (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Access denied: Patient only' });
    }
    next();
}];

const requireDoctor = [authenticate, (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied: Doctor only' });
    }
    next();
}];

module.exports = { authenticate, requirePatient, requireDoctor };
