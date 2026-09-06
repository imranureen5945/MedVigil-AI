const medicationSafetyEngine = require('./medicationSafetyEngine');
const triageAiService = require('./triageAiService');
const { TriageAssessment } = require('../models');

// ---------------------------------------------------------------------------
// Self-Medication Risk Assessment — deterministic engine.
//
// Every safety-critical decision (red-flag detection, risk level, medication
// safety findings, antibiotic/AMR classification) is computed here by rules.
// The AI layer (triageAiService) only explains verified findings in patient-
// friendly language — it can escalate risk but NEVER downgrade it or remove
// a verified alert.
// ---------------------------------------------------------------------------

const RISK_LEVELS = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];
const riskSeverity = (level) => Math.max(0, RISK_LEVELS.indexOf(String(level || '').toUpperCase()));
const maxRisk = (a, b) => (riskSeverity(a) >= riskSeverity(b) ? a : b);

const DISCLAIMER = 'This self-medication risk assessment is a safety guide, not a medical diagnosis. It does not prescribe medicines or replace a doctor\'s evaluation. If symptoms are severe or getting worse, seek medical care immediately.';
const URDU_DISCLAIMER = 'یہ خود علاج کا خطرہ جائزہ صرف حفاظتی رہنمائی ہے، طبی تشخیص یا نسخہ نہیں ہے۔ اگر علامات شدید ہوں یا بڑھ رہی ہوں تو فوراً طبی امداد حاصل کریں۔';

const YESNO_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];
const DURATION_OPTIONS = [
    { value: 'lt24h', label: 'Less than 24 hours' },
    { value: '1-3d', label: '1–3 days' },
    { value: '4-7d', label: '4–7 days' },
    { value: 'gt7d', label: 'More than 7 days' }
];
const SEVERITY_OPTIONS = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
];
const VOMIT_FREQUENCY_OPTIONS = [
    { value: '1-2', label: 'Once or twice' },
    { value: '3-5', label: '3–5 times' },
    { value: 'gt5', label: 'More than 5 times' }
];
const ABDOMINAL_LOCATION_OPTIONS = [
    { value: 'upper', label: 'Upper abdomen' },
    { value: 'lower', label: 'Lower abdomen' },
    { value: 'navel', label: 'Around the navel' },
    { value: 'allover', label: 'All over the belly' }
];

// Canonical symptom map: bilingual terms + the adaptive questions that are
// ONLY asked when the symptom is present. Duration is asked once (shared
// question) so the user is never asked the same thing twice.
const TRIAGE_SYMPTOM_MAP = {
    fever: {
        label: 'Fever',
        terms: ['fever', 'feverish', 'bukhar', 'hararat', 'high temperature', 'chills', 'shivering', 'tap aana'],
        questions: [
            { id: 'fever_temperature', type: 'temperature', question: 'What is the highest temperature you have measured?' },
            { id: 'fever_other_symptoms', type: 'yesno', question: 'With the fever, is there also a rash, stiff neck, or confusion?', options: YESNO_OPTIONS }
        ]
    },
    'sore throat': {
        label: 'Sore throat',
        terms: ['sore throat', 'gala dard', 'galay me dard', 'galay mein dard', 'gala kharab', 'throat pain', 'painful throat', 'khich khich', 'tonsil', 'tonsils'],
        questions: [
            { id: 'throat_swallowing', type: 'yesno', question: 'Is it difficult or painful to swallow?', options: YESNO_OPTIONS }
        ]
    },
    vomiting: {
        label: 'Vomiting / nausea',
        terms: ['vomiting', 'vomit', 'vomited', 'throwing up', 'threw up', 'ulti', 'ultiyan', 'matli', 'nausea', 'nauseous', 'dil kharab'],
        questions: [
            { id: 'vomit_frequency', type: 'choice', question: 'How many times have you vomited in the last 24 hours?', options: VOMIT_FREQUENCY_OPTIONS },
            { id: 'vomit_fluids', type: 'yesno', question: 'Can you keep fluids down (water, ORS, juice)?', options: YESNO_OPTIONS },
            { id: 'vomit_blood', type: 'yesno', question: 'Have you noticed blood in the vomit?', options: YESNO_OPTIONS }
        ]
    },
    diarrhea: {
        label: 'Diarrhea',
        terms: ['diarrhea', 'diarrhoea', 'loose motion', 'loose motions', 'dast', 'patla pakhana', 'watery stool'],
        questions: [
            { id: 'diarrhea_fluids', type: 'yesno', question: 'Are you able to drink enough fluids to stay hydrated?', options: YESNO_OPTIONS },
            { id: 'diarrhea_blood', type: 'yesno', question: 'Have you noticed blood in your stool?', options: YESNO_OPTIONS }
        ]
    },
    cough: {
        label: 'Cough',
        terms: ['cough', 'coughing', 'khansi', 'balgham', 'phlegm', 'persistent cough'],
        questions: [
            { id: 'cough_breathing', type: 'yesno', question: 'Are you having any difficulty breathing?', options: YESNO_OPTIONS },
            { id: 'cough_chest_pain', type: 'yesno', question: 'Do you have chest pain along with the cough?', options: YESNO_OPTIONS }
        ]
    },
    headache: {
        label: 'Headache',
        terms: ['headache', 'headaches', 'sar dard', 'sar me dard', 'sar mein dard', 'migraine', 'aadha sar'],
        questions: [
            { id: 'headache_sudden_severe', type: 'yesno', question: 'Did the headache start suddenly and become very severe?', options: YESNO_OPTIONS },
            { id: 'headache_neck_stiffness', type: 'yesno', question: 'With the headache, is there neck stiffness, vision changes, or high fever?', options: YESNO_OPTIONS }
        ]
    },
    rash: {
        label: 'Skin rash / allergy',
        terms: ['rash', 'rashes', 'khujli', 'itching', 'kharish', 'daane', 'skin rash', 'red spots', 'urticaria', 'hives', 'jild par daane'],
        questions: [
            { id: 'rash_spreading', type: 'yesno', question: 'Is the rash spreading quickly?', options: YESNO_OPTIONS },
            { id: 'rash_new_medicine', type: 'yesno', question: 'Did the rash appear after taking a new medicine or food?', options: YESNO_OPTIONS },
            { id: 'rash_lip_tongue', type: 'yesno', question: 'Is there any swelling of the lips, tongue, or face?', options: YESNO_OPTIONS }
        ]
    },
    'abdominal pain': {
        label: 'Abdominal pain',
        terms: ['abdominal pain', 'stomach ache', 'stomach pain', 'stomach cramps', 'pet me dard', 'pet mein dard', 'pet dard', 'cramps', 'maror'],
        questions: [
            { id: 'abdominal_location', type: 'choice', question: 'Where is the pain mainly located?', options: ABDOMINAL_LOCATION_OPTIONS },
            { id: 'abdominal_warning', type: 'yesno', question: 'Is the pain severe and getting worse, or is the belly rigid and very tender to touch?', options: YESNO_OPTIONS }
        ]
    },
    'difficulty breathing': {
        label: 'Difficulty breathing',
        terms: ['difficulty breathing', 'difficulty in breathing', 'shortness of breath', 'breathlessness', 'saans lene mein mushkil', 'saans me dushwari', 'wheezing', 'saans phoolna'],
        questions: [
            { id: 'breathing_at_rest', type: 'yesno', question: 'Do you have difficulty breathing even while sitting at rest?', options: YESNO_OPTIONS },
            { id: 'breathing_chest_pain', type: 'yesno', question: 'Do you also have chest pain, pressure, or sweating?', options: YESNO_OPTIONS }
        ]
    },
    'chest pain': {
        label: 'Chest pain',
        terms: ['chest pain', 'chest pains', 'seene me dard', 'seene mein dard', 'chest pressure', 'chest tightness', 'seene pe wazan'],
        questions: [
            { id: 'chest_severe', type: 'yesno', question: 'Is the chest pain severe, crushing, or spreading to the arm, jaw, or back?', options: YESNO_OPTIONS },
            { id: 'chest_breathing', type: 'yesno', question: 'With the chest pain, do you also have difficulty breathing, sweating, or nausea?', options: YESNO_OPTIONS }
        ]
    },
    'body pain': {
        label: 'Body pain',
        terms: ['body pain', 'body ache', 'body aches', 'jism me dard', 'jism mein dard', 'muscle pain', 'kamar dard', 'backache', 'fatigue', 'thakan'],
        questions: []
    },
    flu: {
        label: 'Cold / flu',
        terms: ['flu', 'nazla', 'zukam', 'runny nose', 'sneezing', 'cheenkain', 'congestion', 'blocked nose', 'naak beh raha hai'],
        questions: []
    },
    acidity: {
        label: 'Acidity / heartburn',
        terms: ['acidity', 'heartburn', 'acid reflux', 'gerd', 'tezaabiat', 'seene me jalan', 'seene mein jalan', 'jalan'],
        questions: []
    }
};

// Red-flag terms — the emergency layer. Superset of the classic red-flag list
// with Roman Urdu variants. A text hit is always RED regardless of AI output.
const TRIAGE_RED_FLAGS = [
    { label: 'Severe Breathing Difficulty', terms: ['severe difficulty breathing', 'severe breathing difficulty', 'saans nahi aa rahi', "can't breathe", 'cant breathe', 'cannot breathe', 'unable to breathe', 'gasping for air', 'respiratory distress', 'saans phool rahi hai'] },
    { label: 'Severe Chest Pain', terms: ['severe chest pain', 'crushing chest pain', 'chest pain spreading to arm', 'chest pain spreading to jaw', 'seene mein shadeed dard', 'seene me shadeed dard', 'heart attack symptoms'] },
    { label: 'Fainting / Loss of Consciousness', terms: ['loss of consciousness', 'fainted', 'passed out', 'behosh', 'unconscious', 'blacked out', 'collapsed'] },
    { label: 'Severe Confusion', terms: ['severe confusion', 'sudden confusion', 'very confused', 'hosh me nahi', 'hosh nahi'] },
    { label: 'Seizure', terms: ['seizure', 'seizures', 'convulsion', 'daura', 'mirgi ka daura'] },
    { label: 'Severe Allergic Reaction', terms: ['severe allergic reaction', 'anaphylaxis', 'allergic shock', 'shadeed allergy', 'face swelling', 'chehra soojhna'] },
    { label: 'Lip or Tongue Swelling', terms: ['lip swelling', 'swollen lips', 'hont soojhna', 'hont sooj gaye', 'tongue swelling', 'swollen tongue', 'zaban soojhna', 'zaban sooj gayi'] },
    { label: 'Blue or Gray Lips / Skin', terms: ['blue lips', 'neelay hont', 'cyanosis', 'bluish lips', 'blue skin', 'gray skin', 'neeli skin'] },
    { label: 'Uncontrolled Bleeding', terms: ['severe bleeding', 'uncontrolled bleeding', 'heavy bleeding', 'shadeed khoon bahna', 'khoon beh raha hai', 'bleeding heavily'] },
    { label: 'Vomiting Blood', terms: ['vomiting blood', 'blood in vomit', 'ulti mein khoon', 'khoon ki ulti'] },
    { label: 'Coughing Blood', terms: ['coughing blood', 'blood in cough', 'blood in sputum', 'khansi mein khoon', 'khoon ki khansi'] },
    { label: 'Blood in Stool', terms: ['blood in stool', 'blood in diarrhea', 'pakhana mein khoon', 'khoon ka pakhana'] },
    { label: 'Sudden Severe Headache', terms: ['sudden severe headache', 'worst headache of life', 'thunderclap headache', 'shadeed sar dard achanak'] },
    { label: 'Sudden Weakness or Numbness', terms: ['paralysis', 'one side weakness', 'sudden weakness', 'numbness on one side', 'aik taraf kamzori', 'facial drooping', 'face drooping'] },
    { label: 'Severe Dehydration', terms: ['severe dehydration', 'not passing urine', 'no urination', 'peshab band', 'sunken eyes'] },
    { label: 'Unable to Keep Fluids Down', terms: ["can't keep fluids down", 'cannot keep fluids down', 'unable to keep fluids down', "can't keep water down", 'paani bhi nahi ruk raha', 'nothing stays down'] },
    { label: 'Rapidly Worsening Symptoms', terms: ['rapidly worsening', 'rapidly getting worse', 'getting worse very quickly', 'suddenly much worse', 'worsening quickly', 'symptoms worsening rapidly'] }
];

// Answers that convert a follow-up question into an urgent red flag.
const ANSWER_RED_FLAG_RULES = [
    { questionId: 'vomit_blood', when: 'yes', flag: 'Vomiting Blood' },
    { questionId: 'diarrhea_blood', when: 'yes', flag: 'Blood in Stool' },
    { questionId: 'rash_lip_tongue', when: 'yes', flag: 'Lip or Tongue Swelling' },
    { questionId: 'vomit_fluids', when: 'no', flag: 'Unable to Keep Fluids Down' },
    { questionId: 'diarrhea_fluids', when: 'no', flag: 'Severe Dehydration' },
    { questionId: 'cough_breathing', when: 'yes', flag: 'Breathing Difficulty with Cough' },
    { questionId: 'cough_chest_pain', when: 'yes', flag: 'Chest Pain with Cough' },
    { questionId: 'chest_severe', when: 'yes', flag: 'Severe Chest Pain' },
    { questionId: 'chest_breathing', when: 'yes', flag: 'Chest Pain with Breathing Difficulty' },
    { questionId: 'breathing_at_rest', when: 'yes', flag: 'Difficulty Breathing at Rest' },
    { questionId: 'headache_sudden_severe', when: 'yes', flag: 'Sudden Severe Headache' },
    { questionId: 'headache_neck_stiffness', when: 'yes', flag: 'Headache with Warning Signs' },
    { questionId: 'abdominal_warning', when: 'yes', flag: 'Severe or Worsening Abdominal Pain' },
    { questionId: 'fever_other_symptoms', when: 'yes', flag: 'Fever with Rash, Stiff Neck or Confusion' },
    { questionId: 'general_worsening', when: 'yes', flag: 'Rapidly Worsening Symptoms' }
];

// Warning signs shown on the result screen, per detected symptom.
const WARNING_SIGNS_BY_SYMPTOM = {
    fever: ['Fever above 39.5°C (103°F) that does not come down with simple measures', 'Fever lasting more than 3 days', 'Confusion, a rash, or a stiff neck appearing with the fever'],
    'sore throat': ['Being unable to swallow saliva or drinks', 'Difficulty breathing or noisy breathing', 'A high fever with a severely swollen throat'],
    vomiting: ['Blood in the vomit', 'Inability to keep any fluids down for many hours', 'Signs of dehydration — very dry mouth, dizziness, or no urination for 8+ hours'],
    diarrhea: ['Blood in the stool', 'No urination for 8+ hours or severe weakness (dehydration)', 'Diarrhea lasting more than a few days or with high fever'],
    cough: ['Difficulty breathing or wheezing', 'Coughing up blood', 'Chest pain while coughing'],
    headache: ['A sudden, worst-ever headache', 'Headache with fever and a stiff neck', 'Headache with vision changes, weakness, or confusion'],
    rash: ['Swelling of the lips, tongue, or face', 'A rash that spreads very quickly', 'Difficulty breathing with the rash'],
    'abdominal pain': ['Pain that becomes severe and constant', 'A belly that is rigid or extremely tender to touch', 'Pain with persistent vomiting, high fever, or no bowel movement'],
    'difficulty breathing': ['Breathing difficulty at rest', 'Blue or gray lips', 'Breathing difficulty with chest pain'],
    'chest pain': ['Severe, crushing chest pain', 'Chest pain spreading to the arm, jaw, or back', 'Chest pain with sweating, nausea, or difficulty breathing'],
    'body pain': [],
    flu: ['Difficulty breathing', 'Symptoms that suddenly get much worse after improving', 'High fever for more than 3 days'],
    acidity: ['Chest pain or pressure (can feel like severe heartburn)', 'Vomiting blood or black material', 'Unintentional weight loss or difficulty swallowing food']
};
const GENERAL_WARNING_SIGNS = ['Difficulty breathing', 'Severe chest pain', 'Fainting or severe confusion', 'Seizures', 'Uncontrolled bleeding', 'Sudden weakness or numbness on one side of the body'];

// Safe, general self-care guidance (never prescriptive).
const SELF_CARE_BY_SYMPTOM = {
    fever: ['Rest and drink plenty of fluids', 'Keep the room ventilated and wear light clothing', 'Check and note the temperature every few hours'],
    'sore throat': ['Drink warm fluids and avoid very cold or spicy food', 'Rest the voice', 'Cold drinks or ice chips may soothe the throat'],
    vomiting: ['Take small sips of water or ORS frequently instead of large drinks', 'Rest the stomach for 30–60 minutes after vomiting, then try fluids again', 'Avoid heavy or oily food until vomiting stops'],
    diarrhea: ['Drink ORS (oral rehydration salts) to replace lost fluids and salts', 'Continue eating light foods if tolerated — avoid oily and very spicy food', 'Keep track of how often it is happening'],
    cough: ['Warm fluids can soothe the throat', 'Avoid smoke and dust', 'Rest as much as possible'],
    headache: ['Rest in a quiet, dimly lit room', 'Drink water — dehydration can make headaches worse', 'Note what triggers or worsens it'],
    rash: ['Avoid scratching the area', 'Note any new medicine, food, or product used recently', 'A cool compress may relieve itching'],
    'abdominal pain': ['Eat light, bland food', 'Avoid painkillers until a doctor has reviewed the cause — some pain medicines can worsen stomach problems', 'Note exactly where and when the pain occurs'],
    'difficulty breathing': ['Sit upright and try to stay calm', 'Seek medical help — breathing difficulty is not a self-treatable symptom'],
    'chest pain': ['Do not self-treat chest pain — seek medical evaluation'],
    'body pain': ['Rest and stay hydrated', 'Gentle movement if comfortable'],
    flu: ['Rest and drink warm fluids', 'Steam inhalation may ease congestion', 'Symptoms usually improve within a week'],
    acidity: ['Avoid spicy, fried, and oily food', 'Do not lie down right after eating', 'Smaller, more frequent meals may help']
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Boundary-safe term match ("ulti" must not match "multiple").
function termMatches(textLower, term) {
    const escaped = String(term).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`).test(textLower);
}

function isYes(value) {
    return value === true || String(value || '').trim().toLowerCase() === 'yes';
}

function isNo(value) {
    return value === false || String(value || '').trim().toLowerCase() === 'no';
}

// Detect symptoms from free text (English or Roman Urdu).
function normalizeAndDetect(symptomText) {
    const textLower = String(symptomText || '').toLowerCase().trim();
    const detected = [];
    for (const [key, config] of Object.entries(TRIAGE_SYMPTOM_MAP)) {
        for (const term of config.terms) {
            if (termMatches(textLower, term)) {
                detected.push({ key, label: config.label, matchedTerm: term });
                break;
            }
        }
    }
    const isUrdu = detected.some(d => /[a-z]+\s+(me|mein|ka|ki|ke|nahi|dard|bukhar|ulti|dast|khansi|jalan|soojhna|beh)\b/i.test(d.matchedTerm))
        || /\b(bukhar|ulti|dast|khansi|matli|zukam|nazla|kharish|qabz|behosh)\b/i.test(textLower);
    return { detected, isUrdu };
}

// Parse a temperature answer into °C. Accepts {value, unit}, numbers, or
// strings like "39C" / "102F".
function parseTemperature(answer) {
    if (answer == null) return null;
    let value = null;
    let unit = 'C';
    if (typeof answer === 'object') {
        value = Number(answer.value);
        unit = String(answer.unit || 'C').toUpperCase().startsWith('F') ? 'F' : 'C';
    } else if (typeof answer === 'number') {
        value = answer;
    } else {
        const match = String(answer).match(/(-?\d+(?:\.\d+)?)\s*([cf])?/i);
        if (match) {
            value = Number(match[1]);
            unit = (match[2] || 'C').toUpperCase();
        }
    }
    if (value == null || isNaN(value)) return null;
    let celsius = unit === 'F' ? (value - 32) * 5 / 9 : value;
    celsius = Math.round(celsius * 10) / 10;
    if (celsius < 30 || celsius > 45) return null; // implausible body temperature
    return celsius;
}

const DURATION_RANK = { lt24h: 1, '1-3d': 2, '4-7d': 3, gt7d: 4 };
const DURATION_LABEL = { lt24h: 'less than a day', '1-3d': '1–3 days', '4-7d': '4–7 days', gt7d: 'more than a week' };
function durationRank(value) {
    return DURATION_RANK[String(value || '').trim()] || 0;
}
function durationLabel(value) {
    return DURATION_LABEL[String(value || '').trim()] || null;
}

// Adaptive question generation — only questions relevant to the entered
// symptoms, one shared duration question, plus severity and worsening.
function generateQuestions(detected, maxQuestions = 10) {
    const questions = [];
    const seen = new Set();
    const push = (q) => {
        if (!q || seen.has(q.id)) return;
        seen.add(q.id);
        questions.push(q);
    };

    for (const symptom of detected) {
        const config = TRIAGE_SYMPTOM_MAP[symptom.key];
        if (!config) continue;
        config.questions.forEach(push);
    }

    if (questions.length > 0 || detected.length > 0) {
        push({ id: 'symptom_duration', type: 'duration', question: 'How long have these symptoms been present?', options: DURATION_OPTIONS });
    }
    push({ id: 'general_severity', type: 'severity', question: 'Overall, how severe are these symptoms?', options: SEVERITY_OPTIONS });
    push({ id: 'general_worsening', type: 'yesno', question: 'Are the symptoms getting worse quickly?', options: YESNO_OPTIONS });

    // If nothing matched at all, still ask the core triage questions.
    if (questions.length === 0) {
        push({ id: 'symptom_duration', type: 'duration', question: 'How long have these symptoms been present?', options: DURATION_OPTIONS });
    }

    return questions.slice(0, maxQuestions);
}

// Red-flag evaluation over BOTH the free text and the collected answers.
function evaluateRedFlags(symptomText, answers = {}) {
    const textLower = String(symptomText || '').toLowerCase().trim();
    const matched = new Set();

    for (const flag of TRIAGE_RED_FLAGS) {
        for (const term of flag.terms) {
            if (termMatches(textLower, term)) {
                matched.add(flag.label);
                break;
            }
        }
    }

    for (const rule of ANSWER_RED_FLAG_RULES) {
        const value = answers[rule.questionId];
        const hit = rule.when === 'yes' ? isYes(value) : isNo(value);
        if (hit) matched.add(rule.flag);
    }

    // A quickly spreading rash after a new medicine/food can be a severe
    // allergic reaction — only flag when the combination is present.
    if (isYes(answers.rash_spreading) && (isYes(answers.rash_new_medicine) || isYes(answers.rash_lip_tongue))) {
        matched.add('Possible Severe Allergic Reaction');
    }

    return Array.from(matched);
}

// Antibiotic / AMR alert — only when the planned medicine is VERIFIED as an
// antibiotic in the medicine directory. Never guessed from the symptom text.
function buildAmrAlert(med) {
    if (!med || !med.id) return null;
    if (String(med.category || '').toLowerCase() !== 'antibiotic') return null;
    return {
        detected: true,
        title: 'ANTIBIOTIC SAFETY ALERT',
        medicine: { id: med.id, name: med.name, genericName: med.genericName, category: med.category },
        messages: [
            'Symptoms alone cannot establish whether an antibiotic is needed — only a doctor can decide after examining the patient.',
            'Using antibiotics when they are not appropriate can contribute to antimicrobial resistance (AMR). Bacteria can become harder to treat when antibiotics are used unnecessarily or incorrectly.',
            'Do not start, stop or change an antibiotic based only on this assessment.',
            'If a doctor prescribes this antibiotic, take the complete course exactly as directed — never save leftovers for later.'
        ]
    };
}

// Deterministic risk calculation. Every level comes with reasons — the result
// screen never shows a risk level without an explanation.
function calculateRisk({ redFlags, detected, answers, medicationSafety, amrAlert }) {
    let risk = 'GREEN';
    const reasons = [];
    const bump = (level, reason) => {
        if (riskSeverity(level) > riskSeverity(risk)) risk = level;
        if (reason && !reasons.includes(reason)) reasons.push(reason);
    };

    // 1. Red flags are absolute — nothing can lower this.
    if (redFlags.length > 0) {
        bump('RED', `Urgent warning signs detected (${redFlags.join('; ')}). Immediate medical attention is recommended.`);
    }

    // 2. Nothing recognised — a doctor should evaluate it properly.
    if (!detected || detected.length === 0) {
        bump('YELLOW', 'The symptoms could not be matched to a known category, so a proper medical evaluation is advised.');
    }

    // 3. Duration of symptoms.
    const durRank = durationRank(answers.symptom_duration);
    if (durRank === 4) bump('ORANGE', 'The symptoms have lasted more than a week — they should be reviewed by a doctor.');
    else if (durRank === 3) bump('YELLOW', 'The symptoms have been present for 4–7 days, so they should be monitored closely.');

    // 4. Fever specifics.
    const tempC = parseTemperature(answers.fever_temperature);
    if (tempC != null) {
        if (tempC >= 39.5) bump('ORANGE', `A high fever of ${tempC.toFixed(1)}°C was reported — this should be reviewed by a doctor.`);
        else if (tempC >= 38.5) bump('YELLOW', `A fever of ${tempC.toFixed(1)}°C was reported.`);
        if (tempC >= 38 && durRank >= 3) bump('ORANGE', 'The fever has lasted more than 3 days — a doctor should check the cause.');
    }

    // 5. Vomiting frequency (dehydration risk).
    if (answers.vomit_frequency === 'gt5') bump('ORANGE', 'Vomiting more than 5 times in 24 hours carries a real risk of dehydration.');
    else if (answers.vomit_frequency === '3-5') bump('YELLOW', 'Repeated vomiting (3–5 times in 24 hours) was reported.');

    // 6. Overall severity as rated by the user.
    if (answers.general_severity === 'severe') bump('ORANGE', 'The symptoms were rated as severe.');
    else if (answers.general_severity === 'moderate') bump('YELLOW', 'The symptoms were rated as moderate.');

    // 7. Verified medication safety findings (from the deterministic engine).
    if (medicationSafety) {
        if (medicationSafety.overallRisk === 'HIGH') {
            bump('ORANGE', 'A verified medication safety concern was found for this profile — do not take the planned medicine before a medical review.');
        } else if (medicationSafety.overallRisk === 'MODERATE') {
            bump('YELLOW', 'A medication caution was found for this profile — review the medication safety findings before taking the planned medicine.');
        } else if (medicationSafety.overallRisk === 'UNKNOWN') {
            bump('YELLOW', medicationSafety.identified === false
                ? 'The planned medicine could not be verified against the medicine directory, so its safety could not be fully checked.'
                : 'The safety of the planned medicine could not be fully checked with the information saved in this profile, so a doctor or pharmacist should review it.');
        }
    }

    // 8. Antibiotic self-medication (AMR).
    if (amrAlert) {
        bump('ORANGE', `${amrAlert.medicine.name} is an antibiotic — symptoms alone cannot establish whether an antibiotic is needed, so a doctor should decide.`);
    }

    // GREEN still needs a reason.
    if (reasons.length === 0) {
        reasons.push('The reported symptoms are mild and short-lasting, and no warning signs or medication safety concerns were found for this profile.');
    }

    // Safety override: verified findings the AI layer may never downgrade or remove.
    const verifiedAlertCount = medicationSafety
        ? (medicationSafety.allergyAlerts.length
            + medicationSafety.interactionAlerts.length
            + medicationSafety.duplicateIngredientAlerts.length
            + medicationSafety.conditionWarnings.length
            + medicationSafety.pregnancyWarnings.length
            + medicationSafety.ageRelatedCautions.length)
        : 0;
    const safetyOverride = redFlags.length > 0 || verifiedAlertCount > 0 || Boolean(amrAlert);

    return { risk, reasons, safetyOverride, verifiedAlertCount };
}

function buildWarningSigns(detected) {
    const signs = [];
    const seen = new Set();
    const push = (s) => {
        if (s && !seen.has(s)) {
            seen.add(s);
            signs.push(s);
        }
    };
    for (const symptom of detected) {
        (WARNING_SIGNS_BY_SYMPTOM[symptom.key] || []).forEach(push);
    }
    GENERAL_WARNING_SIGNS.forEach(push);
    return signs.slice(0, 12);
}

function buildSelfCareGuidance(detected) {
    const guidance = [];
    const seen = new Set();
    const push = (g) => {
        if (g && !seen.has(g)) {
            seen.add(g);
            guidance.push(g);
        }
    };
    for (const symptom of detected) {
        (SELF_CARE_BY_SYMPTOM[symptom.key] || []).forEach(push);
    }
    if (guidance.length === 0) push('Rest, stay hydrated, and monitor the symptoms.');
    return guidance.slice(0, 8);
}

function buildNextSteps(riskLevel, amrAlert, medicationSafety) {
    const steps = [];
    if (riskLevel === 'RED') {
        steps.push('Seek urgent medical attention now — the warning signs listed above should not wait.');
        steps.push('Do not start any new medicine for these symptoms before being seen by a doctor.');
        steps.push('If the person becomes unresponsive, has severe breathing difficulty, or has a seizure, call emergency services (1122 / Rescue) immediately.');
    } else if (riskLevel === 'ORANGE') {
        steps.push('Talk to a doctor before taking any medicine for these symptoms — use Connect with a Doctor below.');
        if (medicationSafety) steps.push('Review the Medication Safety findings above carefully before taking the planned medicine.');
        if (amrAlert) steps.push('Do not start the antibiotic on your own — let a doctor confirm whether it is actually needed.');
        steps.push('If symptoms get worse at any point, seek in-person medical care.');
    } else if (riskLevel === 'YELLOW') {
        steps.push('Monitor the symptoms closely and watch for the warning signs listed above.');
        steps.push('If they last longer than a few days or get worse, consult a doctor — Connect with a Doctor is available below.');
        if (medicationSafety) steps.push('Review the Medication Safety findings above before taking the planned medicine.');
    } else {
        steps.push('Rest, stay hydrated, and monitor the symptoms at home.');
        steps.push('Watch for the warning signs listed above — if any appear, seek medical care.');
    }
    return steps;
}

// Patient-friendly deterministic summary built ONLY from verified findings.
function buildDeterministicSummary(context) {
    const { profile, detected, answers, redFlags, medicationSafety, amrAlert, riskLevel } = context;
    const name = profile ? profile.name : 'the patient';
    const relation = profile ? ` (${profile.relation})` : '';
    const symptomNames = detected.length > 0 ? detected.map(d => d.label.toLowerCase()).join(', ') : 'the reported symptoms';
    const dur = durationLabel(answers.symptom_duration);
    const tempC = parseTemperature(answers.fever_temperature);

    let summary = `Safety assessment for ${name}${relation}: ${symptomNames}${dur ? ` for ${dur}` : ''}${tempC != null ? `, with a highest recorded temperature of ${tempC.toFixed(1)}°C` : ''}. `;

    if (redFlags.length > 0) {
        summary += `Urgent warning signs were detected (${redFlags.join('; ')}), so immediate medical attention is recommended and self-medication is not safe. `;
    }
    if (medicationSafety && medicationSafety.identified) {
        if (medicationSafety.overallRisk === 'HIGH') {
            summary += `A verified safety concern was found with the planned medicine ${medicationSafety.medicine.name} for this profile — it should not be taken without a medical review. `;
        } else if (medicationSafety.overallRisk === 'MODERATE') {
            summary += `The planned medicine ${medicationSafety.medicine.name} has cautions for this profile — review the medication safety findings before taking it. `;
        } else if (medicationSafety.overallRisk === 'UNKNOWN') {
            summary += medicationSafety.identified
                ? `The safety of the planned medicine could not be fully checked with the information saved in this profile. `
                : `The planned medicine could not be verified, so its safety for this profile is unknown. `;
        } else {
            summary += `No medication safety concerns were found for ${medicationSafety.medicine.name} in this profile's saved information. `;
        }
    }
    if (amrAlert) {
        summary += `${amrAlert.medicine.name} is an antibiotic — symptoms alone cannot establish whether an antibiotic is needed, and using one unnecessarily can make bacteria harder to treat. `;
    }
    if (riskLevel === 'GREEN') {
        summary += 'The symptoms appear mild and no safety concerns were found.';
    } else if (riskLevel === 'YELLOW') {
        summary += 'Overall this is a caution-level situation — monitor closely and consult a doctor if it does not improve.';
    } else if (riskLevel === 'ORANGE') {
        summary += 'Overall, a medical review is recommended before self-medicating.';
    } else {
        summary += 'Overall, this needs urgent medical attention.';
    }
    return summary.trim();
}

// Build the complete deterministic explanation (used directly when the AI
// layer is unavailable, and as the safety floor when the AI responds).
function buildDeterministicExplanation(context) {
    const { redFlags, medicationSafety, amrAlert, riskLevel, reasons } = context;
    return {
        normalizedSymptoms: context.detected.map(d => d.label),
        summary: buildDeterministicSummary(context),
        riskLevel,
        reasons: [...reasons],
        warningSigns: buildWarningSigns(context.detected),
        selfCareGuidance: buildSelfCareGuidance(context.detected),
        medicationSafety: medicationSafety
            ? {
                status: medicationSafety.overallRisk,
                alerts: flattenSafetyAlerts(medicationSafety)
            }
            : null,
        amrAlert,
        nextSteps: buildNextSteps(riskLevel, amrAlert, medicationSafety),
        doctorConnectRecommended: ['ORANGE', 'RED'].includes(riskLevel),
        disclaimer: DISCLAIMER
    };
}

// Flatten the engine's alert buckets into one patient-friendly list.
function flattenSafetyAlerts(engineResult) {
    if (!engineResult) return [];
    const buckets = [
        engineResult.allergyAlerts,
        engineResult.interactionAlerts,
        engineResult.duplicateIngredientAlerts,
        engineResult.conditionWarnings,
        engineResult.pregnancyWarnings,
        engineResult.ageRelatedCautions,
        engineResult.otherSafetyInfo
    ];
    return buckets.flat().filter(Boolean).map(a => ({
        severity: a.severity,
        title: a.title,
        message: a.message
    }));
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

// Step 1 + 2: profile is already verified by the controller. Normalize the
// symptoms and generate the adaptive question set (AI may add a few extra
// relevant questions; failures are invisible).
async function startAssessment({ profile, symptoms, language = 'en' }) {
    const { detected, isUrdu } = normalizeAndDetect(symptoms);
    const questions = generateQuestions(detected);
    const redFlags = evaluateRedFlags(symptoms, {});

    let enrichedQuestions = questions;
    let aiUsed = false;
    try {
        const enrichment = await triageAiService.generateQuestionEnrichment({
            symptoms, detectedSymptoms: detected, existingQuestions: questions, language
        });
        aiUsed = enrichment.aiUsed;
        if (enrichment.additionalQuestions.length > 0) {
            enrichedQuestions = questions.concat(enrichment.additionalQuestions).slice(0, 12);
        }
    } catch (err) {
        // AI enrichment is optional — deterministic questions always work.
    }

    const overview = {
        id: profile.id,
        name: profile.name,
        relation: profile.relation,
        assessingFor: `Assessing safety for: ${profile.name} (${profile.relation})`
    };

    return {
        profile: overview,
        symptoms,
        language,
        isUrdu,
        detectedSymptoms: detected,
        normalizedSymptoms: detected.map(d => ({ key: d.key, label: d.label, matchedTerm: d.matchedTerm })),
        questions: enrichedQuestions,
        redFlagsDetected: redFlags,
        aiQuestionEnrichmentUsed: aiUsed
    };
}

// Standalone medication check for the planned-medicine step.
function checkPlannedMedicine({ profile, userId, medicineId, medicineName }) {
    const engineResult = medicationSafetyEngine.checkMedicineSafety(
        profile,
        { medicineId: medicineId || null, medicineName: medicineName || null },
        { userId }
    );
    const amrAlert = buildAmrAlert(engineResult.identified ? engineResult.medicine : null);
    return {
        medicationSafety: {
            status: engineResult.overallRisk,
            alerts: flattenSafetyAlerts(engineResult),
            details: engineResult
        },
        amrAlert
    };
}

// Full assessment pipeline (deterministic safety + AI explanation + history).
async function runAssessment({ userId, profile, symptoms, answers = {}, plannedMedicine = null, language = 'en', persist = true }) {
    const { detected, isUrdu } = normalizeAndDetect(symptoms);
    const redFlags = evaluateRedFlags(symptoms, answers);

    // ---- Planned medicine handling ----
    const plan = plannedMedicine && ['yes', 'no', 'unsure'].includes(plannedMedicine.plan) ? plannedMedicine.plan : 'no';
    let medicationSafety = null;
    let amrAlert = null;
    if (plan === 'yes') {
        const check = checkPlannedMedicine({
            profile,
            userId,
            medicineId: plannedMedicine.medicineId || null,
            medicineName: plannedMedicine.medicineName || null
        });
        medicationSafety = check.medicationSafety;
        amrAlert = check.amrAlert;
    }

    // ---- Deterministic risk ----
    const { risk, reasons, safetyOverride, verifiedAlertCount } = calculateRisk({
        redFlags, detected, answers, medicationSafety: medicationSafety ? medicationSafety.details : null, amrAlert
    });

    const tempC = parseTemperature(answers.fever_temperature);
    const durationText = durationLabel(answers.symptom_duration);

    // ---- Deterministic explanation (always available) ----
    const context = {
        profile: { id: profile.id, name: profile.name, relation: profile.relation },
        symptoms,
        detected,
        answers,
        redFlags,
        medicationSafety: medicationSafety ? medicationSafety.details : null,
        amrAlert,
        riskLevel: risk,
        reasons,
        language
    };
    const deterministic = buildDeterministicExplanation(context);

    // ---- AI explanation layer (escalate-only merge) ----
    let aiUsed = false;
    let explanation = deterministic;
    let aiNotice = null;
    try {
        const aiResult = await triageAiService.generateExplanation(context, deterministic);
        aiUsed = aiResult.aiUsed;
        if (aiResult.aiUsed) {
            explanation = aiResult.explanation;
        } else if (aiResult.aiRejected) {
            aiNotice = 'The AI explanation could not be validated, so verified safety results are shown without it.';
        } else {
            aiNotice = 'We couldn\'t complete the full AI explanation, but the available safety checks were completed.';
        }
    } catch (err) {
        // Deterministic results stand on their own.
    }

    // Final risk can only be escalated by the AI, never lowered.
    const finalRisk = maxRisk(risk, explanation.riskLevel);
    const doctorConnectRecommended = ['ORANGE', 'RED'].includes(finalRisk) || explanation.doctorConnectRecommended === true;

    const result = {
        profile: {
            id: profile.id,
            name: profile.name,
            relation: profile.relation,
            assessingFor: `Assessing safety for: ${profile.name} (${profile.relation})`
        },
        symptoms,
        normalizedSymptoms: detected.map(d => ({ key: d.key, label: d.label, matchedTerm: d.matchedTerm })),
        durationSummary: durationText,
        temperatureC: tempC,
        redFlags,
        riskLevel: finalRisk,
        safetyOverride,
        reasons: explanation.reasons && explanation.reasons.length ? explanation.reasons : deterministic.reasons,
        summary: explanation.summary || deterministic.summary,
        warningSigns: explanation.warningSigns && explanation.warningSigns.length ? explanation.warningSigns : deterministic.warningSigns,
        selfCareGuidance: explanation.selfCareGuidance && explanation.selfCareGuidance.length ? explanation.selfCareGuidance : deterministic.selfCareGuidance,
        nextSteps: explanation.nextSteps && explanation.nextSteps.length ? explanation.nextSteps : deterministic.nextSteps,
        medicationSafety,
        amrAlert,
        plannedMedicine: {
            plan,
            medicine: plan === 'yes' && medicationSafety
                ? {
                    name: medicationSafety.details.medicine.name,
                    genericName: medicationSafety.details.medicine.genericName,
                    identified: medicationSafety.details.identified
                }
                : null
        },
        doctorConnectRecommended,
        aiUsed,
        aiNotice,
        verifiedAlertCount,
        disclaimer: DISCLAIMER,
        urduDisclaimer: URDU_DISCLAIMER
    };

    // ---- History (optional but auditable) ----
    if (persist) {
        try {
            const saved = TriageAssessment.create({
                userId,
                familyMemberId: profile.id,
                symptoms,
                normalizedSymptoms: result.normalizedSymptoms,
                answers,
                durationSummary: durationText,
                riskLevel: finalRisk,
                safetyOverride,
                redFlags,
                safetyAlerts: medicationSafety ? medicationSafety.alerts : [],
                plannedMedicine: result.plannedMedicine.medicine,
                amrAlert: Boolean(amrAlert),
                doctorConnectRecommended,
                aiUsed,
                summary: result.summary
            });
            result.assessmentId = saved ? saved.id : null;
        } catch (persistErr) {
            console.error('[Triage] saving assessment history failed:', persistErr.message);
        }
    }

    return result;
}

module.exports = {
    RISK_LEVELS,
    TRIAGE_SYMPTOM_MAP,
    normalizeAndDetect,
    generateQuestions,
    evaluateRedFlags,
    parseTemperature,
    durationLabel,
    durationRank,
    calculateRisk,
    buildAmrAlert,
    buildWarningSigns,
    buildSelfCareGuidance,
    buildNextSteps,
    buildDeterministicSummary,
    buildDeterministicExplanation,
    flattenSafetyAlerts,
    startAssessment,
    checkPlannedMedicine,
    runAssessment,
    DISCLAIMER
};
