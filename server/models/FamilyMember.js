const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const FamilyMember = {
    findById(id) {
        return prepareAndGet("SELECT * FROM family_members WHERE id = ?", [id]);
    },
    findByUserId(userId) {
        return prepareAndAll("SELECT * FROM family_members WHERE userId = ? ORDER BY id ASC", [userId]);
    },
    create({ userId, name, age, relation, avatar = null, dateOfBirth = null, sex = null,
             pregnancyStatus = 'unknown', breastfeedingStatus = 'unknown',
             emergencyContactName = null, emergencyContactPhone = null, emergencyNotes = null }) {
        const res = runQuery(
            `INSERT INTO family_members
                (userId, name, age, relation, avatar, dateOfBirth, sex, pregnancyStatus,
                 breastfeedingStatus, emergencyContactName, emergencyContactPhone, emergencyNotes, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [userId, name, age, relation, avatar, dateOfBirth, sex,
             pregnancyStatus, breastfeedingStatus,
             emergencyContactName, emergencyContactPhone, emergencyNotes]
        );
        return this.findById(res.lastInsertRowid);
    },
    update(id, userId, data) {
        const { name, age, relation, avatar, dateOfBirth, sex, pregnancyStatus,
                breastfeedingStatus, emergencyContactName, emergencyContactPhone, emergencyNotes } = data;
        const fields = [];
        const values = [];
        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (age !== undefined) { fields.push('age = ?'); values.push(age); }
        if (relation !== undefined) { fields.push('relation = ?'); values.push(relation); }
        if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
        if (dateOfBirth !== undefined) { fields.push('dateOfBirth = ?'); values.push(dateOfBirth); }
        if (sex !== undefined) { fields.push('sex = ?'); values.push(sex); }
        if (pregnancyStatus !== undefined) { fields.push('pregnancyStatus = ?'); values.push(pregnancyStatus); }
        if (breastfeedingStatus !== undefined) { fields.push('breastfeedingStatus = ?'); values.push(breastfeedingStatus); }
        if (emergencyContactName !== undefined) { fields.push('emergencyContactName = ?'); values.push(emergencyContactName); }
        if (emergencyContactPhone !== undefined) { fields.push('emergencyContactPhone = ?'); values.push(emergencyContactPhone); }
        if (emergencyNotes !== undefined) { fields.push('emergencyNotes = ?'); values.push(emergencyNotes); }
        if (fields.length === 0) return this.findById(id);
        fields.push("updatedAt = datetime('now')");
        values.push(id, userId);
        runQuery(`UPDATE family_members SET ${fields.join(', ')} WHERE id = ? AND userId = ?`, values);
        return this.findById(id);
    },
    touch(id) {
        return runQuery("UPDATE family_members SET updatedAt = datetime('now') WHERE id = ?", [id]);
    },
    delete(id, userId) {
        return runQuery("DELETE FROM family_members WHERE id = ? AND userId = ?", [id, userId]);
    }
};

module.exports = FamilyMember;
