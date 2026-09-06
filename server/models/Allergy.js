const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const Allergy = {
    findById(id) {
        return prepareAndGet("SELECT * FROM allergies WHERE id = ?", [id]);
    },
    findByFamilyMember(familyMemberId) {
        return prepareAndAll("SELECT * FROM allergies WHERE familyMemberId = ? ORDER BY id DESC", [familyMemberId]);
    },
    findByFamilyMemberAndAllergen(familyMemberId, allergen) {
        return prepareAndGet(
            "SELECT * FROM allergies WHERE familyMemberId = ? AND LOWER(allergen) = LOWER(?)",
            [familyMemberId, allergen]
        );
    },
    create({ familyMemberId, allergen, severity = 'moderate', notes = '', allergyType = 'medicine' }) {
        const res = runQuery(
            "INSERT INTO allergies (familyMemberId, allergen, severity, notes, allergyType) VALUES (?, ?, ?, ?, ?)",
            [familyMemberId, allergen, severity, notes, allergyType]
        );
        return this.findById(res.lastInsertRowid);
    },
    delete(id) {
        return runQuery("DELETE FROM allergies WHERE id = ?", [id]);
    }
};

module.exports = Allergy;
