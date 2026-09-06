const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

// LEFT JOIN + COALESCE so profile medications keep working even when the
// medicine is not in the national directory (custom entries store their own
// name/ingredient directly on the row).
const SELECT_WITH_MEDICINE = `
    SELECT mh.*,
           COALESCE(m.brandName, mh.medicineName) AS brandName,
           COALESCE(m.genericName, mh.activeIngredient, mh.medicineName) AS genericName,
           m.manufacturer, m.drapRegNumber, m.dosage as standardDosage,
           m.category, m.recallStatus
    FROM medicine_history mh
    LEFT JOIN medicines m ON mh.medicineId = m.id
`;

const MedicineHistory = {
    findById(id) {
        return prepareAndGet(`${SELECT_WITH_MEDICINE} WHERE mh.id = ?`, [id]);
    },
    findByFamilyMember(familyMemberId, activeOnly = true) {
        let sql = `${SELECT_WITH_MEDICINE} WHERE mh.familyMemberId = ?`;
        if (activeOnly) {
            sql += ' AND mh.isActive = 1';
        }
        sql += ' ORDER BY mh.id DESC';
        return prepareAndAll(sql, [familyMemberId]);
    },
    create({ familyMemberId, medicineId = null, medicineName = null, activeIngredient = null,
             strength = null, frequency = null, reason = null,
             startDate, endDate, dosageNotes, isActive = 1 }) {
        const res = runQuery(
            `INSERT INTO medicine_history
                (familyMemberId, medicineId, medicineName, activeIngredient, strength,
                 frequency, reason, startDate, endDate, dosageNotes, isActive)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [familyMemberId, medicineId, medicineName, activeIngredient, strength,
             frequency, reason, startDate || new Date().toISOString().split('T')[0],
             endDate || null, dosageNotes || '', isActive]
        );
        return this.findById(res.lastInsertRowid);
    },
    update(id, { dosageNotes, isActive, endDate }) {
        const fields = [];
        const values = [];
        if (dosageNotes !== undefined) { fields.push('dosageNotes = ?'); values.push(dosageNotes); }
        if (isActive !== undefined) { fields.push('isActive = ?'); values.push(isActive); }
        if (endDate !== undefined) { fields.push('endDate = ?'); values.push(endDate); }
        if (fields.length === 0) return this.findById(id);
        values.push(id);
        runQuery(`UPDATE medicine_history SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },
    delete(id) {
        return runQuery("DELETE FROM medicine_history WHERE id = ?", [id]);
    }
};

module.exports = MedicineHistory;
