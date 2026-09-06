const { FamilyMember, User } = require('../models');
const auditService = require('../services/auditService');

exports.getFamilyMembers = (req, res, next) => {
    try {
        const members = FamilyMember.findByUserId(req.user.id);
        res.json(members);
    } catch(err) {
        next(err);
    }
};

exports.addFamilyMember = (req, res, next) => {
    try {
        const { name, age, relation, avatar } = req.body;
        if (!name || isNaN(Number(age))) {
            return res.status(400).json({ success: false, message: 'Valid name and age are required.' });
        }

        const created = FamilyMember.create({
            userId: req.user.id,
            name,
            age: Number(age),
            relation: relation || 'Other',
            avatar: avatar || null
        });

        auditService.log(req.user.id, 'ADD_FAMILY_MEMBER', 'family_members', created.id, { name, relation }, req);

        res.status(201).json(created);
    } catch(err) {
        next(err);
    }
};

exports.updateFamilyMember = (req, res, next) => {
    try {
        const { name, age, relation, avatar } = req.body;
        const updated = FamilyMember.update(req.params.id, req.user.id, {
            name,
            age: age !== undefined ? Number(age) : undefined,
            relation,
            avatar
        });
        
        auditService.log(req.user.id, 'UPDATE_FAMILY_MEMBER', 'family_members', req.params.id, req.body, req);

        res.json({ success: true, message: 'Family member updated', data: updated });
    } catch(err) {
        next(err);
    }
};

exports.deleteFamilyMember = (req, res, next) => {
    try {
        FamilyMember.delete(req.params.id, req.user.id);
        auditService.log(req.user.id, 'DELETE_FAMILY_MEMBER', 'family_members', req.params.id, null, req);
        res.json({ success: true, message: 'Family member deleted' });
    } catch(err) {
        next(err);
    }
};

exports.activateFamilyMember = (req, res, next) => {
    try {
        const memberId = Number(req.params.id);
        const member = FamilyMember.findById(memberId);
        if (!member || member.userId !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Family member not found' });
        }

        User.update(req.user.id, { activeMemberId: memberId });
        auditService.log(req.user.id, 'ACTIVATE_FAMILY_MEMBER', 'users', req.user.id, { activeMemberId: memberId }, req);

        res.json({ success: true, message: 'Activated profile', id: memberId, member });
    } catch(err) {
        next(err);
    }
};
