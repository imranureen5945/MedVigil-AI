const { MedicineHistory, FamilyMember } = require('../models');
const auditService = require('../services/auditService');

const medicineHistoryController = {
    getByFamilyMember: async (req, res, next) => {
        try {
            const { familyMemberId } = req.params;
            const activeOnly = req.query.activeOnly !== 'false';
            
            // Verify access
            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }

            const medications = MedicineHistory.findByFamilyMember(familyMemberId, activeOnly);
            res.json({ success: true, count: medications.length, data: medications });
        } catch (error) {
            next(error);
        }
    },

    addMedication: async (req, res, next) => {
        try {
            const { familyMemberId, medicineId, startDate, endDate, dosageNotes, isActive } = req.body;
            
            if (!familyMemberId || !medicineId) {
                return res.status(400).json({ success: false, message: 'familyMemberId and medicineId are required' });
            }

            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }

            const record = MedicineHistory.create({
                familyMemberId,
                medicineId,
                startDate,
                endDate,
                dosageNotes,
                isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1
            });

            auditService.log(req.user.id, 'ADD_MEDICATION', 'medicine_history', record.id, { medicineId, familyMemberId }, req);

            res.status(201).json({ success: true, message: 'Medication added successfully', data: record });
        } catch (error) {
            next(error);
        }
    },

    updateMedication: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { dosageNotes, isActive, endDate } = req.body;

            const existing = MedicineHistory.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Medication record not found' });
            }

            const member = FamilyMember.findById(existing.familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const updated = MedicineHistory.update(id, {
                dosageNotes,
                isActive: isActive !== undefined ? (isActive ? 1 : 0) : undefined,
                endDate
            });

            auditService.log(req.user.id, 'UPDATE_MEDICATION', 'medicine_history', id, req.body, req);

            res.json({ success: true, message: 'Medication updated successfully', data: updated });
        } catch (error) {
            next(error);
        }
    },

    deleteMedication: async (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = MedicineHistory.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Medication record not found' });
            }

            const member = FamilyMember.findById(existing.familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            MedicineHistory.delete(id);
            auditService.log(req.user.id, 'DELETE_MEDICATION', 'medicine_history', id, { brandName: existing.brandName }, req);

            res.json({ success: true, message: 'Medication removed successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = medicineHistoryController;
