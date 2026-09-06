const { MedicalCondition, FamilyMember } = require('../models');
const auditService = require('../services/auditService');

const conditionController = {
    getByFamilyMember: async (req, res, next) => {
        try {
            const { familyMemberId } = req.params;
            const activeOnly = req.query.activeOnly !== 'false';
            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }
            const conditions = MedicalCondition.findByFamilyMember(familyMemberId, activeOnly);
            res.json({ success: true, count: conditions.length, data: conditions });
        } catch (error) {
            next(error);
        }
    },

    addCondition: async (req, res, next) => {
        try {
            const { familyMemberId, conditionName, severity, diagnosedDate, notes, isActive } = req.body;
            if (!familyMemberId || !conditionName) {
                return res.status(400).json({ success: false, message: 'familyMemberId and conditionName are required' });
            }
            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }
            const created = MedicalCondition.create({
                familyMemberId,
                conditionName,
                severity,
                diagnosedDate,
                notes,
                isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1
            });
            auditService.log(req.user.id, 'ADD_CONDITION', 'medical_conditions', created.id, { conditionName, familyMemberId }, req);
            res.status(201).json({ success: true, message: 'Medical condition recorded', data: created });
        } catch (error) {
            next(error);
        }
    },

    updateCondition: async (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = MedicalCondition.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Condition not found' });
            }
            const member = FamilyMember.findById(existing.familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            const updated = MedicalCondition.update(id, req.body);
            auditService.log(req.user.id, 'UPDATE_CONDITION', 'medical_conditions', id, req.body, req);
            res.json({ success: true, message: 'Condition updated', data: updated });
        } catch (error) {
            next(error);
        }
    },

    deleteCondition: async (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = MedicalCondition.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Condition not found' });
            }
            const member = FamilyMember.findById(existing.familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            MedicalCondition.delete(id);
            auditService.log(req.user.id, 'DELETE_CONDITION', 'medical_conditions', id, { conditionName: existing.conditionName }, req);
            res.json({ success: true, message: 'Condition removed' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = conditionController;
