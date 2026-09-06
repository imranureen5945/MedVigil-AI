const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

// Audit trail for safety-critical medication checks. Stores only the metadata
// needed for traceability (which profile, which medicine, which rules fired).
const SafetyCheckLog = {
    create({ userId, familyMemberId, medicineName, medicineId, overallRisk, rulesTriggered }) {
        const res = runQuery(
            `INSERT INTO safety_check_logs
                (userId, familyMemberId, medicineName, medicineId, overallRisk, rulesTriggered)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, familyMemberId, medicineName || null, medicineId || null,
             overallRisk || null, JSON.stringify(rulesTriggered || [])]
        );
        return prepareAndGet("SELECT * FROM safety_check_logs WHERE id = ?", [res.lastInsertRowid]);
    },
    findByFamilyMember(familyMemberId, limit = 20) {
        return prepareAndAll(
            "SELECT * FROM safety_check_logs WHERE familyMemberId = ? ORDER BY id DESC LIMIT ?",
            [familyMemberId, limit]
        );
    }
};

module.exports = SafetyCheckLog;
