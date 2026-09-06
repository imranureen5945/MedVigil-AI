const { ScanRecord, Medicine, MedicineHistory, FamilyMember } = require('../models');
const medicineRecognitionService = require('../services/medicineRecognitionService');
const auditService = require('../services/auditService');

exports.analyzeImage = async (req, res, next) => {
    try {
        const { image, ocrText, familyMemberId } = req.body;
        
        if (!image && !ocrText) {
            return res.status(400).json({ 
                success: false, 
                message: 'Either image data (base64) or OCR text is required for medicine recognition.' 
            });
        }

        const result = await medicineRecognitionService.recognizeMedicine({
            image,
            ocrText,
            familyMemberId
        });

        if (req.user) {
            auditService.log(
                req.user.id, 
                'GEMINI_OCR_ANALYZE', 
                'scan_records', 
                result.dbMedicine?.id || null, 
                { 
                    medicineName: result.medicineName, 
                    confidenceScore: result.confidenceScore,
                    confidenceLevel: result.confidenceLevel,
                    engine: result.engine
                }, 
                req
            );
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.lookupScan = async (req, res, next) => {
    try {
        const { text, familyMemberId, image } = req.body;
        if (!text && !image) {
            return res.status(400).json({ success: false, message: 'OCR text or image is required' });
        }

        const result = await medicineRecognitionService.recognizeMedicine({
            image,
            ocrText: text,
            familyMemberId
        });

        res.json({
            success: true,
            match: result.dbMedicine || {
                brandName: result.brandName,
                genericName: result.genericName,
                dosage: result.strength,
                category: result.dosageForm,
                manufacturer: result.manufacturer,
                recallStatus: result.recallStatus,
                isVerified: result.isDrapVerified ? 1 : 0,
                drapRegNumber: result.drapRegNumber
            },
            recognition: result,
            matchedKeyword: result.brandName,
            safetyCheck: result.safetyCheck,
            ocrSnippet: result.extractedText ? result.extractedText.substring(0, 150) : ''
        });
    } catch(err) {
        next(err);
    }
};

exports.saveScan = (req, res, next) => {
    try {
        const { familyMemberId, medicineId, ocrText, addToPrescriptions = true, dosageNotes } = req.body;
        
        if (!familyMemberId || !medicineId) {
            return res.status(400).json({ success: false, message: 'familyMemberId and medicineId are required' });
        }

        const scanRecord = ScanRecord.create({
            familyMemberId,
            medicineId,
            ocrText: ocrText || ''
        });

        // Optionally add directly to active prescriptions
        let medicationRecord = null;
        if (addToPrescriptions) {
            medicationRecord = MedicineHistory.create({
                familyMemberId,
                medicineId,
                dosageNotes: dosageNotes || 'Added via Label Scan',
                isActive: 1
            });
        }

        if (req.user) {
            auditService.log(req.user.id, 'SAVE_OCR_SCAN', 'scan_records', scanRecord.id, { medicineId, familyMemberId }, req);
        }

        res.status(201).json({
            success: true,
            message: 'Scan saved and verified with DRAP',
            scanRecord,
            medicationRecord
        });
    } catch(err) {
        next(err);
    }
};

exports.getScanHistory = (req, res, next) => {
    try {
        const { familyMemberId } = req.params;
        const history = ScanRecord.findByFamilyMember(familyMemberId);
        res.json(history);
    } catch(err) {
        next(err);
    }
};
