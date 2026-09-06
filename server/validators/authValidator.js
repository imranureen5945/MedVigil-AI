const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('Full Name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        errors.push('A valid email address is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors, message: errors[0] });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    next();
};

const validateDoctorLogin = (req, res, next) => {
    const { doctorId, password } = req.body;
    if (!doctorId || !password) {
        return res.status(400).json({ success: false, message: 'Doctor ID and password are required.' });
    }
    next();
};

const validateDoctorSignup = (req, res, next) => {
    const { name, email, doctorId, specialization, password } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('Full Name must be at least 2 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        errors.push('A valid email address is required.');
    }

    if (!doctorId || typeof doctorId !== 'string' || doctorId.trim().length < 3) {
        errors.push('Doctor ID / PMDC registration number is required.');
    }

    if (!specialization || typeof specialization !== 'string' || specialization.trim().length < 2) {
        errors.push('Specialization is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors, message: errors[0] });
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateDoctorLogin,
    validateDoctorSignup
};
