const { Allergy, FamilyMember } = require('../models');
const auditService = require('../services/auditService');

const allergyController = {
    getByFamilyMember: async (req, res, next) => {
        try {
            const { familyMemberId } = req.params;
            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }
            const allergies = Allergy.findByFamilyMember(familyMemberId);
            res.json({ success: true, count: allergies.length, data: allergies });
        } catch (error) {
            next(error);
        }
    },

    addAllergy: async (req, res, next) => {
        try {
            const { familyMemberId, allergen, severity, notes } = req.body;
            if (!familyMemberId || !allergen) {
                return res.status(400).json({ success: false, message: 'familyMemberId and allergen are required' });
            }
            const member = FamilyMember.findById(familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(404).json({ success: false, message: 'Family member not found' });
            }
            const created = Allergy.create({ familyMemberId, allergen, severity, notes });
            auditService.log(req.user.id, 'ADD_ALLERGY', 'allergies', created.id, { allergen, familyMemberId }, req);
            res.status(201).json({ success: true, message: 'Allergy recorded', data: created });
        } catch (error) {
            next(error);
        }
    },

    deleteAllergy: async (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = Allergy.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Allergy record not found' });
            }
            const member = FamilyMember.findById(existing.familyMemberId);
            if (!member || member.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            Allergy.delete(id);
            auditService.log(req.user.id, 'DELETE_ALLERGY', 'allergies', id, { allergen: existing.allergen }, req);
            res.json({ success: true, message: 'Allergy removed' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = allergyController;
