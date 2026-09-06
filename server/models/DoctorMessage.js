const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const DoctorMessage = {
    findById(id) {
        return prepareAndGet(`
            SELECT dm.*, u.name as patientName, d.name as doctorName, d.specialization
            FROM doctor_messages dm
            LEFT JOIN users u ON dm.patientId = u.id
            LEFT JOIN doctors d ON dm.doctorId = d.id
            WHERE dm.id = ?
        `, [id]);
    },
    findByPatientId(patientId) {
        return prepareAndAll(`
            SELECT dm.*, d.name as doctorName, d.specialization
            FROM doctor_messages dm
            LEFT JOIN doctors d ON dm.doctorId = d.id
            WHERE dm.patientId = ?
            ORDER BY dm.id ASC
        `, [patientId]);
    },
    findByDoctorId(doctorId) {
        return prepareAndAll(`
            SELECT dm.*, u.name as patientName, u.email as patientEmail
            FROM doctor_messages dm
            LEFT JOIN users u ON dm.patientId = u.id
            WHERE dm.doctorId = ?
            ORDER BY dm.id DESC
        `, [doctorId]);
    },
    create({ patientId, doctorId, message, urgencyTag = 'routine', contextSnapshot = null }) {
        const snapshotStr = typeof contextSnapshot === 'object' ? JSON.stringify(contextSnapshot) : contextSnapshot;
        const res = runQuery(
            "INSERT INTO doctor_messages (patientId, doctorId, message, urgencyTag, status, contextSnapshot) VALUES (?, ?, ?, ?, 'sent', ?)",
            [patientId, doctorId, message, urgencyTag, snapshotStr]
        );
        return this.findById(res.lastInsertRowid);
    },
    reply(id, replyText, isVerified = 0) {
        runQuery(
            "UPDATE doctor_messages SET reply = ?, isVerified = ?, status = 'replied', repliedAt = datetime('now') WHERE id = ?",
            [replyText, isVerified ? 1 : 0, id]
        );
        return this.findById(id);
    },
    markSeen(id) {
        runQuery("UPDATE doctor_messages SET status = 'seen', seenAt = datetime('now') WHERE id = ? AND status = 'sent'", [id]);
        return this.findById(id);
    }
};

module.exports = DoctorMessage;
