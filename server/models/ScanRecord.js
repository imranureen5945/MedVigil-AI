const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const ScanRecord = {
    findById(id) {
        return prepareAndGet(`
            SELECT sr.*, m.brandName, m.genericName, m.category, m.drapRegNumber, m.recallStatus
            FROM scan_records sr
            JOIN medicines m ON sr.medicineId = m.id
            WHERE sr.id = ?
        `, [id]);
    },
    findByFamilyMember(familyMemberId) {
        return prepareAndAll(`
            SELECT sr.*, m.brandName, m.genericName, m.category, m.drapRegNumber, m.recallStatus, m.manufacturer
            FROM scan_records sr
            JOIN medicines m ON sr.medicineId = m.id
            WHERE sr.familyMemberId = ?
            ORDER BY sr.id DESC
        `, [familyMemberId]);
    },
    create({ familyMemberId, medicineId, ocrText }) {
        const res = runQuery(
            "INSERT INTO scan_records (familyMemberId, medicineId, ocrText) VALUES (?, ?, ?)",
            [familyMemberId, medicineId, ocrText]
        );
        return this.findById(res.lastInsertRowid);
    }
};

module.exports = ScanRecord;
