const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const SafetyAlert = {
    findByFamilyMember(familyMemberId, unreadOnly = false) {
        let sql = "SELECT * FROM safety_alerts WHERE familyMemberId = ?";
        if (unreadOnly) {
            sql += " AND isRead = 0";
        }
        sql += " ORDER BY id DESC";
        return prepareAndAll(sql, [familyMemberId]);
    },
    create({ familyMemberId, type, severity, message }) {
        const res = runQuery(
            "INSERT INTO safety_alerts (familyMemberId, type, severity, message) VALUES (?, ?, ?, ?)",
            [familyMemberId, type, severity, message]
        );
        return prepareAndGet("SELECT * FROM safety_alerts WHERE id = ?", [res.lastInsertRowid]);
    },
    markRead(id) {
        return runQuery("UPDATE safety_alerts SET isRead = 1 WHERE id = ?", [id]);
    },
    clearForMember(familyMemberId) {
        return runQuery("DELETE FROM safety_alerts WHERE familyMemberId = ?", [familyMemberId]);
    }
};

module.exports = SafetyAlert;
