const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const MedicalCondition = {
    findById(id) {
        return prepareAndGet("SELECT * FROM medical_conditions WHERE id = ?", [id]);
    },
    findByFamilyMember(familyMemberId, activeOnly = true) {
        let sql = "SELECT * FROM medical_conditions WHERE familyMemberId = ?";
        if (activeOnly) {
            sql += " AND isActive = 1";
        }
        sql += " ORDER BY id DESC";
        return prepareAndAll(sql, [familyMemberId]);
    },
    create({ familyMemberId, conditionName, severity = 'moderate', diagnosedDate, notes = '', isActive = 1 }) {
        const res = runQuery(
            "INSERT INTO medical_conditions (familyMemberId, conditionName, severity, diagnosedDate, notes, isActive) VALUES (?, ?, ?, ?, ?, ?)",
            [familyMemberId, conditionName, severity, diagnosedDate || new Date().toISOString().split('T')[0], notes, isActive]
        );
        return this.findById(res.lastInsertRowid);
    },
    update(id, { conditionName, severity, notes, isActive }) {
        const fields = [];
        const values = [];
        if (conditionName !== undefined) { fields.push('conditionName = ?'); values.push(conditionName); }
        if (severity !== undefined) { fields.push('severity = ?'); values.push(severity); }
        if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
        if (isActive !== undefined) { fields.push('isActive = ?'); values.push(isActive); }
        if (fields.length === 0) return this.findById(id);
        values.push(id);
        runQuery(`UPDATE medical_conditions SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },
    delete(id) {
        return runQuery("DELETE FROM medical_conditions WHERE id = ?", [id]);
    }
};

module.exports = MedicalCondition;
