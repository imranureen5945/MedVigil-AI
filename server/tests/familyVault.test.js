const assert = require('assert');
const { runQuery, prepareAndGet, prepareAndAll } = require('../config/database');
const { User, FamilyMember, Allergy, MedicalCondition, MedicineHistory, Medicine } = require('../models');
const vaultSafetyService = require('../services/vaultSafetyService');
const controller = require('../controllers/familyVaultController');

// ---- minimal Express mocks so controller endpoints run without a server ----
function mockReq(user, body = {}, params = {}) {
    return { user, body, params, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
}

function mockRes() {
    return {
        statusCode: 200,
        payload: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.payload = data; return this; }
    };
}

function call(handler, req) {
    const res = mockRes();
    let nextError = null;
    handler(req, res, (err) => { nextError = err; });
    return { res, nextError };
}

function cleanupUser(userId) {
    if (!userId) return;
    runQuery('DELETE FROM safety_check_logs WHERE userId = ?', [userId]);
    runQuery('DELETE FROM medicine_history WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM allergies WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM medical_conditions WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM safety_alerts WHERE familyMemberId IN (SELECT id FROM family_members WHERE userId = ?)', [userId]);
    runQuery('DELETE FROM family_members WHERE userId = ?', [userId]);
    runQuery('DELETE FROM audit_logs WHERE userId = ?', [userId]);
    runQuery('DELETE FROM users WHERE id = ?', [userId]);
}

/**
 * Family Safety Vault — 15 spec scenarios + cascade delete + audit trail,
 * exercised through the real controller endpoints (validation, ownership
 * authorization and the deterministic safety engine included).
 */
async function runFamilyVaultTests() {
    console.log('--- Testing Family Safety Vault ---');

    const stamp = Date.now();
    let userA = null;
    let userB = null;

    try {
        userA = User.create({ name: 'Vault Test A', email: `vault-a-${stamp}@medvigil.test`, passwordHash: 'test-hash' });
        userB = User.create({ name: 'Vault Test B', email: `vault-b-${stamp}@medvigil.test`, passwordHash: 'test-hash' });

        // 1. Create a new family profile (wizard payload: basic info + conditions + allergies)
        const created = call(controller.createProfile, mockReq(userA, {
            name: 'Ayesha Khan',
            relation: 'Mother',
            dateOfBirth: '1958-03-12',
            sex: 'female',
            conditions: [{ conditionName: 'Kidney Disease' }],
            allergies: [{ allergen: 'Penicillin', allergyType: 'medicine', severity: 'critical' }]
        }));
        assert.strictEqual(created.res.statusCode, 201, 'Profile creation should return 201');
        assert(created.res.payload.success === true, 'Profile creation should succeed');
        const profileId = created.res.payload.data.profile.id;
        assert(created.res.payload.data.profile.name === 'Ayesha Khan');
        assert(created.res.payload.data.snapshot.conditionCount === 1, 'Wizard condition should be stored');
        assert(created.res.payload.data.snapshot.allergyCount === 1, 'Wizard allergy should be stored');
        const flagLabels = created.res.payload.data.flags.map(f => f.label);
        assert(flagLabels.includes('PENICILLIN ALLERGY'), 'Allergy flag should be derived');
        assert(flagLabels.includes('KIDNEY SAFETY CONSIDERATION'), 'Condition flag should be derived');
        assert(flagLabels.includes('ELDERLY SAFETY CONSIDERATION'), 'Age (DOB 1958) should derive elderly flag');
        console.log('  1. Create profile with conditions + allergies ............ OK');

        // 2. Add an allergy — duplicate detection + new allergen
        const dupAllergy = call(controller.addProfileAllergies, mockReq(userA,
            { allergies: [{ allergen: 'Penicillin', allergyType: 'medicine', severity: 'high' }] },
            { id: profileId }));
        assert(dupAllergy.res.payload.duplicates.includes('Penicillin'), 'Duplicate allergen should be reported');
        assert(dupAllergy.res.payload.data.length === 0, 'Duplicate allergen must not be re-created');
        const newAllergy = call(controller.addProfileAllergies, mockReq(userA,
            { allergies: [{ allergen: 'Sulfa drugs', allergyType: 'medicine', severity: 'high' }] },
            { id: profileId }));
        assert(newAllergy.res.payload.data.length === 1, 'New allergen should be recorded');
        console.log('  2. Add allergy (duplicate + new) .......................... OK');

        // 3. Add current medicines — custom (not identified) and directory entry
        const customMed = call(controller.addProfileMedication, mockReq(userA,
            { medicineName: 'Xyzunknown Forte', activeIngredient: 'Mystery Compound', frequency: 'Once daily' },
            { id: profileId }));
        assert(customMed.res.payload.identified === false, 'Unknown medicine must be flagged not identified');
        assert(customMed.res.payload.message.includes('not confidently identified'), 'Warning message required');
        const panadol = prepareAndGet("SELECT * FROM medicines WHERE brandName = 'Panadol'");
        assert(panadol, 'Seed data should contain Panadol');
        const dirMed = call(controller.addProfileMedication, mockReq(userA,
            { medicineId: panadol.id, frequency: 'Twice daily', reason: 'Pain' },
            { id: profileId }));
        assert(dirMed.res.payload.identified === true, 'Directory medicine should be identified');
        assert(dirMed.res.payload.data.medicineId === panadol.id, 'Directory medicine should store medicineId');
        console.log('  3. Add medicines (custom + directory) ..................... OK');

        // 4. Add a health condition
        const addCond = call(controller.addProfileConditions, mockReq(userA,
            { conditions: [{ conditionName: 'Asthma' }] }, { id: profileId }));
        assert(addCond.res.payload.data.length === 1, 'Condition should be recorded');
        const asthmaId = addCond.res.payload.data[0].id;
        console.log('  4. Add health condition .................................. OK');

        // 5. Update profile — pregnancy status change
        const updated = call(controller.updateProfile, mockReq(userA,
            { pregnancyStatus: 'yes' }, { id: profileId }));
        assert(updated.res.payload.data.profile.pregnancyStatus === 'yes', 'Pregnancy status should update');
        assert(updated.res.payload.data.flags.some(f => f.label === 'PREGNANCY SAFETY CONSIDERATION'),
            'Pregnancy flag should appear after update');
        assert(updated.res.payload.data.specialConsiderations.some(sc => sc.label === 'Pregnancy'),
            'Special considerations should include pregnancy');
        console.log('  5. Update profile (pregnancy status) ...................... OK');

        // 6. Delete a medicine from the profile
        const panadolRecordId = dirMed.res.payload.data.id;
        const delMed = call(controller.deleteProfileMedication, mockReq(userA, {}, { id: profileId, medicationId: panadolRecordId }));
        assert(delMed.res.payload.success === true, 'Medicine removal should succeed');
        const afterDelete = call(controller.getProfile, mockReq(userA, {}, { id: profileId }));
        assert(afterDelete.res.payload.data.snapshot.medicationCount === 1, 'Only the custom medicine should remain');
        console.log('  6. Delete medicine from profile ........................... OK');

        // 7. Select a member and check a medicine — labelled result
        const amoxil = prepareAndGet("SELECT * FROM medicines WHERE brandName = 'Amoxil'");
        assert(amoxil, 'Seed data should contain Amoxil');
        const check1 = call(controller.checkMedicineSafety, mockReq(userA,
            { profileId, medicineId: amoxil.id }, {}));
        assert(check1.res.payload.success === true, 'Safety check should succeed');
        assert(check1.res.payload.checkingFor === 'Ayesha Khan', 'Result must be labelled with profile name');
        assert(check1.res.payload.data.profileName === 'Ayesha Khan', 'Result carries profileName');
        console.log('  7. Select member + check medicine (labelled) .............. OK');

        // 8. Allergy warning — Penicillin allergy -> Amoxicillin (cross-reactive family)
        assert(check1.res.payload.data.allergyAlerts.length >= 1, 'Amoxicillin must trigger Penicillin allergy alert');
        assert(check1.res.payload.data.allergyAlerts[0].title === 'ALLERGY ALERT');
        assert(check1.res.payload.data.allergyAlerts[0].message.includes('Penicillins'),
            'Alert should explain the cross-reactive family');
        assert(check1.res.payload.data.overallRisk === 'HIGH', 'Allergy alert should yield HIGH risk');
        console.log('  8. Cross-reactive allergy warning (Penicillin->Amoxil) .... OK');

        // 9. Interaction warning — real pair from medicine_interactions
        const pair = prepareAndAll(`
            SELECT i.genericName1, i.genericName2 FROM medicine_interactions i
            WHERE EXISTS (SELECT 1 FROM medicines m WHERE LOWER(m.genericName) = LOWER(i.genericName1))
              AND EXISTS (SELECT 1 FROM medicines m WHERE LOWER(m.genericName) = LOWER(i.genericName2))
            LIMIT 1`);
        assert(pair.length === 1, 'Seed data should contain an interaction pair present in the directory');
        const med1 = prepareAndGet('SELECT * FROM medicines WHERE LOWER(genericName) = LOWER(?)', [pair[0].genericName1]);
        const med2 = prepareAndGet('SELECT * FROM medicines WHERE LOWER(genericName) = LOWER(?)', [pair[0].genericName2]);
        const interProfile = call(controller.createProfile, mockReq(userB, {
            name: 'Bilal Ahmed', relation: 'Self', age: 40, sex: 'male'
        })).res.payload.data.profile;
        call(controller.addProfileMedication, mockReq(userB,
            { medicineId: med2.id }, { id: interProfile.id }));
        const interCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: interProfile.id, medicineId: med1.id }, {}));
        assert(interCheck.res.payload.data.interactionAlerts.length >= 1,
            `Interaction between ${pair[0].genericName1} and ${pair[0].genericName2} should be detected`);
        assert(interCheck.res.payload.data.interactionAlerts[0].title === 'INTERACTION ALERT');
        console.log(`  9. Interaction warning (${pair[0].genericName1} + ${pair[0].genericName2}) ... OK`);

        // 10. Duplicate ingredient warning — Panadol + Calpol (both paracetamol)
        const calpol = prepareAndGet("SELECT * FROM medicines WHERE brandName = 'Calpol'");
        assert(calpol, 'Seed data should contain Calpol');
        const dupProfile = call(controller.createProfile, mockReq(userB, {
            name: 'Sana Ahmed', relation: 'Spouse', age: 35, sex: 'female'
        })).res.payload.data.profile;
        call(controller.addProfileMedication, mockReq(userB,
            { medicineId: panadol.id }, { id: dupProfile.id }));
        const dupCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: dupProfile.id, medicineId: calpol.id }, {}));
        assert(dupCheck.res.payload.data.duplicateIngredientAlerts.length >= 1, 'Duplicate paracetamol should be detected');
        assert(dupCheck.res.payload.data.duplicateIngredientAlerts[0].ingredient === 'paracetamol');
        console.log('  10. Duplicate ingredient warning (Panadol + Calpol) ....... OK');

        // 11. Pregnancy warning — doxycycline (tetracycline) for pregnant profile
        const vibramycin = prepareAndGet("SELECT * FROM medicines WHERE brandName = 'Vibramycin'");
        assert(vibramycin, 'Seed data should contain Vibramycin (doxycycline)');
        const pregProfile = call(controller.createProfile, mockReq(userB, {
            name: 'Hina Ahmed', relation: 'Daughter', age: 28, sex: 'female', pregnancyStatus: 'yes'
        })).res.payload.data.profile;
        const pregCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: pregProfile.id, medicineId: vibramycin.id }, {}));
        assert(pregCheck.res.payload.data.pregnancyWarnings.length >= 1, 'Pregnancy caution should fire for tetracycline');
        assert(['MODERATE', 'HIGH'].includes(pregCheck.res.payload.data.overallRisk), 'Pregnancy caution must raise risk above LOW');
        console.log('  11. Pregnancy warning (doxycycline) ....................... OK');

        // 12. Kidney disease warning — NSAID caution
        const brufen = prepareAndGet("SELECT * FROM medicines WHERE brandName = 'Brufen'");
        assert(brufen, 'Seed data should contain Brufen (NSAID)');
        const kidneyCheck = call(controller.checkMedicineSafety, mockReq(userA,
            { profileId, medicineId: brufen.id }, {}));
        assert(kidneyCheck.res.payload.data.conditionWarnings.length >= 1, 'Kidney disease should trigger NSAID caution');
        assert(kidneyCheck.res.payload.data.conditionWarnings.some(w => w.severity === 'critical'),
            'NSAID kidney caution should be critical');
        assert(kidneyCheck.res.payload.data.overallRisk === 'HIGH', 'Critical kidney caution should yield HIGH risk');
        console.log('  12. Kidney disease warning (NSAID) ....................... OK');

        // 13. Authorization — foreign profile access must be indistinguishable from missing
        const foreign = call(controller.getProfile, mockReq(userB, {}, { id: profileId }));
        assert(foreign.nextError && foreign.nextError.statusCode === 404, 'Foreign profile access must return 404');
        const foreignCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId, medicineId: brufen.id }, {}));
        assert(foreignCheck.nextError && foreignCheck.nextError.statusCode === 404, 'Safety check for foreign profile must 404');
        const foreignPatch = call(controller.updateProfile, mockReq(userB,
            { pregnancyStatus: 'no' }, { id: profileId }));
        assert(foreignPatch.nextError && foreignPatch.nextError.statusCode === 404, 'Foreign profile update must 404');
        console.log('  13. Authorization (cross-profile access denied) ........... OK');

        // 14. Profile isolation — user B never sees user A's profiles
        const listB = call(controller.getProfiles, mockReq(userB, {}, {}));
        const idsB = listB.res.payload.data.map(p => p.id);
        assert(!idsB.includes(profileId), "User A's profile must not appear in user B's list");
        assert(listB.res.payload.data.every(p => String(p.name) !== 'Ayesha Khan'), 'No leakage of names either');
        console.log('  14. Profile isolation between users ....................... OK');

        // 15. UNKNOWN risk — never assume safety
        const emptyProfile = call(controller.createProfile, mockReq(userB, {
            name: 'Zaid Ahmed', relation: 'Son', age: 30, sex: 'male'
        })).res.payload.data.profile;
        const emptyCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: emptyProfile.id, medicineId: brufen.id }, {}));
        assert(emptyCheck.res.payload.data.overallRisk === 'UNKNOWN',
            'Empty profile must never conclude LOW risk — UNKNOWN required');
        assert(emptyCheck.res.payload.data.message.includes('limited information'),
            'Empty profile message should explain limited information');
        const unknownMedCheck = call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: emptyProfile.id, medicineName: 'Zzqx Forte Unknown' }, {}));
        assert(unknownMedCheck.res.payload.data.identified === false, 'Unmatched medicine must not be identified');
        assert(unknownMedCheck.res.payload.data.overallRisk === 'UNKNOWN', 'Unidentified medicine must yield UNKNOWN');
        console.log('  15. UNKNOWN risk (empty profile + unidentified medicine) ... OK');

        // Audit trail — safety-critical checks leave traceability records
        const auditCount = prepareAndGet(
            'SELECT COUNT(*) AS c FROM audit_logs WHERE userId = ? AND action LIKE \'%PROFILE%\'', [userA.id]).c;
        assert(auditCount > 0, 'Profile operations should be audit-logged');
        const checkLogs = prepareAndGet(
            'SELECT COUNT(*) AS c FROM safety_check_logs WHERE userId = ?', [userA.id]).c;
        assert(checkLogs > 0, 'Safety checks should be logged with rules triggered');
        console.log('  16. Audit trail (audit_logs + safety_check_logs) .......... OK');

        // Cascade delete — profile removal cleans all safety data
        const victim = call(controller.createProfile, mockReq(userB, {
            name: 'Temp Profile', relation: 'Other', age: 50
        })).res.payload.data.profile;
        call(controller.addProfileAllergies, mockReq(userB,
            { allergies: [{ allergen: 'Latex', allergyType: 'other', severity: 'low' }] }, { id: victim.id }));
        call(controller.addProfileMedication, mockReq(userB,
            { medicineId: panadol.id }, { id: victim.id }));
        call(controller.checkMedicineSafety, mockReq(userB,
            { profileId: victim.id, medicineId: brufen.id }, {}));
        const delProfile = call(controller.deleteProfile, mockReq(userB, {}, { id: victim.id }));
        assert(delProfile.res.payload.success === true, 'Profile deletion should succeed');
        const leftovers = prepareAndGet(`
            SELECT (SELECT COUNT(*) FROM allergies WHERE familyMemberId = ?) AS a,
                   (SELECT COUNT(*) FROM medical_conditions WHERE familyMemberId = ?) AS c,
                   (SELECT COUNT(*) FROM medicine_history WHERE familyMemberId = ?) AS m,
                   (SELECT COUNT(*) FROM safety_check_logs WHERE familyMemberId = ?) AS l`,
            [victim.id, victim.id, victim.id, victim.id]);
        assert(leftovers.a === 0 && leftovers.c === 0 && leftovers.m === 0 && leftovers.l === 0,
            'Deleting a profile must cascade-remove its safety data');
        const goneProfile = call(controller.getProfile, mockReq(userB, {}, { id: victim.id }));
        assert(goneProfile.nextError && goneProfile.nextError.statusCode === 404, 'Deleted profile must 404');
        console.log('  17. Cascade delete removes all profile safety data ........ OK');

        console.log('✓ Family Safety Vault tests passed (17 scenarios)!');
    } finally {
        cleanupUser(userA && userA.id);
        cleanupUser(userB && userB.id);
    }
}

module.exports = runFamilyVaultTests;
