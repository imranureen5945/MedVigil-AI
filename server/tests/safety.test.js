const assert = require('assert');
const { calculateSafetyScore, checkSingleMedicineSafety } = require('../services/interactionEngine');
const { Medicine } = require('../models');
const { prepareAndGet, runQuery } = require('../config/database');

async function runSafetyTests() {
    console.log('--- Testing Safety Engine ---');

    // Create temporary test data (no demo accounts in production seed)
    runQuery("INSERT INTO users (name, email, passwordHash) VALUES ('Safety Test User','safety-test@temp.com','x')");
    const testUser = prepareAndGet('SELECT * FROM users ORDER BY id DESC LIMIT 1');
    runQuery('INSERT INTO family_members (userId, name, age, relation) VALUES (?, ?, 45, ?)', [testUser.id, 'Safety Test Member', 'Self']);
    const testMember = prepareAndGet('SELECT * FROM family_members ORDER BY id DESC LIMIT 1');

    // Record Panadol as a current medicine so duplicate detection has data
    const panadol = Medicine.search('Panadol')[0];
    if (panadol) {
        runQuery(
            'INSERT INTO medicine_history (familyMemberId, medicineId, medicineName, activeIngredient, startDate, isActive) VALUES (?, ?, ?, ?, ?, 1)',
            [testMember.id, panadol.id, panadol.brandName, panadol.genericName, new Date().toISOString().split('T')[0]]
        );
    }

    try {
        // 1. Test safety score calculation for the test member
        const score1 = calculateSafetyScore(testMember.id);
        assert(score1 !== null, 'Score calculation should return object');
        assert(typeof score1.score === 'number', 'Score should be a number');
        assert(score1.score >= 0 && score1.score <= 100, 'Score should be within 0-100');
        assert(['safe', 'moderate', 'critical'].includes(score1.riskLevel), 'Valid risk level returned');
        console.log(`  Test member score: ${score1.score}/100 (${score1.riskLevel})`);

        // 2. Test single medicine safety check for recalled drug
        const recalledMed = Medicine.findByDrapNumber('DRAP-022'); // Zantac (recalled)
        if (recalledMed) {
            const check = checkSingleMedicineSafety(testMember.id, recalledMed);
            assert.strictEqual(check.status, 'critical', 'Recalled medicine should trigger critical warning');
            assert(check.warnings.length > 0, 'Recalled medicine must have warning objects');
        }

        // 3. Test duplicate generic detection (test member already takes Panadol)
        if (panadol) {
            const check = checkSingleMedicineSafety(testMember.id, panadol);
            assert(
                check.warnings.some(w => w.title.includes('Duplicate')),
                'Should detect duplicate active ingredient'
            );
        }

        console.log('✓ Safety Engine & Contraindication tests passed!');
    } finally {
        // Cleanup test data — never leave test rows behind
        runQuery('DELETE FROM medicine_history WHERE familyMemberId = ?', [testMember.id]);
        runQuery('DELETE FROM family_members WHERE id = ?', [testMember.id]);
        runQuery('DELETE FROM users WHERE id = ?', [testUser.id]);
    }
}

module.exports = runSafetyTests;
