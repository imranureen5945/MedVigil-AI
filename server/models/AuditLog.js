const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const AuditLog = {
    findByUserId(userId, limit = 50) {
        return prepareAndAll(
            "SELECT * FROM audit_logs WHERE userId = ? ORDER BY id DESC LIMIT ?",
            [userId, limit]
        );
    },
    findAll(limit = 100) {
        return prepareAndAll("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", [limit]);
    },
    create({ userId, action, resource, resourceId, details, ipAddress = '' }) {
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
        const res = runQuery(
            "INSERT INTO audit_logs (userId, action, resource, resourceId, details, ipAddress) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, action, resource, String(resourceId || ''), detailsStr || '', ipAddress]
        );
        return prepareAndGet("SELECT * FROM audit_logs WHERE id = ?", [res.lastInsertRowid]);
    }
};

module.exports = AuditLog;
