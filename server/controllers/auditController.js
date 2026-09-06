const { AuditLog } = require('../models');

const auditController = {
    getUserLogs: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const logs = AuditLog.findByUserId(userId, limit);
            res.json({ success: true, count: logs.length, data: logs });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = auditController;
