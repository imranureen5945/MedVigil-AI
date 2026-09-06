const { initDb } = require('../config/database');
const runAuthTests = require('./auth.test');
const runSafetyTests = require('./safety.test');
const runMedicineTests = require('./medicines.test');
const runOcrTests = require('./ocr.test');
const runPrescriptionInterpreterTests = require('./prescription.test');
const runFamilyVaultTests = require('./familyVault.test');
const runTriageTests = require('./triage.test');

async function main() {
    console.log('================================================');
    console.log('    MedVigil AI Automated Test Suite Runner     ');
    console.log('================================================\n');

    try {
        await initDb();
        console.log('✓ Database initialized for tests.\n');

        await runAuthTests();
        console.log('');
        await runSafetyTests();
        console.log('');
        await runMedicineTests();
        console.log('');
        await runOcrTests();
        console.log('');
        await runPrescriptionInterpreterTests();
        console.log('');
        await runFamilyVaultTests();
        console.log('');
        await runTriageTests();
        console.log('');

        console.log('================================================');
        console.log('  🎉 ALL AUTOMATED SUITE TESTS PASSED (100%)    ');
        console.log('================================================');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test Suite Failed:', err);
        process.exit(1);
    }
}

main();
