const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const EmergencyInfo = {
    findByFamilyMemberId(familyMemberId) {
        return prepareAndGet("SELECT * FROM emergency_info WHERE familyMemberId = ?", [familyMemberId]);
    },
    upsert(familyMemberId, { bloodType, allergies, emergencyContacts, criticalMedications, notes }) {
        const existing = this.findByFamilyMemberId(familyMemberId);
        const contactsStr = typeof emergencyContacts === 'object' ? JSON.stringify(emergencyContacts) : emergencyContacts;
        if (existing) {
            runQuery(
                `UPDATE emergency_info 
                 SET bloodType = ?, allergies = ?, emergencyContacts = ?, criticalMedications = ?, notes = ? 
                 WHERE familyMemberId = ?`,
                [bloodType || '', allergies || '', contactsStr || '', criticalMedications || '', notes || '', familyMemberId]
            );
            return this.findByFamilyMemberId(familyMemberId);
        } else {
            runQuery(
                `INSERT INTO emergency_info (familyMemberId, bloodType, allergies, emergencyContacts, criticalMedications, notes) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [familyMemberId, bloodType || '', allergies || '', contactsStr || '', criticalMedications || '', notes || '']
            );
            return this.findByFamilyMemberId(familyMemberId);
        }
    }
};

module.exports = EmergencyInfo;
