const assert = require('assert');
const { Medicine, Interaction } = require('../models');
const aiService = require('../services/aiService');

async function runMedicineTests() {
    console.log('--- Testing Medicine Database & AI Query ---');

    // 1. Test medicine search
    const results = Medicine.search('Augmentin');
    assert(results.length > 0, 'Searching Augmentin should return records');
    assert(results[0].genericName.includes('Amoxicillin'), 'Generic name should match Amoxicillin');

    // 2. Test DRAP recall lookup
    const recalls = Medicine.findRecalls();
    assert(recalls.length > 0, 'Recalled medicines should exist in Pakistani dataset');
    console.log(`  Found ${recalls.length} DRAP recalled drug entries`);

    // 3. Test drug interaction lookup
    const interactions = Interaction.findInteractions('Aspirin', 'Ibuprofen');
    assert(interactions.length > 0, 'Aspirin + Ibuprofen interaction should be registered');
    assert(interactions[0].description.length > 0, 'Interaction description must exist');

    // 4. Test Roman Urdu symptom analysis in AI service
    const aiUrduResult = await aiService.analyzeSymptoms('mujhe bukhar aur sar dard hai', 'ur');
    assert(aiUrduResult.matchedSymptoms.length >= 2, 'Should match both bukhar (fever) and sar dard (headache)');
    assert(aiUrduResult.suggestedMedicines.length > 0, 'Should suggest safe therapeutic options');

    console.log('✓ Medicine search, DRAP verification & AI NLP tests passed!');
}

module.exports = runMedicineTests;
