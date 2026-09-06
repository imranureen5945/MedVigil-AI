const assert = require('assert');
const medicineRecognitionService = require('../services/medicineRecognitionService');
const ocrService = require('../services/ocrService');

async function runOcrTests() {
    console.log('--- Testing Gemini Vision & OCR Medicine Recognition Pipeline ---');

    // 1. Test OCR text cleaning & typo correction
    const rawOcr = 'PANAD0L 500MG TAB GSK B.No: PK1234 EXP: 12/2026';
    const corrected = ocrService.correctSpellingMistakes(ocrService.cleanOcrText(rawOcr));
    assert(corrected.includes('Panadol'), 'Should correct PANAD0L typo to Panadol');

    // 2. Test strength, batch, and expiry extraction
    const strength = ocrService.extractStrength(rawOcr);
    assert.strictEqual(strength, '500MG', 'Should extract 500MG strength');

    const batch = ocrService.extractBatchNumber(rawOcr);
    assert.strictEqual(batch, 'PK1234', 'Should extract PK1234 batch');

    const expiry = ocrService.extractExpiryDate(rawOcr);
    assert.strictEqual(expiry, '12/2026', 'Should extract 12/2026 expiry');

    // 3. Test multi-modal recognition pipeline for Panadol
    const panadolResult = await medicineRecognitionService.recognizeMedicine({
        ocrText: 'PANADOL EXTRA 500mg PARACETAMOL GSK',
        familyMemberId: 1
    });

    assert.strictEqual(panadolResult.success, true, 'Recognition should be successful');
    assert(panadolResult.brandName.toLowerCase().includes('panadol'), 'Should identify brand as Panadol');
    assert(panadolResult.confidenceScore >= 70, 'Confidence score should be >= 70%');
    assert(['high', 'medium', 'low'].includes(panadolResult.confidenceLevel), 'Confidence level should be valid');
    console.log(`  Panadol Recognition Confidence: ${panadolResult.confidenceScore}% (${panadolResult.confidenceLevel})`);

    // 4. Test low confidence recognition handling for blurry text
    const blurryResult = await medicineRecognitionService.recognizeMedicine({
        ocrText: 'xyz123 unclear blurry packaging text'
    });
    assert.strictEqual(blurryResult.success, true, 'Should return structured fallback object');
    assert(blurryResult.confidenceScore < 70, 'Unclear text should have low confidence score');
    assert.strictEqual(blurryResult.confidenceLevel, 'low', 'Confidence level should be low');
    assert(blurryResult.warnings.length > 0, 'Low confidence must produce warnings for user review');
    console.log(`  Blurry Packaging Test Passed: ${blurryResult.confidenceScore}% confidence with ${blurryResult.warnings.length} warnings.`);

    console.log('✓ Gemini OCR & Medicine Recognition tests passed!');
}

module.exports = runOcrTests;
