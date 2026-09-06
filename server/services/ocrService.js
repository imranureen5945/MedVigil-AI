/**
 * OCR text cleaning and spelling correction heuristics for Pakistani pharmaceutical products
 */

const COMMON_OCR_TYPOS = {
    'panad0l': 'Panadol',
    'panadl': 'Panadol',
    'panadol': 'Panadol',
    'panadole': 'Panadol',
    'calp0l': 'Calpol',
    'calpl': 'Calpol',
    'augmntin': 'Augmentin',
    'augmantin': 'Augmentin',
    'augmntn': 'Augmentin',
    'r1sek': 'Risek',
    'risik': 'Risek',
    'risec': 'Risek',
    'brufn': 'Brufen',
    'bruphn': 'Brufen',
    'ponstn': 'Ponstan',
    'flagl': 'Flagyl',
    'flgyl': 'Flagyl',
    'novidat': 'Novidat',
    'novidte': 'Novidat',
    'ciproxn': 'Ciproxin',
    'cipro': 'Ciprofloxacin',
    'norvas': 'Norvasc',
    'concor': 'Concor',
    'gluco': 'Glucophage',
    'glucophage': 'Glucophage',
    'zantac': 'Zantac',
    'gaviscon': 'Gaviscon',
    'motilium': 'Motilium',
    'buscopan': 'Buscopan',
    'ventolin': 'Ventolin',
    'septran': 'Septran'
};

const ocrService = {
    /**
     * Clean and normalize raw OCR text
     */
    cleanOcrText: (rawText) => {
        if (!rawText || typeof rawText !== 'string') return '';
        return rawText
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Correct common OCR spelling mistakes
     */
    correctSpellingMistakes: (text) => {
        if (!text) return '';
        let cleaned = text;
        for (const [typo, correction] of Object.entries(COMMON_OCR_TYPOS)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'gi');
            cleaned = cleaned.replace(regex, correction);
        }
        return cleaned;
    },

    /**
     * Extract dosage strengths (e.g., 500mg, 20mg, 1g, 250mg/5ml)
     */
    extractStrength: (text) => {
        if (!text) return null;
        const match = text.match(/\b\d+(\.\d+)?\s*(mg|g|mcg|ml|iu|%|mg\/ml|mg\/5ml)\b/i);
        return match ? match[0] : null;
    },

    /**
     * Extract batch numbers (e.g. B.No: 12345, Batch: AB-90)
     */
    extractBatchNumber: (text) => {
        if (!text) return null;
        const match = text.match(/(?:b\.?no|batch(?:\s+no)?|lot(?:\s+no)?)[.:\s]+([A-Z0-9\-_]+)/i);
        return match ? match[1] : null;
    },

    /**
     * Extract expiry dates (e.g. Exp: 12/2026, Exp Date: 08-2027)
     */
    extractExpiryDate: (text) => {
        if (!text) return null;
        const match = text.match(/(?:exp(?:iry)?(?:\s+date)?|best\s+before)[.:\s]+([0-9]{1,2}[\/\-\.][0-9]{2,4}|[A-Za-z]{3}\s*[0-9]{2,4})/i);
        return match ? match[1] : null;
    },

    /**
     * Normalize image payload (handles base64 data URL or raw buffer)
     */
    parseImageInput: (imageInput) => {
        if (!imageInput) return null;
        
        if (typeof imageInput === 'string') {
            const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (match) {
                return {
                    mimeType: match[1],
                    base64Data: match[2],
                    buffer: Buffer.from(match[2], 'base64')
                };
            } else {
                // Assume pure base64 jpeg/png
                return {
                    mimeType: 'image/jpeg',
                    base64Data: imageInput,
                    buffer: Buffer.from(imageInput, 'base64')
                };
            }
        } else if (Buffer.isBuffer(imageInput)) {
            return {
                mimeType: 'image/jpeg',
                base64Data: imageInput.toString('base64'),
                buffer: imageInput
            };
        }

        return null;
    }
};

module.exports = ocrService;
