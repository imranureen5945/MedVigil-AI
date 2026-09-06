const { Medicine, Interaction } = require('../models');

// RED FLAG SYMPTOMS — highest priority detection layer
const RED_FLAG_SYMPTOMS = [
    { terms: ['severe difficulty breathing', 'severe breathing difficulty', 'saans nahi aa rahi', 'can\'t breathe', 'cannot breathe', 'unable to breathe', 'gasping for air', 'respiratory distress'], label: 'Severe Breathing Difficulty' },
    { terms: ['severe chest pain', 'chest tightness and pain', 'seene mein shadeed dard', 'crushing chest pain', 'heart attack symptoms'], label: 'Severe Chest Pain' },
    { terms: ['loss of consciousness', 'fainted', 'passed out', 'behosh', 'unconscious', 'blacked out'], label: 'Loss of Consciousness' },
    { terms: ['seizure', 'seizures', 'convulsion', 'fit', 'daura', 'mirgi ka daura'], label: 'Seizures' },
    { terms: ['severe allergic reaction', 'anaphylaxis', 'shadeed allergy', 'allergic shock'], label: 'Severe Allergic Reaction' },
    { terms: ['lip swelling', 'swollen lips', 'hont soojhna', 'hont sooj gaye'], label: 'Lip Swelling' },
    { terms: ['tongue swelling', 'swollen tongue', 'zaban soojhna', 'zaban sooj gayi'], label: 'Tongue Swelling' },
    { terms: ['blue lips', 'neelay hont', 'cyanosis', 'bluish lips'], label: 'Blue Lips (Cyanosis)' },
    { terms: ['vomiting blood', 'blood in vomit', 'ulti mein khoon', 'khoon ki ulti'], label: 'Vomiting Blood' },
    { terms: ['coughing blood', 'blood in cough', 'khansi mein khoon', 'khoon ki khansi'], label: 'Coughing Blood' },
    { terms: ['severe bleeding', 'uncontrolled bleeding', 'shadeed khoon bahna', 'heavy bleeding'], label: 'Severe Bleeding' },
    { terms: ['sudden severe headache', 'worst headache of life', 'shadeed sar dard achanak', 'thunderclap headache'], label: 'Sudden Severe Headache' },
    { terms: ['paralysis', 'one side weakness', 'aik taraf kamzori', 'facial drooping', 'face drooping'], label: 'Possible Stroke Symptoms' }
];

// Comprehensive bilingual mapping for English & Roman Urdu symptoms
const CLINICAL_SYMPTOM_MAP = {
    // Pain & Headache
    'headache': { category: 'Analgesic', terms: ['headache', 'sar dard', 'sar me dard', 'migraine', 'aadha sar'], meds: ['Panadol', 'Calpol', 'Disprin', 'Nurofen'], followUp: ['How long have you had the headache?', 'Is it throbbing, dull, or sharp?', 'Any vision changes or nausea?'] },
    'fever': { category: 'Antipyretic', terms: ['fever', 'bukhar', 'hararat', 'tap', 'body heat', 'chills'], meds: ['Panadol', 'Calpol', 'Brufen', 'Tylenol'], followUp: ['How high is the fever?', 'How many days has it lasted?', 'Any rash or bleeding?'] },
    'body pain': { category: 'Analgesic', terms: ['body pain', 'jism me dard', 'thakan', 'muscles', 'fatigue', 'kamar dard', 'backache', 'body aches'], meds: ['Ponstan', 'Brufen', 'Synflex', 'Brexin'], followUp: ['Is the pain in specific areas or all over?', 'Any recent physical exertion?'] },
    'toothache': { category: 'Dental Pain', terms: ['toothache', 'daant me dard', 'dant', 'gums', 'masoray'], meds: ['Synflex', 'Ponstan', 'Brufen', 'Keto'], followUp: ['Is there swelling around the tooth?', 'Any sensitivity to hot or cold?'] },
    
    // GI & Acidity
    'acidity': { category: 'Antacid/PPI', terms: ['acidity', 'heartburn', 'seene me jalan', 'jalan', 'tezaabiat', 'acid reflux', 'gerd'], meds: ['Risek', 'Gaviscon', 'Motilium'], followUp: ['Does it occur after specific foods?', 'How often does it happen?'] },
    'stomach ache': { category: 'GI Antispasmodic', terms: ['stomach ache', 'pet me dard', 'cramps', 'maror', 'gastric pain', 'stomach cramps'], meds: ['Buscopan', 'Risek', 'Flagyl'], followUp: ['Where exactly is the pain?', 'Any vomiting or diarrhea?'] },
    'nausea': { category: 'Antiemetic', terms: ['nausea', 'vomiting', 'ulti', 'matli', 'dil kharab'], meds: ['Motilium', 'Gravinate', 'Maxolon'], followUp: ['How many times have you vomited?', 'Can you keep fluids down?'] },
    'diarrhea': { category: 'Antidiarrheal', terms: ['diarrhea', 'loose motion', 'dast', 'patla pakhana', 'food poisoning'], meds: ['Imodium', 'Flagyl', 'Smecta', 'Entamizole'], followUp: ['How many episodes per day?', 'Any blood in stool?', 'Are you staying hydrated?'] },
    'constipation': { category: 'Laxative', terms: ['constipation', 'qabz', 'pet saaf nahi'], meds: ['Lactulose', 'Dulcolax', 'Skilax'], followUp: ['How many days since last bowel movement?', 'Any abdominal pain?'] },

    // Respiratory & ENT
    'cough': { category: 'Antitussive', terms: ['cough', 'khansi', 'khushk khansi', 'balgham', 'phlegm'], meds: ['Corex', 'Benadryl', 'Hydryllin', 'Acefyl'], followUp: ['Is it dry or with phlegm?', 'How long has it persisted?', 'Any fever?'] },
    'sore throat': { category: 'Throat Lozenges/Anti-inflammatory', terms: ['sore throat', 'gala kharab', 'galay me dard', 'khich khich', 'tonsils'], meds: ['Strepsils', 'Lofnac', 'Azomax'], followUp: ['Is there white coating on tonsils?', 'Difficulty swallowing?'] },
    'flu': { category: 'Cold & Flu', terms: ['flu', 'nazla', 'zukam', 'runny nose', 'cheenkain', 'congestion', 'sneezing', 'naak mein khujli', 'itchy nose'], meds: ['Zyrtec', 'Panadol CF', 'Arinac', 'Atarax'], followUp: ['Any fever with the symptoms?', 'How long have symptoms lasted?'] },
    'asthma': { category: 'Bronchodilator', terms: ['asthma', 'dama', 'saans me dushwari', 'wheezing', 'breathlessness', 'shortness of breath', 'saans lene mein mushkil'], meds: ['Ventolin', 'Seretide', 'Singulair'], followUp: ['Do you have an inhaler?', 'Is this worse at night?', 'Any known triggers?'] },

    // Urinary
    'urinary': { category: 'UTI Management', terms: ['burning urination', 'frequent urination', 'painful urination', 'peshaab mein jalan', 'baar baar peshab', 'UTI'], meds: ['Ciproxin', 'Novidat', 'Septran'], followUp: ['Any fever or back pain?', 'Blood in urine?', 'How long has burning persisted?'] },

    // Allergies & Skin
    'allergy': { category: 'Antihistamine', terms: ['allergy', 'rash', 'khujli', 'itching', 'kharish', 'urticaria'], meds: ['Zyrtec', 'Claritin', 'Atarax', 'Avil'], followUp: ['When did the rash start?', 'Any new food or medicine?', 'Is it spreading?'] },
    'skin rash': { category: 'Topical Dermatological', terms: ['skin rash', 'jild', 'surkhi', 'fungal', 'daane'], meds: ['Dermovate', 'Betnovate', 'Candid', 'Fucicort'], followUp: ['Is the rash itchy or painful?', 'Any new products used?'] },

    // Mental Well-being
    'anxiety': { category: 'Anxiolytic Guidance', terms: ['anxiety', 'ghabrahat', 'tension', 'stress', 'depression', 'bechaini'], meds: ['Lexotanil', 'Xanax', 'Prozac'], followUp: ['How long have you felt this way?', 'Any sleep disturbance?', 'Please consider speaking with a mental health professional.'] }
};

// Detect red flag symptoms — returns array of matched red flags
function detectRedFlags(symptomText) {
    const textLower = symptomText.toLowerCase().trim();
    const matched = [];
    for (const flag of RED_FLAG_SYMPTOMS) {
        for (const term of flag.terms) {
            if (textLower.includes(term.toLowerCase())) {
                matched.push(flag.label);
                break;
            }
        }
    }
    return matched;
}

const aiService = {
    /**
     * Analyzes user symptoms (English or Roman Urdu) and returns matching therapeutic options with strict safety disclaimers.
     * Implements: red flag detection, follow-up questions, possibility-based language, medication safety awareness.
     */
    analyzeSymptoms: async (symptomText, language = 'en') => {
        const textLower = symptomText.toLowerCase().trim();
        const detectedCategories = [];
        const suggestedMedicines = new Set();
        const matchedKeywords = [];
        const followUpQuestions = [];

        // Priority 1: Red flag detection
        const redFlags = detectRedFlags(symptomText);

        // Priority 2: Symptom matching
        for (const [symptomKey, config] of Object.entries(CLINICAL_SYMPTOM_MAP)) {
            for (const term of config.terms) {
                if (textLower.includes(term)) {
                    matchedKeywords.push(term);
                    detectedCategories.push({
                        symptom: symptomKey,
                        category: config.category
                    });
                    config.meds.forEach(m => suggestedMedicines.add(m));
                    // Collect follow-up questions
                    if (config.followUp) {
                        config.followUp.forEach(q => followUpQuestions.push(q));
                    }
                    break;
                }
            }
        }

        // Deduplicate follow-up questions (max 5)
        const uniqueFollowUps = [...new Set(followUpQuestions)].slice(0, 5);

        // Fetch detailed info for suggested medicines
        const medDetails = [];
        for (const medName of Array.from(suggestedMedicines).slice(0, 6)) {
            const results = Medicine.search(medName);
            if (results.length > 0) {
                medDetails.push(results[0]);
            }
        }

        // Detect language pattern
        const isUrdu = language === 'ur' || matchedKeywords.some(k => 
            ['dard', 'bukhar', 'jalan', 'khansi', 'qabz', 'ulti', 'khujli', 'cheenkain', 'saans', 'peshab', 'pet'].some(u => k.includes(u))
        );

        // Build clinical summary with possibility-based language (NEVER diagnose)
        let clinicalSummary;
        if (detectedCategories.length > 0) {
            const symptomNames = detectedCategories.map(c => c.symptom);
            clinicalSummary = `Your symptoms may be consistent with conditions typically managed by ${detectedCategories.map(c => c.category).join(', ')} therapeutic approaches. This is informational only and does NOT constitute a diagnosis.`;
        } else {
            clinicalSummary = 'No specific therapeutic category could be confidently matched to your symptoms. Please consult a physician for proper clinical evaluation.';
        }

        // Medication safety notes
        const safetyNotes = [];
        const activeIngredients = new Map();
        for (const med of medDetails) {
            const generic = med.genericName;
            if (activeIngredients.has(generic)) {
                safetyNotes.push(`Duplicate active ingredient detected: ${generic} appears in both ${activeIngredients.get(generic)} and ${med.brandName}. Do not take both simultaneously.`);
            } else {
                activeIngredients.set(generic, med.brandName);
            }
            // Category-based safety
            if (med.category === 'NSAID') {
                safetyNotes.push('NSAIDs should be used with caution in patients with kidney disease, stomach ulcers, or cardiovascular conditions.');
            }
            if (med.category === 'Antibiotic') {
                safetyNotes.push('Antibiotics require a complete prescription course. Never self-prescribe antibiotics — consult a doctor for proper dosing.');
            }
            if (med.category === 'Antihistamine') {
                safetyNotes.push('Antihistamines may cause drowsiness. Avoid driving or operating machinery after use.');
            }
        }

        return {
            query: symptomText,
            redFlags,
            matchedSymptoms: detectedCategories,
            matchedKeywords,
            suggestedMedicines: medDetails.map(m => ({
                id: m.id,
                brandName: m.brandName,
                genericName: m.genericName,
                category: m.category,
                dosage: m.dosage,
                usage: m.usage_,
                manufacturer: m.manufacturer,
                recallStatus: m.recallStatus
            })),
            clinicalSummary,
            followUpQuestions: uniqueFollowUps,
            safetyNotes: [...new Set(safetyNotes)],
            isUrdu,
            safetyNotice: {
                en: 'MedVigil AI provides clinical pharmacovigilance and drug information only. This is not medical diagnosis and not a prescription. Symptoms may be consistent with multiple conditions. Always confirm with a licensed doctor via Doctor Connect.',
                ur: 'میڈ ویجیل اے آئی صرف دوائیوں کی معلومات اور سیفٹی رہنمائی فراہم کرتا ہے۔ یہ حتمی طبی تشخیص یا نسخہ نہیں ہے۔ علامات متعدد حالتوں سے مطابقت رکھ سکتی ہیں۔ ہمیشہ لائسنس یافتہ ڈاکٹر سے تصدیق کریں۔'
            }
        };
    },

    /**
     * Explains drug interaction between two medications in natural language
     */
    explainInteraction: async (drug1, drug2) => {
        const interactions = Interaction.findInteractions(drug1, drug2);
        if (interactions.length > 0) {
            const item = interactions[0];
            return {
                hasInteraction: true,
                severity: item.severity,
                description: item.description,
                clinicalMechanism: `Concomitant administration of ${drug1} and ${drug2} may lead to altered pharmacokinetics or additive pharmacodynamic toxicity.`,
                recommendation: 'Monitor patient closely. Consider alternative therapeutic agent or adjust dosing interval.'
            };
        }

        return {
            hasInteraction: false,
            severity: 'safe',
            description: `No documented severe interaction found between ${drug1} and ${drug2} in the MedVigil database.`,
            clinicalMechanism: 'No direct metabolic enzyme competition or receptor conflict identified.',
            recommendation: 'Standard dosing may be followed unless patient has specific organ impairment or allergy.'
        };
    }
};

module.exports = aiService;
