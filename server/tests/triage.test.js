const assert = require('assert');
const { initDb, runQuery, prepareAndGet } = require('../config/database');
const { User } = require('../models');
const env = require('../config/env');
const vaultController = require('../controllers/familyVaultController');
const triageController = require('../controllers/triageController');
const triageAiService = require('../services/triageAiService');

// ---- minimal Express mocks so controller endpoints run without a server ----
function mockReq(user, body = {}, params = {}, query = {}) {
    return { user, body, params, query, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
}

function mockRes() {
    return {
        statusCode: 200,
        payload: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.payload = data; return this; }
    };
}

async function call(handler, req) {
    const res = mockRes();
    let nextError = null;
    await handler(req, res, (err) => { nextError = err; });
    return { res, nextError };
}

function cleanupUser(userId) {
    if (!userId) return;
    runQuery('DELETE FROM triage_assessments WHERE userId = ?', [userId]);
    runQuery('DELETE FROM safety_check_logs WHERE userId = ?', [userId]);
    runQuery('DELETE FROM medicine_history WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM allergies WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM medical_conditions WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM safety_alerts WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM family_members WHERE userId = ?', [userId]);
    runQuery('DELETE FROM audit_logs WHERE userId = ?', [userId]);
    runQuery('DELETE FROM users WHERE id = ?', [userId]);
}

function medByBrand(brandName) {
    const med = prepareAndGet('SELECT * FROM medicines WHERE LOWER(brandName) = LOWER(?)', [brandName]);
    assert(med, `Seed medicine "${brandName}" must exist in the directory`);
    return med;
}

/**
 * Self-Medication Risk Assessment — the 13 spec scenarios, exercised through
 * the real controller endpoints so validation, ownership authorization, the
 * deterministic safety engine and the AI validation layer are all included.
 */
async function runTriageTests() {
    console.log('--- Testing Self-Medication Risk Assessment ---');

    const stamp = Date.now();
    let userA = null;
    let userB = null;

    // Shared helpers -----------------------------------------------------
    async function makeProfile(extra = {}) {
        const created = await call(vaultController.createProfile, mockReq(userA, {
            name: extra.name || 'Test Patient',
            relation: 'Self',
            age: extra.age ?? 40,
            sex: extra.sex || 'male',
            ...(extra.pregnancyStatus ? { pregnancyStatus: extra.pregnancyStatus } : {}),
            ...(extra.conditions ? { conditions: extra.conditions } : {}),
            ...(extra.allergies ? { allergies: extra.allergies } : {})
        }));
        assert.strictEqual(created.res.statusCode, 201, 'profile should be created');
        return created.res.payload.data.profile;
    }

    async function addMedication(profileId, medicineId) {
        const added = await call(vaultController.addProfileMedication,
            mockReq(userA, { medicineId }, { id: profileId }));
        assert.strictEqual(added.res.statusCode, 201, 'medication should be added');
    }

    async function assess(profileId, symptoms, answers = {}, plannedMedicine = null) {
        const outcome = await call(triageController.assess, mockReq(userA, {
            familyMemberId: profileId,
            symptoms,
            answers,
            plannedMedicine,
            language: 'en'
        }));
        assert.strictEqual(outcome.res.statusCode, 200, `assess should return 200 (got ${outcome.res.statusCode}: ${JSON.stringify(outcome.res.payload)})`);
        assert(outcome.nextError === null, 'assess should not error');
        return outcome.res.payload.data;
    }

    try {
        userA = User.create({ name: 'Triage A', email: `triage-a-${stamp}@medvigil.test`, passwordHash: 'x' });
        userB = User.create({ name: 'Triage B', email: `triage-b-${stamp}@medvigil.test`, passwordHash: 'x' });

        const augmentin = medByBrand('Augmentin');   // Amoxicillin + Clavulanate (Antibiotic)
        const brufen = medByBrand('Brufen');         // Ibuprofen (NSAID)
        const calpol = medByBrand('Calpol');         // Paracetamol
        const panadol = medByBrand('Panadol');       // Paracetamol
        const disprin = medByBrand('Disprin');       // Aspirin

        // 1. Fever + sore throat → only the relevant adaptive questions
        const start1 = await call(triageController.startAssessment, mockReq(userA, {
            familyMemberId: (await makeProfile({ name: 'Q1' })).id,
            symptoms: 'Fever and sore throat',
            language: 'en'
        }));
        const q1 = start1.res.payload.data.questions.map((q) => q.id);
        assert(q1.includes('fever_temperature') && q1.includes('fever_other_symptoms'), 'fever questions present');
        assert(q1.includes('throat_swallowing'), 'sore-throat question present');
        assert(q1.includes('symptom_duration'), 'duration question present');
        assert(!q1.includes('vomit_frequency') && !q1.includes('diarrhea_fluids') && !q1.includes('chest_severe'), 'unrelated questions must NOT be asked');
        console.log('  1. Fever + sore throat → relevant questions only ........ OK');

        // 2. Fever + vomiting → duration + temperature + hydration questions
        const profile2 = await makeProfile({ name: 'Q2' });
        const start2 = await call(triageController.startAssessment, mockReq(userA, {
            familyMemberId: profile2.id,
            symptoms: 'bukhar hai aur ulti aa rahi hai',
            language: 'en'
        }));
        const data2 = start2.res.payload.data;
        const q2 = data2.questions.map((q) => q.id);
        assert(data2.isUrdu === true, 'Roman Urdu input recognised');
        assert(data2.normalizedSymptoms.some((s) => s.key === 'fever') && data2.normalizedSymptoms.some((s) => s.key === 'vomiting'), 'bukhar/ulti normalized');
        assert(q2.includes('symptom_duration') && q2.includes('fever_temperature') && q2.includes('vomit_fluids'), 'duration + temperature + hydration questions present');
        console.log('  2. Fever + vomiting (Roman Urdu) → duration, temperature, hydration OK');

        // 3. Difficulty breathing → RED
        const start3 = await call(triageController.startAssessment, mockReq(userA, {
            familyMemberId: profile2.id,
            symptoms: 'saans nahi aa rahi',
            language: 'en'
        }));
        assert(start3.res.payload.data.redFlagsDetected.includes('Severe Breathing Difficulty'), 'severe breathing text is an immediate red flag');
        const result3 = await assess(profile2.id, 'saans lene mein mushkil hai', {
            breathing_at_rest: 'yes', breathing_chest_pain: 'no',
            symptom_duration: '1-3d', general_severity: 'severe', general_worsening: 'no'
        });
        assert(result3.riskLevel === 'RED', `difficulty breathing must be RED, got ${result3.riskLevel}`);
        assert(result3.redFlags.includes('Difficulty Breathing at Rest'), 'answer-driven red flag present');
        assert(result3.doctorConnectRecommended === true, 'doctor connect recommended for RED');
        console.log('  3. Difficulty breathing → RED ................................ OK');

        // 4. Chest pain + breathing difficulty → RED
        const result4 = await assess(profile2.id, 'chest pain and difficulty breathing', {
            chest_severe: 'no', chest_breathing: 'yes',
            breathing_at_rest: 'no', breathing_chest_pain: 'yes',
            symptom_duration: 'lt24h', general_severity: 'severe', general_worsening: 'no'
        });
        assert(result4.riskLevel === 'RED', `chest pain + breathing must be RED, got ${result4.riskLevel}`);
        assert(result4.redFlags.includes('Chest Pain with Breathing Difficulty'), 'combined red flag present');
        console.log('  4. Chest pain + breathing difficulty → RED .................. OK');

        // 5. Planned antibiotic → AMR warning
        const profile5 = await makeProfile({ name: 'Q5' });
        await addMedication(profile5.id, panadol.id);
        const result5 = await assess(profile5.id, 'fever and sore throat', {
            symptom_duration: '1-3d', general_severity: 'moderate', general_worsening: 'no'
        }, { plan: 'yes', medicineId: augmentin.id });
        assert(result5.amrAlert && result5.amrAlert.detected === true, 'AMR alert must fire for a verified antibiotic');
        assert(result5.amrAlert.title === 'ANTIBIOTIC SAFETY ALERT', 'AMR title');
        assert(result5.amrAlert.medicine.name === 'Augmentin', 'AMR names the medicine');
        assert(result5.amrAlert.messages.length === 4, 'AMR carries its 4 safety messages');
        assert(result5.riskLevel === 'ORANGE', `antibiotic self-medication → ORANGE, got ${result5.riskLevel}`);
        assert(result5.safetyOverride === true, 'AMR is a verified safety override');
        console.log('  5. Planned antibiotic → AMR warning + ORANGE ................ OK');

        // 6. Planned medicine + saved allergy → verified allergy alert
        const profile6 = await makeProfile({
            name: 'Q6',
            allergies: [{ allergen: 'Penicillin', allergyType: 'medicine', severity: 'critical' }]
        });
        const result6 = await assess(profile6.id, 'fever and sore throat', {
            symptom_duration: '1-3d', general_severity: 'moderate', general_worsening: 'no'
        }, { plan: 'yes', medicineId: augmentin.id });
        const allergyAlert = result6.medicationSafety.details.allergyAlerts[0];
        assert(allergyAlert && allergyAlert.title === 'ALLERGY ALERT', 'verified allergy alert present');
        assert(allergyAlert.group === 'Penicillins', 'cross-reactive penicillin family detected');
        assert(result6.medicationSafety.status === 'HIGH', 'allergy conflict → HIGH medication risk');
        assert(result6.medicationSafety.alerts.some((a) => a.title === 'ALLERGY ALERT'), 'allergy alert surfaced in the flattened list');
        assert(result6.reasons.some((r) => /verified medication safety concern/i.test(r)), 'reason explains the verified concern');
        console.log('  6. Saved Penicillin allergy + Augmentin → verified allergy .. OK');

        // 7. Planned medicine + interaction → verified interaction warning
        const profile7 = await makeProfile({ name: 'Q7' });
        await addMedication(profile7.id, disprin.id); // Aspirin
        const result7 = await assess(profile7.id, 'body pain', {
            symptom_duration: '1-3d', general_severity: 'moderate', general_worsening: 'no'
        }, { plan: 'yes', medicineId: brufen.id }); // Ibuprofen
        const interaction = result7.medicationSafety.details.interactionAlerts[0];
        assert(interaction && interaction.title === 'INTERACTION ALERT', 'verified interaction alert present');
        assert(interaction.withMedicine === 'Disprin', 'interaction names the saved medicine');
        assert(result7.medicationSafety.status === 'HIGH', 'high-severity interaction → HIGH');
        console.log('  7. Aspirin in vault + Brufen planned → interaction warning . OK');

        // 8. Duplicate active ingredient → warning
        const profile8 = await makeProfile({ name: 'Q8' });
        await addMedication(profile8.id, panadol.id); // Paracetamol
        const result8 = await assess(profile8.id, 'fever', {
            symptom_duration: 'lt24h', general_severity: 'mild', general_worsening: 'no'
        }, { plan: 'yes', medicineId: calpol.id }); // also Paracetamol
        const duplicate = result8.medicationSafety.details.duplicateIngredientAlerts[0];
        assert(duplicate && duplicate.title === 'DUPLICATE INGREDIENT ALERT', 'duplicate ingredient alert present');
        assert(duplicate.ingredient === 'paracetamol', 'duplicate names the shared ingredient');
        assert(result8.medicationSafety.status === 'MODERATE', 'duplicate ingredient → MODERATE');
        console.log('  8. Panadol saved + Calpol planned → duplicate ingredient ... OK');

        // 9. Pregnant profile + relevant medicine → pregnancy caution
        const profile9 = await makeProfile({ name: 'Q9', sex: 'female', age: 28, pregnancyStatus: 'yes' });
        const result9 = await assess(profile9.id, 'body pain', {
            symptom_duration: 'lt24h', general_severity: 'mild', general_worsening: 'no'
        }, { plan: 'yes', medicineId: brufen.id }); // NSAID in pregnancy
        const pregnancy = result9.medicationSafety.details.pregnancyWarnings[0];
        assert(pregnancy && pregnancy.title === 'PREGNANCY CAUTION', 'pregnancy caution present');
        assert(/pregnancy/i.test(pregnancy.message), 'pregnancy message is about pregnancy');
        assert(result9.medicationSafety.status === 'MODERATE', 'pregnancy caution → MODERATE');
        console.log('  9. Pregnant profile + NSAID → pregnancy caution ............ OK');

        // 10. Diabetes + Hypertension + relevant medicine → condition check
        const profile10 = await makeProfile({
            name: 'Q10', age: 55,
            conditions: [{ conditionName: 'Type 2 Diabetes' }, { conditionName: 'Hypertension' }]
        });
        const result10 = await assess(profile10.id, 'body pain', {
            symptom_duration: '1-3d', general_severity: 'moderate', general_worsening: 'no'
        }, { plan: 'yes', medicineId: brufen.id }); // NSAID with hypertension caution
        const condition = result10.medicationSafety.details.conditionWarnings.find((c) => c.condition === 'hypertension');
        assert(condition, 'hypertension condition warning present');
        assert(/blood pressure/i.test(condition.message), 'condition message explains the risk');
        assert(result10.medicationSafety.status === 'MODERATE', 'condition caution → MODERATE');
        console.log(' 10. Diabetes + Hypertension + NSAID → condition check ....... OK');

        // 11. AI unavailable → deterministic fallback still completes
        const profile11 = await makeProfile({ name: 'Q11' });
        if (!env.geminiApiKey) {
            const deterministic = {
                riskLevel: 'ORANGE',
                summary: 'Deterministic summary.',
                reasons: ['Deterministic reason.'],
                warningSigns: ['Warning sign.'],
                selfCareGuidance: ['Rest.'],
                medicationSafety: null,
                amrAlert: null,
                nextSteps: ['See a doctor.'],
                doctorConnectRecommended: true,
                normalizedSymptoms: ['fever'],
                disclaimer: 'Safety guide only.'
            };
            const direct = await triageAiService.generateExplanation({}, deterministic);
            assert(direct.aiUsed === false && direct.explanation === deterministic, 'no API key → deterministic explanation returned');

            const result11 = await assess(profile11.id, 'fever and cough', {
                fever_other_symptoms: 'no', cough_breathing: 'no', cough_chest_pain: 'no',
                symptom_duration: '1-3d', general_severity: 'moderate', general_worsening: 'no'
            });
            assert(result11.aiUsed === false, 'AI not used when unavailable');
            assert(result11.aiNotice === 'We couldn\'t complete the full AI explanation, but the available safety checks were completed.', 'AI-unavailable notice shown');
            assert(result11.reasons.length > 0 && result11.summary.length > 0, 'deterministic findings still present');
            console.log(' 11. AI unavailable → deterministic fallback + notice ....... OK');
        } else {
            console.log(' 11. AI unavailable → SKIPPED (GEMINI_API_KEY is configured)');
        }

        // 12. Malformed / unsafe AI → strict schema validation rejects it
        assert.strictEqual(triageAiService.validateAiResponse(null), null, 'null response rejected');
        assert.strictEqual(triageAiService.validateAiResponse({ riskLevel: 'PURPLE', summary: 'x' }), null, 'invalid risk level rejected');
        assert.strictEqual(triageAiService.validateAiResponse({ riskLevel: 'GREEN' }), null, 'missing summary rejected');
        assert.strictEqual(triageAiService.validateAiResponse({ riskLevel: 'GREEN', summary: 'I prescribe Amoxicillin 500mg for you' }), null, 'prescribing language rejected');
        assert.strictEqual(
            triageAiService.validateAiResponse({ riskLevel: 'GREEN', summary: 'ok', medicationSafety: { status: 'SUPER HIGH' } }),
            null, 'invalid medication status rejected'
        );
        const validated = triageAiService.validateAiResponse(
            { riskLevel: 'GREEN', summary: 'Mild symptoms reported.', reasons: ['Short duration.'] },
            { minRisk: 'ORANGE' }
        );
        assert(validated && validated.riskLevel === 'ORANGE', 'AI can never downgrade below the deterministic risk');
        console.log(' 12. Malformed / unsafe AI → schema validation catches ....... OK');

        // 13. Unauthorized profile → access denied
        const profile13 = await makeProfile({ name: 'Q13' });
        const denied = await call(triageController.assess, mockReq(userB, {
            familyMemberId: profile13.id,
            symptoms: 'fever',
            answers: {},
            plannedMedicine: null,
            language: 'en'
        }));
        assert(denied.nextError && denied.nextError.statusCode === 404, 'foreign profile must be denied with 404');
        assert(denied.res.payload === null, 'no data leaked for a foreign profile');
        console.log(' 13. Unauthorized profile → access denied (404) ............. OK');

        console.log('\n✓ All 13 Self-Medication Risk Assessment tests passed.');
    } finally {
        cleanupUser(userA?.id);
        cleanupUser(userB?.id);
    }
}

module.exports = runTriageTests;

// Allow running this suite directly: node tests/triage.test.js
if (require.main === module) {
    initDb()
        .then(runTriageTests)
        .catch((err) => {
            console.error('\n❌ Triage test suite failed:', err);
            process.exit(1);
        });
}
