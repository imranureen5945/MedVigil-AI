const { DoctorMessage, Doctor, FamilyMember } = require('../models');
const { calculateSafetyScore } = require('../services/interactionEngine');
const auditService = require('../services/auditService');

exports.sendMessage = (req, res, next) => {
    try {
        const { doctorId, message, urgencyTag, familyMemberId } = req.body;
        
        let snapshot = null;
        if (familyMemberId) {
            const safety = calculateSafetyScore(familyMemberId);
            snapshot = safety;
        }

        const created = DoctorMessage.create({
            patientId: req.user.id,
            doctorId,
            message,
            urgencyTag: urgencyTag || 'routine',
            contextSnapshot: snapshot
        });
        
        auditService.log(req.user.id, 'SEND_DOCTOR_MESSAGE', 'doctor_messages', created.id, { doctorId, urgencyTag }, req);

        res.status(201).json(created);
    } catch(err) {
        next(err);
    }
};

exports.getPatientMessages = (req, res, next) => {
    try {
        const msgs = DoctorMessage.findByPatientId(req.user.id);
        const parsed = msgs.map(m => {
            let snapshot = m.contextSnapshot;
            if (typeof snapshot === 'string') {
                try { snapshot = JSON.parse(snapshot); } catch(e) {}
            }
            return { ...m, contextSnapshot: snapshot };
        });
        res.json(parsed);
    } catch(err) {
        next(err);
    }
};

exports.getDoctorInbox = (req, res, next) => {
    try {
        const msgs = DoctorMessage.findByDoctorId(req.user.id);
        const parsed = msgs.map(m => {
            let snapshot = m.contextSnapshot;
            if (typeof snapshot === 'string') {
                try { snapshot = JSON.parse(snapshot); } catch(e) {}
            }
            return { ...m, contextSnapshot: snapshot };
        });
        res.json(parsed);
    } catch(err) {
        next(err);
    }
};

exports.replyMessage = (req, res, next) => {
    try {
        const { reply, isVerified } = req.body;
        const updated = DoctorMessage.reply(req.params.id, reply, isVerified);
        auditService.log(req.user.id, 'REPLY_DOCTOR_MESSAGE', 'doctor_messages', req.params.id, { isVerified }, req);
        res.json({ success: true, message: 'Reply sent', data: updated });
    } catch(err) {
        next(err);
    }
};

exports.markSeen = (req, res, next) => {
    try {
        const updated = DoctorMessage.markSeen(req.params.id);
        res.json({ success: true, data: updated });
    } catch(err) {
        next(err);
    }
};

exports.listDoctors = (req, res, next) => {
    try {
        const doctors = Doctor.findAll();
        res.json(doctors);
    } catch(err) {
        next(err);
    }
};
