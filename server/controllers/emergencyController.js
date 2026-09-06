const { prepareAndGet, runQuery } = require('../config/database');

exports.getEmergencyInfo = (req, res, next) => {
    try {
        const info = prepareAndGet("SELECT * FROM emergency_info WHERE familyMemberId = ?", [req.params.familyMemberId]);
        res.json(info || {});
    } catch(err) {
        next(err);
    }
};

exports.updateEmergencyInfo = (req, res, next) => {
    try {
        const { bloodType, allergies, emergencyContacts, criticalMedications, notes } = req.body;
        const existing = prepareAndGet("SELECT id FROM emergency_info WHERE familyMemberId = ?", [req.params.familyMemberId]);
        
        if (existing) {
            runQuery("UPDATE emergency_info SET bloodType=?, allergies=?, emergencyContacts=?, criticalMedications=?, notes=? WHERE familyMemberId=?", 
              [bloodType, allergies, emergencyContacts, criticalMedications, notes, req.params.familyMemberId]);
        } else {
            runQuery("INSERT INTO emergency_info (familyMemberId, bloodType, allergies, emergencyContacts, criticalMedications, notes) VALUES (?, ?, ?, ?, ?, ?)", 
              [req.params.familyMemberId, bloodType, allergies, emergencyContacts, criticalMedications, notes]);
        }
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};
