const triageService = require('../services/triageService');
const vaultSafetyService = require('../services/vaultSafetyService');
const auditService = require('../services/auditService');
const { TriageAssessment } = require('../models');

// The Self-Medication Risk Assessment always runs against a verified Family
// Safety Vault profile — every endpoint re-checks ownership server-side so
// one family member's safety information can never leak into another's
// assessment.
function requireProfile(req) {
    const { familyMemberId } = req.body || {};
    return vaultSafetyService.assertProfileOwnership(req.user.id, familyMemberId);
}

function validateSymptoms(symptoms) {
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
        return 'Please describe the symptoms first — a few words are enough.';
    }
    return null;
}

// Step 1 + 2: profile selected, symptoms described → normalized symptoms and
// the adaptive question set (plus any red flags detected in the text itself).
exports.startAssessment = async (req, res, next) => {
    try {
        const { symptoms, language = 'en' } = req.body || {};
        if (!req.body || !req.body.familyMemberId) {
            return res.status(400).json({ success: false, message: 'Please select who this assessment is for.' });
        }
        const symptomError = validateSymptoms(symptoms);
        if (symptomError) {
            return res.status(400).json({ success: false, message: symptomError });
        }

        const profile = requireProfile(req); // 404 when not owned by this user
        const data = await triageService.startAssessment({ profile, symptoms, language });

        if (req.user) {
            auditService.log(req.user.id, 'TRIAGE_START', 'triage', String(profile.id), {
                profileId: profile.id,
                detectedCount: data.detectedSymptoms.length,
                hasRedFlags: data.redFlagsDetected.length > 0
            }, req);
        }

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Regenerate the adaptive question set (used when symptoms are edited).
exports.getQuestions = async (req, res, next) => {
    try {
        const { symptoms, familyMemberId } = req.body || {};
        const symptomError = validateSymptoms(symptoms);
        if (symptomError) {
            return res.status(400).json({ success: false, message: symptomError });
        }
        if (familyMemberId) {
            requireProfile(req); // 404 when not owned by this user
        }

        const { detected } = triageService.normalizeAndDetect(symptoms);
        const questions = triageService.generateQuestions(detected);
        const redFlagsDetected = triageService.evaluateRedFlags(symptoms, {});

        res.json({ success: true, data: { detectedSymptoms: detected, questions, redFlagsDetected } });
    } catch (err) {
        next(err);
    }
};

// Full assessment: red-flag rules → vault cross-checks → medication safety →
// AMR detection → deterministic risk → AI explanation (validated, escalate-only).
exports.assess = async (req, res, next) => {
    try {
        const { symptoms, answers = {}, plannedMedicine = null, language = 'en' } = req.body || {};
        if (!req.body || !req.body.familyMemberId) {
            return res.status(400).json({ success: false, message: 'Please select who this assessment is for.' });
        }
        const symptomError = validateSymptoms(symptoms);
        if (symptomError) {
            return res.status(400).json({ success: false, message: symptomError });
        }
        if (Array.isArray(answers) || (answers && typeof answers !== 'object')) {
            return res.status(400).json({ success: false, message: 'Answers must be an object of question answers.' });
        }
        if (plannedMedicine != null && (typeof plannedMedicine !== 'object' || Array.isArray(plannedMedicine))) {
            return res.status(400).json({ success: false, message: 'Invalid planned medicine details.' });
        }
        if (plannedMedicine && plannedMedicine.plan === 'yes' && !plannedMedicine.medicineId && !plannedMedicine.medicineName) {
            return res.status(400).json({ success: false, message: 'Please select or enter the medicine you plan to take.' });
        }

        const profile = requireProfile(req);
        const result = await triageService.runAssessment({
            userId: req.user.id,
            profile,
            symptoms,
            answers: answers || {},
            plannedMedicine,
            language
        });

        if (req.user) {
            auditService.log(req.user.id, 'TRIAGE_ASSESSMENT', 'triage', String(profile.id), {
                profileId: profile.id,
                riskLevel: result.riskLevel,
                redFlagCount: result.redFlags.length,
                verifiedAlertCount: result.verifiedAlertCount,
                amrAlert: Boolean(result.amrAlert),
                aiUsed: result.aiUsed
            }, req);
        }

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

// Standalone check of the planned medicine against the selected profile
// (powers the medicine picker step before the final assessment).
exports.medicationCheck = async (req, res, next) => {
    try {
        const { medicineId, medicineName } = req.body || {};
        if (!req.body || !req.body.familyMemberId) {
            return res.status(400).json({ success: false, message: 'Please select who this medicine check is for.' });
        }
        if (!medicineId && (!medicineName || String(medicineName).trim().length < 2)) {
            return res.status(400).json({ success: false, message: 'Please select or enter a medicine to check.' });
        }

        const profile = requireProfile(req);
        const result = triageService.checkPlannedMedicine({
            profile,
            userId: req.user.id,
            medicineId: medicineId || null,
            medicineName: medicineName || null
        });

        if (req.user) {
            auditService.log(req.user.id, 'TRIAGE_MEDICATION_CHECK', 'triage', String(profile.id), {
                profileId: profile.id,
                medicineId: medicineId || null,
                identified: result.medicationSafety.details.identified,
                overallRisk: result.medicationSafety.status,
                amrAlert: Boolean(result.amrAlert)
            }, req);
        }

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

// Assessment history for the signed-in user (optionally one profile).
exports.getHistory = async (req, res, next) => {
    try {
        const { familyMemberId } = req.query || {};
        if (familyMemberId) {
            vaultSafetyService.assertProfileOwnership(req.user.id, familyMemberId);
        }
        const data = TriageAssessment.findByUser(req.user.id, familyMemberId || null);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Delete one assessment from the history (ownership enforced by userId).
exports.deleteHistory = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const deleted = TriageAssessment.delete(Number(id), req.user.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Assessment not found.' });
        }
        if (req.user) {
            auditService.log(req.user.id, 'TRIAGE_HISTORY_DELETE', 'triage', String(id), {}, req);
        }
        res.json({ success: true, message: 'Assessment deleted.' });
    } catch (err) {
        next(err);
    }
};
