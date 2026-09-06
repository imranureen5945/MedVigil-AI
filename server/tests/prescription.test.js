const assert = require('assert');
const prescriptionInterpreterService = require('../services/prescriptionInterpreterService');

async function runPrescriptionInterpreterTests() {
    console.log('--- Testing Prescription Interpreter AI Pipeline ---');

    // 1. Test abbreviations dictionary lookup
    const abbreviations = prescriptionInterpreterService.getAbbreviationsDictionary();
    assert(abbreviations.length >= 8, 'Abbreviations dictionary should contain standard codes (OD, BD, TDS, SOS, etc.)');
    const bdAbbr = abbreviations.find(a => a.code === 'BD');
    assert(bdAbbr !== undefined, 'BD abbreviation must exist');
    assert.strictEqual(bdAbbr.meaning, 'Twice daily', 'BD meaning must be Twice daily');
    assert(bdAbbr.romanUrdu.includes('2 dafa'), 'BD Roman Urdu must specify 2 dafa');

    // 2. Test interpretation for Tab Augmentin 625mg 1 tab BD PC x 5 days
    const augResult = await prescriptionInterpreterService.interpretPrescription({
        ocrText: 'Tab Augmentin 625mg 1 tab BD PC x 5 days after food'
    });

    assert.strictEqual(augResult.success, true, 'Augmentin interpretation must succeed');
    assert(augResult.extractedPrescription.medicineName.includes('Augmentin'), 'Medicine name should be Augmentin');
    assert.strictEqual(augResult.extractedPrescription.strength, '625mg', 'Strength should be 625mg');
    assert.strictEqual(augResult.extractedPrescription.duration, '5 days', 'Duration should be 5 days');
    
    // Check Jargon Translations
    assert(augResult.jargonTranslations.length >= 1, 'Should decode abbreviations like BD or PC');
    const hasBD = augResult.jargonTranslations.some(j => j.code === 'BD');
    assert(hasBD, 'Should translate BD code');

    // Check Medicine Purpose
    assert(augResult.medicinePurpose.length > 0, 'Medicine purpose should be populated');
    assert(augResult.medicinePurpose.toLowerCase().includes('bacterial'), 'Augmentin purpose should mention bacterial infections');

    // Check Smart Medication Schedule
    assert(augResult.medicationSchedule.slots.length === 2, 'BD should produce 2 daily schedule slots (Morning & Night)');
    assert(augResult.medicationSchedule.slots[0].time.includes('Morning'), 'Slot 1 should be Morning');
    assert(augResult.medicationSchedule.slots[1].time.includes('Night'), 'Slot 2 should be Night');

    // Check Plain Language Summary (English & Roman Urdu)
    assert(augResult.plainLanguageSummary.english.length > 0, 'English summary must be generated');
    assert(augResult.plainLanguageSummary.romanUrdu.length > 0, 'Roman Urdu summary must be generated');
    assert(augResult.plainLanguageSummary.romanUrdu.includes('Doctor ne'), 'Roman Urdu must contain patient-friendly wording');

    // 3. Test interpretation for Cap Risek 20mg 1 cap OD AC x 14 days
    const risekResult = await prescriptionInterpreterService.interpretPrescription({
        ocrText: 'Cap Risek 20mg 1 cap OD AC x 14 days'
    });
    assert(risekResult.extractedPrescription.medicineName.includes('Risek'), 'Medicine name should be Risek');
    assert(risekResult.jargonTranslations.some(j => j.code === 'OD'), 'Should translate OD');
    assert(risekResult.jargonTranslations.some(j => j.code === 'AC'), 'Should translate AC (before meals)');
    assert.strictEqual(risekResult.medicationSchedule.slots.length, 1, 'OD should produce 1 morning schedule slot');

    // 4. Test interpretation for Tab Panadol 500mg TDS SOS
    const panadolResult = await prescriptionInterpreterService.interpretPrescription({
        ocrText: 'Tab Panadol 500mg 1 tab TDS SOS'
    });
    assert(panadolResult.jargonTranslations.some(j => j.code === 'SOS' || j.code === 'TDS'), 'Should translate SOS or TDS');
    assert(panadolResult.medicinePurpose.toLowerCase().includes('fever') || panadolResult.medicinePurpose.toLowerCase().includes('pain'), 'Panadol purpose should mention fever or pain');

    console.log('✓ Prescription Interpreter AI handwriting decoding, jargon translation, and schedule generation tests passed!');
}

module.exports = runPrescriptionInterpreterTests;
