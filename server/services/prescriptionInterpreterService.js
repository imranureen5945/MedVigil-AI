const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const ocrService = require('./ocrService');
const { Medicine } = require('../models');

// Standard Medical Abbreviation Dictionary (with English and Roman Urdu explanations)
const MEDICAL_ABBREVIATIONS = {
    'OD': {
        meaning: 'Once daily',
        english: 'Take the medicine once every 24 hours.',
        romanUrdu: 'Rozana sirf 1 dafa dawa leni hai.',
        slots: ['Morning (8:00 AM)']
    },
    'BD': {
        meaning: 'Twice daily',
        english: 'Take the medicine two times daily (every 12 hours).',
        romanUrdu: 'Rozana 2 dafa dawa leni hai (subah aur raat).',
        slots: ['Morning (8:00 AM)', 'Night (8:00 PM)']
    },
    'BID': {
        meaning: 'Twice daily',
        english: 'Take the medicine two times daily.',
        romanUrdu: 'Rozana 2 dafa dawa leni hai.',
        slots: ['Morning (8:00 AM)', 'Night (8:00 PM)']
    },
    'TDS': {
        meaning: 'Three times daily',
        english: 'Take the medicine three times daily (every 8 hours).',
        romanUrdu: 'Rozana 3 dafa dawa leni hai (subah, dopehar, raat).',
        slots: ['Morning (8:00 AM)', 'Afternoon (2:00 PM)', 'Night (8:00 PM)']
    },
    'TID': {
        meaning: 'Three times daily',
        english: 'Take the medicine three times daily.',
        romanUrdu: 'Rozana 3 dafa dawa leni hai.',
        slots: ['Morning (8:00 AM)', 'Afternoon (2:00 PM)', 'Night (8:00 PM)']
    },
    'QID': {
        meaning: 'Four times daily',
        english: 'Take the medicine four times daily (every 6 hours).',
        romanUrdu: 'Rozana 4 dafa dawa leni hai (har 6 ghante baad).',
        slots: ['Morning (6:00 AM)', 'Noon (12:00 PM)', 'Evening (6:00 PM)', 'Night (12:00 AM)']
    },
    'SOS': {
        meaning: 'Take when needed (Emergency / As required)',
        english: 'Take only when necessary or symptoms occur (do not take on a fixed routine).',
        romanUrdu: 'Sirf zaroorat ya takleef ke waqt dawa leni hai.',
        slots: ['As Needed (PRN)']
    },
    'PRN': {
        meaning: 'As needed',
        english: 'Take as required when symptoms appear.',
        romanUrdu: 'Sirf takleef ya zaroorat ke waqt khayein.',
        slots: ['As Needed']
    },
    'HS': {
        meaning: 'Before sleep (Hora Somni)',
        english: 'Take at night right before going to bed.',
        romanUrdu: 'Raat ko sone se theek pehle dawa leni hai.',
        slots: ['Night (10:00 PM)']
    },
    'AC': {
        meaning: 'Before meals (Ante Cibum)',
        english: 'Take on an empty stomach approximately 30 minutes before eating food.',
        romanUrdu: 'Khana khane se 30 minute pehle (nihar munh) leni hai.',
        slots: ['Before Meals']
    },
    'PC': {
        meaning: 'After meals (Post Cibum)',
        english: 'Take after finishing your meal with water.',
        romanUrdu: 'Khana khane ke baad paani ke sath leni hai.',
        slots: ['After Meals']
    },
    'STAT': {
        meaning: 'Immediately (Single urgent dose)',
        english: 'Take immediately right now as a single dose.',
        romanUrdu: 'Fauri tor par abhi isi waqt dawa leni hai.',
        slots: ['Immediately']
    },
    'PO': {
        meaning: 'By mouth (Oral)',
        english: 'To be swallowed orally with water.',
        romanUrdu: 'Munh ke zariye paani ke sath nigalni hai.',
        slots: ['Oral']
    }
};

// Concise purpose dictionary for common Pakistani medicines (1-2 lines max)
const COMMON_MEDICINE_PURPOSES = {
    'augmentin': 'Commonly prescribed for bacterial infections such as throat, ear, respiratory, or skin infections.',
    'amoxil': 'Commonly used to treat bacterial ear, chest, and urinary tract infections.',
    'panadol': 'Commonly used to reduce fever, relieve headaches, body aches, and mild pain.',
    'calpol': 'Commonly prescribed for pediatric fever, teething discomfort, and pain relief.',
    'risek': 'Commonly prescribed to reduce stomach acid, relieve heartburn, and heal gastric ulcers.',
    'zantac': 'Formerly prescribed for heartburn and gastric acidity relief (Note: Recalled).',
    'brufen': 'Commonly used to relieve acute pain, dental pain, fever, and inflammation.',
    'ponstan': 'Commonly prescribed for menstrual cramps, dental pain, and acute inflammatory pain.',
    'flagyl': 'Commonly prescribed for stomach infections, amoebic dysentery, and dental bacterial infections.',
    'novidat': 'Commonly prescribed for typhoid fever, urinary tract, and gastrointestinal bacterial infections.',
    'ciproxin': 'Commonly prescribed for severe bacterial urinary tract, typhoid, and skin infections.',
    'norvasc': 'Commonly prescribed to lower high blood pressure and prevent cardiovascular complications.',
    'concor': 'Commonly prescribed to control high blood pressure, irregular heartbeat, and manage angina.',
    'glucophage': 'Commonly prescribed to lower blood sugar levels in patients with Type 2 Diabetes.',
    'lipitor': 'Commonly prescribed to lower LDL cholesterol and protect heart health.',
    'gaviscon': 'Commonly prescribed for rapid relief from acid reflux, indigestion, and burning chest sensations.',
    'motilium': 'Commonly prescribed to treat nausea, vomiting, fullness, and bloating.',
    'buscopan': 'Commonly prescribed for abdominal cramps, colicky stomach pain, and bowel spasms.',
    'ventolin': 'Commonly used as an inhaler for fast relief from asthma attacks, wheezing, and chest tightness.'
};

const PRESCRIPTION_INTERPRETER_PROMPT = `
You are the MedVigil "Prescription Interpreter AI" specialist for Pakistan.
Your tagline is: "Scan. Decode. Understand."

Your sole responsibility is to decipher handwritten doctor prescriptions, printed prescription slips, or medicine packaging instructions, and convert them into clear, friendly language that everyday patients can understand.

ABSOLUTE RULES — VIOLATION IS CRITICAL:
- NEVER guess a medicine name. If the image does not clearly show a medicine name, return medicineName as "UNKNOWN".
- NEVER autocomplete or infer medicine names from partial text.
- NEVER use previous scan results or context from other prescriptions.
- NEVER invent dosage, duration, or frequency if not visible in the image.
- NEVER assume a medicine based on therapeutic category or common usage.
- If any field cannot be read with high confidence, set it to null and add a warning.
- Accuracy is more important than completeness. It is better to say "UNKNOWN" than to guess wrong.

INSTRUCTIONS:
1. Examine the image carefully. Read ONLY what is clearly visible and legible.
2. Extract (only if clearly readable in the image):
   - medicineName: The exact medicine/brand name visible in the prescription. If unclear, use "UNKNOWN".
   - brandName: Trade brand name as written. If unclear, use "UNKNOWN".
   - genericName: Active ingredient if visible. If unclear, use null.
   - strength: (e.g., "625mg", "20mg", "500mg", "10mg/5ml") — only if clearly written.
   - dosage: (e.g., "1 tablet", "1 capsule", "2 teaspoons (10ml)") — only if clearly written.
   - frequencyRaw: (e.g., "BD", "TDS", "OD", "1+0+1", "SOS", "HS") — only if clearly written.
   - frequencyDecoded: Human-readable decoding of the frequency code.
   - duration: (e.g., "5 days", "14 days") — only if clearly written.
   - timingInstructions: (e.g., "After meals (PC)", "Before breakfast (AC)") — only if clearly written.
   - additionalNotes: Any special instructions clearly visible.

3. Identify Medical Abbreviations & Jargon:
   - For every abbreviation found (e.g. OD, BD, TDS, QID, SOS, HS, AC, PC, STAT, 1+0+1), provide:
     - code (e.g. "BD")
     - meaning (e.g. "Twice daily")
     - plainEnglish (e.g. "Take the medicine two times daily (every 12 hours).")
     - romanUrdu (e.g. "Rozana 2 dafa dawa leni hai (subah aur raat).")

4. Generate a Smart Medication Schedule:
   - Convert the frequency into daily time slots (only if frequency was clearly identified).

5. Medicine Purpose Summary:
   - Exactly 1 to 2 lines explaining WHY this medicine is commonly prescribed in simple patient-friendly terms.
   - If medicine is UNKNOWN, state: "Medicine could not be confidently identified. Please upload a clearer prescription or enter the medicine manually."

6. Plain Language Summaries:
   - summaryEnglish: Clear summary of the prescription.
   - summaryRomanUrdu: Same summary in Roman Urdu.

7. Completeness & Clarity Checker (Warnings):
   - Detect missing dosage, missing duration, unclear handwriting, or partial unreadable names.
   - warnings: Array of strings.
   - clarityScore: Integer 0-100 representing handwriting/OCR legibility.

8. BOUNDARIES:
   - Do NOT mention DRAP recalls, drug-drug interactions, allergy testing, pregnancy risks, organ safety scores, or doctor tele-consultations.

Return ONLY a valid JSON object without markdown fences, with this EXACT format:
{
  "extractedPrescription": {
    "medicineName": "...",
    "brandName": "...",
    "genericName": "..." or null,
    "strength": "..." or null,
    "dosage": "..." or null,
    "frequency": "..." or null,
    "frequencyDecoded": "..." or null,
    "duration": "..." or null,
    "timing": "..." or null,
    "additionalNotes": "..." or null
  },
  "jargonTranslations": [
    {
      "code": "...",
      "meaning": "...",
      "plainEnglish": "...",
      "romanUrdu": "..."
    }
  ],
  "medicinePurpose": "...",
  "medicationSchedule": {
    "slots": [
      { "time": "...", "dose": "...", "instruction": "..." }
    ],
    "durationText": "..."
  },
  "plainLanguageSummary": {
    "english": "...",
    "romanUrdu": "..."
  },
  "completenessWarnings": [],
  "clarityScore": 95,
  "confidenceLevel": "high",
  "verificationStatus": "VERIFIED",
  "rawText": "all visible text verbatim"
}
`;

/**
 * Supported image MIME types and max size (10MB)
 */
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const prescriptionInterpreterService = {
    /**
     * Validate uploaded image before processing
     */
    validateImage: (parsedImage) => {
        if (!parsedImage) {
            return { valid: false, error: 'No valid image data provided. Please upload a prescription image.' };
        }
        if (!VALID_IMAGE_TYPES.includes(parsedImage.mimeType)) {
            return { valid: false, error: 'Unsupported image format. Please upload a JPEG, PNG, or WebP image.' };
        }
        if (parsedImage.buffer && parsedImage.buffer.length > MAX_IMAGE_SIZE) {
            return { valid: false, error: 'Image file is too large. Maximum size is 10MB.' };
        }
        if (parsedImage.buffer && parsedImage.buffer.length < 1024) {
            return { valid: false, error: 'Image appears to be blank or corrupted. Please upload a valid prescription image.' };
        }
        return { valid: true };
    },

    /**
     * Decode and interpret a handwritten or printed prescription image / OCR text
     * Each scan is fully isolated: no state leakage between requests.
     */
    interpretPrescription: async ({ image, ocrText }) => {
        // Generate unique request ID for scan isolation
        const requestId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

        const parsedImage = image ? ocrService.parseImageInput(image) : null;

        // Image validation (only if image is provided)
        if (image) {
            const validation = prescriptionInterpreterService.validateImage(parsedImage);
            if (!validation.valid) {
                return {
                    success: false,
                    requestId,
                    error: validation.error,
                    verificationStatus: 'REJECTED',
                    engine: 'medvigil-image-validator'
                };
            }
        }

        // Must have either image or text
        if (!parsedImage && !ocrText) {
            return {
                success: false,
                requestId,
                error: 'Please provide either a prescription image or text snippet.',
                verificationStatus: 'REJECTED',
                engine: 'medvigil-validator'
            };
        }

        // 1. Try Gemini Vision if API key is configured and image is available
        if (env.geminiApiKey && parsedImage) {
            try {
                const genAI = new GoogleGenerativeAI(env.geminiApiKey);
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                });

                const imagePart = {
                    inlineData: {
                        data: parsedImage.base64Data,
                        mimeType: parsedImage.mimeType || "image/jpeg"
                    }
                };

                const prompt = `Decode this doctor prescription image. ${ocrText ? `OCR Hint: "${ocrText}"` : ''}`;

                const result = await model.generateContent([
                    PRESCRIPTION_INTERPRETER_PROMPT,
                    prompt,
                    imagePart
                ]);

                const response = await result.response;
                const text = response.text();
                const parsed = JSON.parse(text);

                // Verification Pass 2: Validate extracted medicine against database
                const verification = prescriptionInterpreterService.verifyMedicine(parsed);

                return {
                    ...parsed,
                    ...verification,
                    requestId,
                    engine: 'gemini-1.5-flash-prescription-decoder',
                    success: true
                };
            } catch (geminiError) {
                console.error('Gemini Prescription Decoder error:', geminiError.message);
                // Fall through to local interpreter
            }
        }

        // 2. Intelligent Local Rule-Based Prescription Decoder (no guessing)
        return prescriptionInterpreterService.fallbackInterpreter(ocrText, requestId);
    },

    /**
     * Verification Pass 2: Cross-check extracted medicine against DRAP database
     * Returns verificationStatus: VERIFIED | UNCERTAIN | REJECTED
     */
    verifyMedicine: (parsedResult) => {
        const extracted = parsedResult.extractedPrescription;
        if (!extracted) {
            return { verificationStatus: 'REJECTED', confidenceLevel: 'low', confidenceScore: 0 };
        }

        const medName = extracted.medicineName || extracted.brandName || '';

        // UNKNOWN medicine from AI
        if (!medName || medName.toUpperCase() === 'UNKNOWN') {
            return {
                verificationStatus: 'REJECTED',
                confidenceLevel: 'low',
                confidenceScore: 0,
                completenessWarnings: [
                    ...(parsedResult.completenessWarnings || []),
                    'Medicine name could not be confidently identified from the image. Please upload a clearer prescription or enter the medicine manually.'
                ]
            };
        }

        // Search database for the extracted medicine name
        const results = Medicine.search(medName.replace(/\d+mg/gi, '').trim());
        if (results.length > 0) {
            const match = results.find(r => 
                r.brandName.toLowerCase() === medName.toLowerCase().replace(/\d+mg/gi, '').trim()
            ) || results[0];
            
            const score = match.brandName.toLowerCase() === medName.toLowerCase().replace(/\d+mg/gi, '').trim() ? 95 : 78;
            return {
                verificationStatus: score >= 90 ? 'VERIFIED' : 'UNCERTAIN',
                confidenceLevel: score >= 90 ? 'high' : 'medium',
                confidenceScore: score,
                dbMatch: {
                    brandName: match.brandName,
                    genericName: match.genericName,
                    manufacturer: match.manufacturer,
                    category: match.category
                }
            };
        }

        // No database match — mark as uncertain, do NOT guess
        return {
            verificationStatus: 'UNCERTAIN',
            confidenceLevel: 'low',
            confidenceScore: 40,
            completenessWarnings: [
                ...(parsedResult.completenessWarnings || []),
                'Extracted medicine name was not found in the DRAP registered database. Please verify with your pharmacist.'
            ]
        };
    },

    /**
     * Local Rule-Based Prescription Decoder — NEVER guesses medicine names.
     * If no medicine can be identified from the text, returns UNKNOWN.
     */
    fallbackInterpreter: (rawText = '', requestId = '') => {
        const text = ocrService.cleanOcrText(rawText);
        const rawTextEvidence = text; // Store raw OCR evidence

        // 1. Detect Medicine Name from database — NO hardcoded defaults
        let detectedBrand = null;
        let detectedGeneric = null;
        let detectedStrength = ocrService.extractStrength(text);
        let matchedMedicine = null;
        let matchConfidence = 0;

        const words = text.split(/\s+/).filter(w => w.length >= 3);
        for (const word of words) {
            // Skip common non-medicine words
            const skipWords = ['tab', 'cap', 'syp', 'inj', 'mg', 'ml', 'rx', 'doctor', 'patient', 'take', 'with', 'water', 'after', 'before', 'meals', 'food', 'days', 'weeks', 'months', 'tablets', 'capsule', 'tablet', 'suspension', 'syrup'];
            if (skipWords.includes(word.toLowerCase())) continue;

            const results = Medicine.search(word);
            if (results.length > 0) {
                // Check for exact brand name match first
                const exact = results.find(r => r.brandName.toLowerCase() === word.toLowerCase());
                if (exact) {
                    matchedMedicine = exact;
                    detectedBrand = exact.brandName;
                    detectedGeneric = exact.genericName;
                    matchConfidence = 95;
                    break;
                }
                // Partial match — lower confidence
                if (!matchedMedicine) {
                    matchedMedicine = results[0];
                    detectedBrand = results[0].brandName;
                    detectedGeneric = results[0].genericName;
                    matchConfidence = 72;
                }
            }
        }

        // If no medicine found in text, return UNKNOWN — NEVER guess
        if (!detectedBrand) {
            return {
                success: true,
                requestId,
                verificationStatus: 'REJECTED',
                confidenceLevel: 'low',
                confidenceScore: 0,
                engine: 'medvigil-prescription-interpreter-local',
                rawText: rawTextEvidence,
                extractedPrescription: {
                    medicineName: 'UNKNOWN',
                    brandName: 'UNKNOWN',
                    genericName: null,
                    strength: detectedStrength || null,
                    dosage: null,
                    frequency: null,
                    frequencyDecoded: null,
                    duration: null,
                    timing: null,
                    additionalNotes: null
                },
                jargonTranslations: [],
                medicinePurpose: 'Medicine name could not be confidently identified. Please upload a clearer prescription or enter the medicine manually.',
                medicationSchedule: { slots: [], durationText: null },
                plainLanguageSummary: {
                    english: 'The prescription could not be read clearly enough to identify the medicine. Please upload a higher quality image with good lighting, or enter the medicine name manually.',
                    romanUrdu: 'Nuskha itna saaf nahi tha ke dawa ka naam pehchana ja sake. Baraye meharbani behtar tasveer upload karein ya dawa ka naam khud darj karein.'
                },
                completenessWarnings: [
                    'Medicine name could not be identified from the provided text or image.',
                    'Please upload a clearer prescription image with good lighting and focus.',
                    'Alternatively, you can enter the medicine name manually in the Drug Information page.'
                ],
                clarityScore: 15
            };
        }

        // Medicine was found — proceed with extraction
        // 2. Detect Abbreviations & Frequencies using word boundaries
        const jargonTranslations = [];
        let frequencyCode = null;
        let frequencyDecoded = null;
        let timing = null;
        let scheduleSlots = [];

        if (/\b(TDS|TID|1\+1\+1|3 TIMES)\b/i.test(text)) {
            frequencyCode = 'TDS';
            frequencyDecoded = 'Three times daily (every 8 hours)';
            jargonTranslations.push({
                code: 'TDS',
                meaning: 'Three times daily',
                plainEnglish: MEDICAL_ABBREVIATIONS['TDS'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['TDS'].romanUrdu
            });
            scheduleSlots = [
                { time: 'Morning (8:00 AM)', dose: '1 Tablet / Dose', instruction: 'After breakfast' },
                { time: 'Afternoon (2:00 PM)', dose: '1 Tablet / Dose', instruction: 'After lunch' },
                { time: 'Night (8:00 PM)', dose: '1 Tablet / Dose', instruction: 'After dinner' }
            ];
        } else if (/\b(SOS|PRN|AS NEEDED)\b/i.test(text)) {
            frequencyCode = 'SOS';
            frequencyDecoded = 'Take only when needed for pain/symptoms';
            jargonTranslations.push({
                code: 'SOS',
                meaning: 'Take when needed',
                plainEnglish: MEDICAL_ABBREVIATIONS['SOS'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['SOS'].romanUrdu
            });
            scheduleSlots = [
                { time: 'As Needed (SOS)', dose: '1 Tablet', instruction: 'Take only if symptoms occur (minimum 6 hours apart)' }
            ];
        } else if (/\b(OD|1\+0\+0|0\+0\+1|ONCE DAILY)\b/i.test(text)) {
            frequencyCode = 'OD';
            frequencyDecoded = 'Once daily (every 24 hours)';
            jargonTranslations.push({
                code: 'OD',
                meaning: 'Once daily',
                plainEnglish: MEDICAL_ABBREVIATIONS['OD'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['OD'].romanUrdu
            });
            scheduleSlots = [
                { time: 'Morning (8:00 AM)', dose: '1 Tablet / Dose', instruction: 'Take once daily in the morning' }
            ];
        } else if (/\b(BD|BID|1\+0\+1)\b/i.test(text)) {
            frequencyCode = 'BD';
            frequencyDecoded = 'Twice daily (every 12 hours)';
            jargonTranslations.push({
                code: 'BD',
                meaning: 'Twice daily',
                plainEnglish: MEDICAL_ABBREVIATIONS['BD'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['BD'].romanUrdu
            });
            scheduleSlots = [
                { time: 'Morning (8:00 AM)', dose: '1 Tablet', instruction: 'Take with water after breakfast' },
                { time: 'Night (8:00 PM)', dose: '1 Tablet', instruction: 'Take with water after dinner' }
            ];
        }

        // Timing abbreviations check
        if (/\b(AC|BEFORE MEALS|NIHAR)\b/i.test(text)) {
            timing = 'Before meals (AC / Nihar munh)';
            jargonTranslations.push({
                code: 'AC',
                meaning: 'Before meals',
                plainEnglish: MEDICAL_ABBREVIATIONS['AC'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['AC'].romanUrdu
            });
        } else if (/\b(PC|AFTER MEALS|AFTER FOOD)\b/i.test(text)) {
            timing = 'After meals (PC)';
            jargonTranslations.push({
                code: 'PC',
                meaning: 'After meals',
                plainEnglish: MEDICAL_ABBREVIATIONS['PC'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['PC'].romanUrdu
            });
        }

        if (/\b(HS|BEDTIME|SONE)\b/i.test(text)) {
            timing = 'At bedtime (HS)';
            jargonTranslations.push({
                code: 'HS',
                meaning: 'Before sleep',
                plainEnglish: MEDICAL_ABBREVIATIONS['HS'].english,
                romanUrdu: MEDICAL_ABBREVIATIONS['HS'].romanUrdu
            });
        }

        // 3. Extract Duration — only if present
        let duration = null;
        const durationMatch = text.match(/(\d+)\s*(days?|weeks?|months?|d|w)/i);
        if (durationMatch) {
            duration = `${durationMatch[1]} ${durationMatch[2].toLowerCase().startsWith('d') ? 'days' : (durationMatch[2].toLowerCase().startsWith('w') ? 'weeks' : 'months')}`;
        }

        // 4. Medicine Purpose — only for verified matches
        const medKey = detectedBrand.toLowerCase();
        let purpose = COMMON_MEDICINE_PURPOSES[medKey] || 
            (matchedMedicine ? `Commonly prescribed for ${matchedMedicine.usage_ || matchedMedicine.category.toLowerCase()} indications.` : null);

        // 5. Plain Language Summaries
        const dosageUnit = detectedBrand.toLowerCase().includes('calpol') || detectedBrand.toLowerCase().includes('syrup') ? '1 teaspoon (5ml)' : '1 tablet';
        
        const summaryEnglish = `Your doctor has prescribed ${detectedBrand}${detectedStrength ? ' ' + detectedStrength : ''}. ${frequencyDecoded ? 'Take ' + dosageUnit + ' ' + frequencyDecoded.toLowerCase() : ''}${duration ? ' for ' + duration : ''}. ${purpose || ''}`.trim();
        const summaryRomanUrdu = `Doctor ne ${detectedBrand}${detectedStrength ? ' ' + detectedStrength : ''} tajweez ki hai. ${frequencyDecoded ? duration ? duration + ' tak ' + dosageUnit + ' leni hai.' : dosageUnit + ' leni hai.' : ''} ${purpose ? 'Yeh dawa ' + medKey + ' ke ilaj ke liye di gayi hai.' : ''}`.trim();

        // 6. Completeness & Clarity Checker
        const warnings = [];
        let clarityScore = matchConfidence; // Start from match confidence

        if (!duration && !/\b(SOS|PRN)\b/i.test(text)) {
            warnings.push('⚠ Duration was not detected on the prescription. Please confirm with your pharmacist.');
            clarityScore -= 10;
        }
        if (!frequencyCode) {
            warnings.push('⚠ Frequency code (OD/BD/TDS) was not detected. Please confirm dosage schedule with your pharmacist.');
            clarityScore -= 10;
        }
        if (!timing) {
            warnings.push('⚠ Meal timing (before/after meals) was not specified.');
            clarityScore -= 5;
        }
        if (text.length < 10) {
            warnings.push('⚠ Prescription text is very brief. Please confirm medicine dosage with your pharmacist.');
            clarityScore -= 15;
        }

        // Determine verification status based on match confidence
        let verificationStatus = 'UNCERTAIN';
        if (matchConfidence >= 90) verificationStatus = 'VERIFIED';
        else if (matchConfidence < 50) verificationStatus = 'REJECTED';

        return {
            success: true,
            requestId,
            rawText: rawTextEvidence,
            verificationStatus,
            extractedPrescription: {
                medicineName: `${detectedBrand}${detectedStrength ? ' ' + detectedStrength : ''}`,
                brandName: detectedBrand,
                genericName: detectedGeneric,
                strength: detectedStrength || null,
                dosage: dosageUnit,
                frequency: frequencyCode || null,
                frequencyDecoded: frequencyDecoded || null,
                duration: duration || null,
                timing: timing || null,
                additionalNotes: 'Take with a full glass of water as advised by doctor.'
            },
            jargonTranslations,
            medicinePurpose: purpose || 'Please consult your pharmacist for medicine information.',
            medicationSchedule: {
                slots: scheduleSlots,
                durationText: duration ? `${duration} Full Course` : null
            },
            plainLanguageSummary: {
                english: summaryEnglish,
                romanUrdu: summaryRomanUrdu
            },
            completenessWarnings: warnings,
            clarityScore: Math.max(15, clarityScore),
            confidenceLevel: clarityScore >= 85 ? 'high' : (clarityScore >= 60 ? 'medium' : 'low'),
            confidenceScore: clarityScore,
            engine: 'medvigil-prescription-interpreter-local'
        };
    },

    /**
     * Get dictionary of medical prescription abbreviations
     */
    getAbbreviationsDictionary: () => {
        return Object.entries(MEDICAL_ABBREVIATIONS).map(([code, val]) => ({
            code,
            meaning: val.meaning,
            plainEnglish: val.english,
            romanUrdu: val.romanUrdu
        }));
    }
};

module.exports = prescriptionInterpreterService;
