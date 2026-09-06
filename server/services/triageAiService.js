const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

// ---------------------------------------------------------------------------
// Self-Medication Risk Assessment — AI explanation layer.
//
// The AI NEVER decides safety: red flags, risk levels, medication safety
// findings and antibiotic/AMR classification all come from the deterministic
// engine (triageService / medicationSafetyEngine). The AI only explains the
// verified findings in patient-friendly language, and every response passes
// strict schema validation. Anything malformed, unsafe or unverifiable is
// rejected and the deterministic explanation is used instead.
// ---------------------------------------------------------------------------

const RISK_LEVELS = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];
const MED_STATUS_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'UNKNOWN'];
const riskSeverity = (level) => Math.max(0, RISK_LEVELS.indexOf(String(level || '').toUpperCase()));
const maxRisk = (a, b) => (riskSeverity(a) >= riskSeverity(b) ? a : b);

const TRIAGE_SYSTEM_PROMPT = `
You are the MedVigil AI "Self-Medication Risk Assessment" assistant for Pakistan.
Patients describe symptoms in English or Roman Urdu and you help them understand the RISKS of treating those symptoms on their own.

Your ONLY job is to explain VERIFIED safety findings in simple, patient-friendly language.

ABSOLUTE RULES — VIOLATION IS CRITICAL:
- NEVER diagnose a disease or name a suspected disease.
- NEVER prescribe, recommend or suggest any medicine for the symptoms.
- NEVER invent drug interactions, allergy conflicts, contraindications, pregnancy warnings or condition warnings. Only reference the VERIFIED findings given in the context.
- NEVER tell the patient to start or stop a prescription medicine they are already taking.
- NEVER downgrade the risk level below the verified risk level. You may only keep it the same or make it MORE urgent.
- NEVER remove or weaken any verified medication safety alert.
- Use simple words a patient understands. For example: say "This medicine may interact with one of your current medicines" instead of "drug-drug interaction". Say "Bacteria can become harder to treat when antibiotics are used unnecessarily or incorrectly" instead of "antimicrobial resistance".

Return ONLY a valid JSON object without markdown fences, with EXACTLY this structure:
{
  "normalizedSymptoms": ["fever", "sore throat"],
  "followUpQuestions": [],
  "summary": "2-4 sentence patient-friendly summary of what was assessed and what was found",
  "riskLevel": "GREEN" | "YELLOW" | "ORANGE" | "RED",
  "reasons": ["one clear reason per entry explaining the risk level"],
  "warningSigns": ["signs that mean urgent medical care is needed"],
  "selfCareGuidance": ["safe general self-care advice with NO medicine recommendations"],
  "medicationSafety": { "status": "LOW" | "MODERATE" | "HIGH" | "UNKNOWN", "alerts": [] },
  "amrAlert": null,
  "nextSteps": ["clear actions the patient should take now"],
  "doctorConnectRecommended": true,
  "disclaimer": "short safety disclaimer"
}`;

const TRIAGE_QUESTION_PROMPT = `
You help select follow-up clarifying questions for a self-medication safety assessment.
Given the patient's symptoms and the questions that are already being asked, return up to 3 ADDITIONAL short questions that are specifically relevant to THESE symptoms for assessing self-medication risk.
Rules:
- NEVER diagnose and NEVER recommend medicines.
- Keep questions simple enough for any patient to understand.
- Do NOT duplicate or rephrase the existing questions.
- Only include questions that matter for these specific symptoms.
Return ONLY valid JSON without markdown fences:
{ "questions": [ { "question": "...", "type": "yesno" | "choice", "options": ["...", "..."] } ] }
For type "yesno" omit the options field.`;

// Light safety screen — any of these means the AI tried to prescribe or
// diagnose, so the whole response is rejected (deterministic fallback used).
const BANNED_PATTERNS = [
    /\bi\s+prescribe\b/i,
    /prescribed\s+for\s+you\b/i,
    /prescription\s+for\s+you\b/i,
    /\bdiagnosis\s*:/i,
    /\byour\s+diagnosis\s+is\b/i,
    /\btake\s+\d+\s*(mg|ml|tablet|capsule|spoon)/i,
    /\bdosage\s+of\s+\d+/i
];

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms))
    ]);
}

function dedupeStrings(items, cap) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        const key = String(item || '').trim().toLowerCase();
        if (key && !seen.has(key)) {
            seen.add(key);
            out.push(String(item).trim());
        }
    }
    return out.slice(0, cap);
}

function stringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(x => typeof x === 'string' && x.trim().length > 0).map(x => x.trim());
}

/**
 * Strict schema validation for the AI explanation. Returns a sanitized
 * object, or null when the response is malformed / unsafe / out of schema.
 * The risk level is clamped upward to minRisk so the AI can never downgrade.
 */
function validateAiResponse(parsed, { minRisk = 'GREEN' } = {}) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const level = String(parsed.riskLevel || '').toUpperCase();
    if (!RISK_LEVELS.includes(level)) return null;

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    if (!summary) return null;

    const reasons = stringArray(parsed.reasons);
    const warningSigns = stringArray(parsed.warningSigns);
    const selfCareGuidance = stringArray(parsed.selfCareGuidance);
    const nextSteps = stringArray(parsed.nextSteps);
    const normalizedSymptoms = stringArray(parsed.normalizedSymptoms);
    const followUpQuestions = stringArray(parsed.followUpQuestions);

    // medicationSafety — if present it must carry a valid status enum.
    let medStatus = null;
    if (parsed.medicationSafety != null) {
        if (typeof parsed.medicationSafety !== 'object' || Array.isArray(parsed.medicationSafety)) return null;
        const status = String(parsed.medicationSafety.status || '').toUpperCase();
        if (status && !MED_STATUS_LEVELS.includes(status)) return null;
        medStatus = status || null;
    }

    const doctorConnectRecommended = parsed.doctorConnectRecommended === true;

    // Safety screen over everything the patient would read.
    const readable = [summary, ...reasons, ...selfCareGuidance, ...nextSteps].join(' \n ');
    if (BANNED_PATTERNS.some(pattern => pattern.test(readable))) return null;

    const clampedLevel = riskSeverity(level) < riskSeverity(minRisk) ? minRisk : level;

    return {
        normalizedSymptoms,
        followUpQuestions,
        summary,
        riskLevel: clampedLevel,
        reasons,
        warningSigns,
        selfCareGuidance,
        medicationSafety: medStatus,
        amrAlert: null,
        nextSteps,
        doctorConnectRecommended
    };
}

// Verified findings always win; the AI can only add explanation and escalate.
function mergeExplanation(validated, deterministic) {
    return {
        normalizedSymptoms: validated.normalizedSymptoms.length ? validated.normalizedSymptoms : deterministic.normalizedSymptoms,
        summary: validated.summary,
        riskLevel: maxRisk(validated.riskLevel, deterministic.riskLevel),
        reasons: dedupeStrings([...deterministic.reasons, ...validated.reasons], 10),
        warningSigns: dedupeStrings([...deterministic.warningSigns, ...validated.warningSigns], 12),
        selfCareGuidance: validated.selfCareGuidance.length ? validated.selfCareGuidance : deterministic.selfCareGuidance,
        medicationSafety: deterministic.medicationSafety,
        amrAlert: deterministic.amrAlert,
        nextSteps: dedupeStrings([...validated.nextSteps, ...deterministic.nextSteps], 8),
        doctorConnectRecommended: deterministic.doctorConnectRecommended || validated.doctorConnectRecommended,
        disclaimer: deterministic.disclaimer
    };
}

// Flatten the deterministic engine result for the prompt context.
function alertLinesFromEngine(engineResult) {
    if (!engineResult) return [];
    const lines = [];
    const buckets = ['allergyAlerts', 'interactionAlerts', 'duplicateIngredientAlerts', 'conditionWarnings', 'pregnancyWarnings', 'ageRelatedCautions', 'otherSafetyInfo'];
    for (const bucket of buckets) {
        for (const alert of engineResult[bucket] || []) {
            lines.push(`- [${alert.severity}] ${alert.title}: ${alert.message}`);
        }
    }
    return lines;
}

function buildAssessmentPrompt(context) {
    const lines = [];
    lines.push(`Patient profile: ${context.profile.name} (${context.profile.relation})`);
    lines.push(`Reported symptoms (original text): "${context.symptoms}"`);
    lines.push(`Detected symptoms: ${context.detected.map(d => d.label).join(', ') || 'none recognized'}`);
    if (context.answers && Object.keys(context.answers).length > 0) {
        lines.push(`Follow-up question answers: ${JSON.stringify(context.answers)}`);
    }
    lines.push(`Verified urgent red flags: ${context.redFlags.length ? context.redFlags.join('; ') : 'none'}`);
    if (context.medicationSafety) {
        lines.push(`Verified medication safety status for the planned medicine: ${context.medicationSafety.overallRisk}`);
        const alertLines = alertLinesFromEngine(context.medicationSafety);
        if (alertLines.length) lines.push(`Verified medication safety alerts (you may explain these but NEVER change them):\n${alertLines.join('\n')}`);
    } else {
        lines.push('No planned medicine was provided for this assessment.');
    }
    if (context.amrAlert) {
        lines.push(`Verified antibiotic alert: ${context.amrAlert.medicine.name} is an antibiotic. The antibiotic/AMR guidance applies — do not soften it.`);
    }
    lines.push(`Verified risk level from the deterministic engine (keep it the same or make it MORE urgent — never lower): ${context.riskLevel}`);
    lines.push(`Respond in: ${context.language === 'ur' ? 'Roman Urdu (Urdu written in English letters)' : 'English'}`);
    lines.push('Now produce the JSON explanation. Remember: no diagnosis, no medicine recommendations, only explanations of the verified findings above.');
    return lines.join('\n');
}

/**
 * Generate the patient-friendly explanation. Falls back to the deterministic
 * explanation whenever the AI is unavailable, times out, or returns anything
 * that fails schema validation.
 */
async function generateExplanation(context, deterministic) {
    if (!env.geminiApiKey) {
        return { aiUsed: false, explanation: deterministic };
    }
    try {
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
        });
        const result = await withTimeout(model.generateContent([TRIAGE_SYSTEM_PROMPT, buildAssessmentPrompt(context)]), 15000);
        const text = (await result.response).text();
        const parsed = JSON.parse(text);
        const validated = validateAiResponse(parsed, { minRisk: deterministic.riskLevel });
        if (!validated) {
            return { aiUsed: false, explanation: deterministic, aiRejected: true };
        }
        return { aiUsed: true, explanation: mergeExplanation(validated, deterministic) };
    } catch (err) {
        console.error('[Triage] AI explanation unavailable — using verified deterministic results:', err.message);
        return { aiUsed: false, explanation: deterministic };
    }
}

/**
 * Optional AI enrichment of the adaptive question set. Failures are invisible:
 * the deterministic questions always stand on their own.
 */
async function generateQuestionEnrichment({ symptoms, detectedSymptoms, existingQuestions, language }) {
    if (!env.geminiApiKey) {
        return { aiUsed: false, additionalQuestions: [] };
    }
    try {
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
        });
        const context = [
            `Patient symptoms: "${symptoms}"`,
            `Detected symptoms: ${detectedSymptoms.map(d => d.label).join(', ') || 'none recognized'}`,
            `Existing questions (do not duplicate): ${existingQuestions.map(q => q.question).join(' | ') || 'none'}`,
            `Respond in: ${language === 'ur' ? 'Roman Urdu' : 'English'}`
        ].join('\n');

        const result = await withTimeout(model.generateContent([TRIAGE_QUESTION_PROMPT, context]), 12000);
        const text = (await result.response).text();
        const parsed = JSON.parse(text);

        if (!parsed || !Array.isArray(parsed.questions)) {
            return { aiUsed: false, additionalQuestions: [] };
        }

        const existingLower = existingQuestions.map(q => String(q.question || '').toLowerCase());
        const additional = [];
        for (const item of parsed.questions.slice(0, 3)) {
            if (!item || typeof item.question !== 'string' || item.question.trim().length < 8) continue;
            const type = item.type === 'choice' ? 'choice' : 'yesno';
            const question = item.question.trim();
            if (existingLower.some(q => q.includes(question.toLowerCase()) || question.toLowerCase().includes(q))) continue;
            const built = { id: `ai_q_${additional.length + 1}`, type, question };
            if (type === 'choice') {
                const options = stringArray(item.options);
                if (options.length < 2 || options.length > 5) continue;
                built.options = options.map(o => ({ value: o.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label: o }));
            } else {
                built.options = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
            }
            additional.push(built);
        }
        return { aiUsed: additional.length > 0, additionalQuestions: additional.slice(0, 3) };
    } catch (err) {
        return { aiUsed: false, additionalQuestions: [] };
    }
}

module.exports = {
    TRIAGE_SYSTEM_PROMPT,
    validateAiResponse,
    generateExplanation,
    generateQuestionEnrichment
};
