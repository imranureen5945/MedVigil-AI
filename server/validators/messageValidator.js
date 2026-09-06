const validateSendMessage = (req, res, next) => {
    const { doctorId, message } = req.body;
    if (!doctorId) {
        return res.status(400).json({ success: false, message: 'doctorId is required.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }
    next();
};

const validateReply = (req, res, next) => {
    const { reply } = req.body;
    if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
    }
    next();
};

module.exports = {
    validateSendMessage,
    validateReply
};
