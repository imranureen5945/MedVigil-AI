/**
 * MedVigil AI — TriageAssessment Model
 *
 * Stores Self-Medication Risk Assessment history per user and family profile.
 * A record keeps the reported symptoms, the collected answers, the final risk
 * level and the verified safety alerts so past assessments can be reviewed
 * and deleted by the user.
 */

const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const TriageAssessment = {
    create: (data) => {
        const {
            userId, familyMemberId, symptoms, normalizedSymptoms,
            answers, durationSummary, riskLevel, safetyOverride,
            redFlags, safetyAlerts, plannedMedicine, amrAlert,
            doctorConnectRecommended, aiUsed, summary
        } = data;

        const result = runQuery(
            `INSERT INTO triage_assessments
                (userId, familyMemberId, symptoms, normalizedSymptoms, answers, durationSummary,
                 riskLevel, safetyOverride, redFlags, safetyAlerts, plannedMedicine, amrAlert,
                 doctorConnectRecommended, aiUsed, summary)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                familyMemberId || null,
                symptoms || '',
                JSON.stringify(normalizedSymptoms || []),
                JSON.stringify(answers || {}),
                durationSummary || null,
                riskLevel || 'GREEN',
                safetyOverride ? 1 : 0,
                JSON.stringify(redFlags || []),
                JSON.stringify(safetyAlerts || []),
                JSON.stringify(plannedMedicine || null),
                amrAlert ? 1 : 0,
                doctorConnectRecommended ? 1 : 0,
                aiUsed ? 1 : 0,
                summary || ''
            ]
        );

        return TriageAssessment.findById(result.lastInsertRowid);
    },

    findById: (id) => {
        const row = prepareAndGet('SELECT * FROM triage_assessments WHERE id = ?', [id]);
        return row ? hydrate(row) : null;
    },

    // All assessments for a user, optionally filtered to one family profile.
    findByUser: (userId, familyMemberId = null) => {
        const rows = familyMemberId
            ? prepareAndAll(
                `SELECT t.*, f.name AS profileName, f.relation AS profileRelation
                 FROM triage_assessments t
                 LEFT JOIN family_members f ON t.familyMemberId = f.id
                 WHERE t.userId = ? AND t.familyMemberId = ?
                 ORDER BY t.createdAt DESC, t.id DESC`,
                [userId, Number(familyMemberId)]
            )
            : prepareAndAll(
                `SELECT t.*, f.name AS profileName, f.relation AS profileRelation
                 FROM triage_assessments t
                 LEFT JOIN family_members f ON t.familyMemberId = f.id
                 WHERE t.userId = ?
                 ORDER BY t.createdAt DESC, t.id DESC`,
                [userId]
            );
        return rows.map(hydrate);
    },

    delete: (id, userId) => {
        const result = runQuery(
            'DELETE FROM triage_assessments WHERE id = ? AND userId = ?',
            [id, userId]
        );
        return result.changes > 0;
    }
};

function hydrate(row) {
    row.normalizedSymptoms = safeParse(row.normalizedSymptoms, []);
    row.answers = safeParse(row.answers, {});
    row.redFlags = safeParse(row.redFlags, []);
    row.safetyAlerts = safeParse(row.safetyAlerts, []);
    row.plannedMedicine = safeParse(row.plannedMedicine, null);
    row.safetyOverride = row.safetyOverride === 1;
    row.amrAlert = row.amrAlert === 1;
    row.doctorConnectRecommended = row.doctorConnectRecommended === 1;
    row.aiUsed = row.aiUsed === 1;
    return row;
}

function safeParse(json, fallback) {
    try {
        return typeof json === 'string' ? JSON.parse(json) : (json || fallback);
    } catch {
        return fallback;
    }
}

module.exports = TriageAssessment;
