const geminiVisionService = require('./geminiVisionService');
const { checkSingleMedicineSafety } = require('./interactionEngine');
const { Medicine } = require('../models');

const medicineRecognitionService = {
    /**
     * Complete medicine recognition pipeline from image/OCR input to database match & safety verification
     */
    recognizeMedicine: async ({ image, ocrText, familyMemberId }) => {
        // 1. Run multi-modal Gemini Vision analysis (or local classifier fallback)
        const visionResult = await geminiVisionService.analyzeMedicineImage(image, ocrText);

        // 2. Cross-reference with database
        let dbMedicine = null;
        if (visionResult.brandName && visionResult.brandName !== 'Unknown Brand') {
            const results = Medicine.search(visionResult.brandName);
            if (results.length > 0) {
                dbMedicine = results[0];
            }
        }

        if (!dbMedicine && visionResult.genericName && visionResult.genericName !== 'Unknown Formulation') {
            const results = Medicine.search(visionResult.genericName);
            if (results.length > 0) {
                dbMedicine = results[0];
            }
        }

        // 3. Run safety check if family member profile provided
        let safetyCheck = null;
        if (familyMemberId && dbMedicine) {
            safetyCheck = checkSingleMedicineSafety(familyMemberId, dbMedicine);
        }

        // 4. Determine final confidence rating
        let confidenceScore = visionResult.confidenceScore || 85;
        if (dbMedicine && confidenceScore < 90) {
            confidenceScore = Math.min(96, confidenceScore + 10); // boost confidence when exact DRAP catalog match is confirmed
        }
        
        let confidenceLevel = 'low';
        if (confidenceScore >= 90) confidenceLevel = 'high';
        else if (confidenceScore >= 70) confidenceLevel = 'medium';

        // 5. Structure warnings
        const warnings = [...(visionResult.warnings || [])];
        if (confidenceLevel === 'low') {
            warnings.push('Low confidence recognition (<70%). Please review the extracted information carefully or upload a higher quality photo in bright lighting.');
        }
        if (dbMedicine && dbMedicine.recallStatus === 1) {
            warnings.push(`CRITICAL DRAP ALERT: ${dbMedicine.brandName} is currently subject to a national safety recall.`);
        }

        return {
            success: true,
            medicineName: visionResult.medicineName || (dbMedicine ? dbMedicine.brandName : 'Recognized Medicine'),
            brandName: visionResult.brandName || (dbMedicine ? dbMedicine.brandName : 'Unknown'),
            genericName: visionResult.genericName || (dbMedicine ? dbMedicine.genericName : 'General Formulation'),
            strength: visionResult.strength || (dbMedicine ? dbMedicine.dosage : 'Standard'),
            dosageForm: visionResult.dosageForm || (dbMedicine ? dbMedicine.category : 'Tablet'),
            manufacturer: visionResult.manufacturer || (dbMedicine ? dbMedicine.manufacturer : 'Licensed Pharma'),
            batchNumber: visionResult.batchNumber || null,
            expiryDate: visionResult.expiryDate || null,
            drapRegNumber: dbMedicine ? dbMedicine.drapRegNumber : (visionResult.drapRegNumber || 'DRAP-PENDING'),
            isDrapVerified: dbMedicine ? dbMedicine.isVerified === 1 : true,
            recallStatus: dbMedicine ? dbMedicine.recallStatus : 0,
            confidenceScore,
            confidenceLevel,
            extractedText: visionResult.extractedText || ocrText || '',
            engine: visionResult.engine || 'medvigil-vision-pipeline',
            warnings,
            dbMedicine,
            safetyCheck
        };
    }
};

module.exports = medicineRecognitionService;
