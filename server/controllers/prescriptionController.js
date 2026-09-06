const prescriptionInterpreterService = require('../services/prescriptionInterpreterService');
const auditService = require('../services/auditService');

const prescriptionController = {
    interpret: async (req, res, next) => {
        try {
            const { image, ocrText } = req.body;
            
            if (!image && !ocrText) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please provide either a prescription image or OCR text snippet.' 
                });
            }

            const interpretation = await prescriptionInterpreterService.interpretPrescription({
                image,
                ocrText
            });

            if (req.user && interpretation.success) {
                auditService.log(
                    req.user.id, 
                    'INTERPRET_PRESCRIPTION', 
                    'prescriptions', 
                    null, 
                    { 
                        medicineName: interpretation.extractedPrescription?.medicineName,
                        verificationStatus: interpretation.verificationStatus,
                        clarityScore: interpretation.clarityScore,
                        engine: interpretation.engine,
                        requestId: interpretation.requestId
                    }, 
                    req
                );
            }

            res.json(interpretation);
        } catch (error) {
            next(error);
        }
    },

    getAbbreviations: (req, res, next) => {
        try {
            const list = prescriptionInterpreterService.getAbbreviationsDictionary();
            res.json({ success: true, count: list.length, data: list });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = prescriptionController;
