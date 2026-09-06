const { AuditLog } = require('../models');

const auditService = {
    log(userId, action, resource, resourceId, details, req) {
        try {
            const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
            return AuditLog.create({
                userId: userId || null,
                action,
                resource,
                resourceId: String(resourceId || ''),
                details,
                ipAddress
            });
        } catch (e) {
            console.error('Audit log failure (non-critical):', e.message);
            return null;
        }
    }
};

module.exports = auditService;
