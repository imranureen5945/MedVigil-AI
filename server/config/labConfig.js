/**
 * MedVigil AI — Laboratory Report Configuration
 * 
 * Centralized configuration for reference ranges, critical thresholds,
 * red flag rules, and panel definitions. Extensible by design —
 * new panels can be added without modifying the core engine.
 */

// ─── RISK LEVEL DEFINITIONS ─────────────────────────────────────────
const RISK_LEVELS = {
    GREEN:  { label: 'GREEN',  description: 'No significant abnormalities detected.', color: '#10b981' },
    YELLOW: { label: 'YELLOW', description: 'Minor or isolated abnormality.', color: '#f59e0b' },
    ORANGE: { label: 'ORANGE', description: 'Multiple abnormalities warranting timely medical review.', color: '#f97316' },
    RED:    { label: 'RED',    description: 'Potentially dangerous result requiring urgent attention.', color: '#ef4444' }
};

// ─── FILE UPLOAD LIMITS ─────────────────────────────────────────────
const UPLOAD_LIMITS = {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png',
        'application/pdf'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
};

// ─── LABORATORY TEST REFERENCE RANGES ───────────────────────────────
// Each test has: testName, aliases (for OCR matching), unit, default ranges,
// optional sex/age-specific ranges, and critical thresholds.
// 
// IMPORTANT: The deterministic engine prefers the reference range printed
// on the user's actual report. These defaults are used ONLY when the
// report does not provide a range.

const LAB_TESTS = {
    // ── CBC PANEL ─────────────────────────────────────────────────
    hemoglobin: {
        testName: 'Hemoglobin',
        aliases: ['hb', 'hgb', 'hgb ', 'haemoglobin'],
        unit: 'g/dL',
        defaultRange: { male: { low: 13.5, high: 17.5 }, female: { low: 12, high: 15.5 } },
        critical: { low: 7, high: 20 },
        panel: 'CBC'
    },
    hematocrit: {
        testName: 'Hematocrit',
        aliases: ['hct', 'hct ', 'packed cell volume', 'pcv'],
        unit: '%',
        defaultRange: { male: { low: 38.3, high: 48.6 }, female: { low: 35.5, high: 44.9 } },
        critical: { low: 25, high: 60 },
        panel: 'CBC'
    },
    rbc: {
        testName: 'Red Blood Cell Count',
        aliases: ['rbc', 'rbc count', 'red blood cells', 'erythrocyte count'],
        unit: 'million/µL',
        defaultRange: { male: { low: 4.5, high: 5.9 }, female: { low: 4.0, high: 5.2 } },
        critical: { low: 3.0, high: 7.0 },
        panel: 'CBC'
    },
    wbc: {
        testName: 'White Blood Cell Count',
        aliases: ['wbc', 'wbc count', 'white blood cells', 'leukocyte count', 'total leukocyte count', 'tlc'],
        unit: 'thousand/µL',
        defaultRange: { low: 4.5, high: 11.0 },
        critical: { low: 2.0, high: 30.0 },
        panel: 'CBC'
    },
    platelets: {
        testName: 'Platelet Count',
        aliases: ['platelet', 'platelets', 'plt', 'plt count', 'thrombocyte'],
        unit: 'thousand/µL',
        defaultRange: { low: 150, high: 400 },
        critical: { low: 50, high: 1000 },
        panel: 'CBC'
    },
    mcv: {
        testName: 'Mean Corpuscular Volume',
        aliases: ['mcv', 'mean corpuscular volume', 'mean cell volume'],
        unit: 'fL',
        defaultRange: { low: 80, high: 100 },
        critical: { low: 70, high: 120 },
        panel: 'CBC'
    },
    mch: {
        testName: 'Mean Corpuscular Hemoglobin',
        aliases: ['mch', 'mean corpuscular hemoglobin', 'mean cell hemoglobin'],
        unit: 'pg',
        defaultRange: { low: 27, high: 33 },
        critical: { low: 22, high: 40 },
        panel: 'CBC'
    },
    mchc: {
        testName: 'Mean Corpuscular Hemoglobin Concentration',
        aliases: ['mchc', 'mean corpuscular hemoglobin concentration'],
        unit: 'g/dL',
        defaultRange: { low: 32, high: 36 },
        critical: { low: 28, high: 40 },
        panel: 'CBC'
    },
    rdw: {
        testName: 'Red Cell Distribution Width',
        aliases: ['rdw', 'rdw-cv', 'red cell distribution width'],
        unit: '%',
        defaultRange: { low: 11.5, high: 14.5 },
        critical: null,
        panel: 'CBC'
    },
    neutrophils: {
        testName: 'Neutrophils',
        aliases: ['neutrophil', 'neutrophils', 'neut', 'polymorphonuclear', 'pmn', 'anc'],
        unit: '%',
        defaultRange: { low: 40, high: 70 },
        critical: { low: 20, high: 85 },
        panel: 'CBC'
    },
    lymphocytes: {
        testName: 'Lymphocytes',
        aliases: ['lymphocyte', 'lymphocytes', 'lymph'],
        unit: '%',
        defaultRange: { low: 20, high: 45 },
        critical: { low: 10, high: 60 },
        panel: 'CBC'
    },
    eosinophils: {
        testName: 'Eosinophils',
        aliases: ['eosinophil', 'eosinophils', 'eos'],
        unit: '%',
        defaultRange: { low: 1, high: 6 },
        critical: null,
        panel: 'CBC'
    },
    monocytes: {
        testName: 'Monocytes',
        aliases: ['monocyte', 'monocytes', 'mono'],
        unit: '%',
        defaultRange: { low: 2, high: 10 },
        critical: null,
        panel: 'CBC'
    },
    basophils: {
        testName: 'Basophils',
        aliases: ['basophil', 'basophils', 'baso'],
        unit: '%',
        defaultRange: { low: 0, high: 2 },
        critical: null,
        panel: 'CBC'
    },
    esr: {
        testName: 'ESR',
        aliases: ['esr', 'erythrocyte sedimentation rate', 'sed rate'],
        unit: 'mm/hr',
        defaultRange: { male: { low: 0, high: 15 }, female: { low: 0, high: 20 } },
        critical: null,
        panel: 'CBC'
    },

    // ── BLOOD GLUCOSE ─────────────────────────────────────────────
    fasting_glucose: {
        testName: 'Fasting Blood Glucose',
        aliases: ['fasting glucose', 'fasting blood glucose', 'fasting blood sugar', 'fbs', 'fbg', 'fasting sugar'],
        unit: 'mg/dL',
        defaultRange: { low: 70, high: 100 },
        critical: { low: 40, high: 500 },
        panel: 'Blood Glucose'
    },
    random_glucose: {
        testName: 'Random Blood Glucose',
        aliases: ['random glucose', 'random blood glucose', 'random blood sugar', 'rbs', 'rbg', 'random sugar'],
        unit: 'mg/dL',
        defaultRange: { low: 70, high: 140 },
        critical: { low: 40, high: 500 },
        panel: 'Blood Glucose'
    },
    postprandial_glucose: {
        testName: 'Postprandial Blood Glucose',
        aliases: ['postprandial glucose', '2hr glucose', '2 hour glucose', 'ppbs', 'pp', 'post meal glucose', 'post prandial'],
        unit: 'mg/dL',
        defaultRange: { low: 70, high: 140 },
        critical: { low: 40, high: 500 },
        panel: 'Blood Glucose'
    },

    // ── HbA1c ─────────────────────────────────────────────────────
    hba1c: {
        testName: 'HbA1c',
        aliases: ['hba1c', 'glycated hemoglobin', 'glycosylated hemoglobin', 'a1c', 'glycohemoglobin'],
        unit: '%',
        defaultRange: { low: 4.0, high: 5.6 },
        critical: { low: 4.0, high: 14.0 },
        panel: 'HbA1c'
    },

    // ── LIPID PROFILE ─────────────────────────────────────────────
    total_cholesterol: {
        testName: 'Total Cholesterol',
        aliases: ['total cholesterol', 'cholesterol', 'chol', 'tc'],
        unit: 'mg/dL',
        defaultRange: { low: 0, high: 200 },
        critical: { high: 400 },
        panel: 'Lipid Profile'
    },
    ldl: {
        testName: 'LDL Cholesterol',
        aliases: ['ldl', 'ldl cholesterol', 'low density lipoprotein', 'bad cholesterol'],
        unit: 'mg/dL',
        defaultRange: { low: 0, high: 100 },
        critical: { high: 250 },
        panel: 'Lipid Profile'
    },
    hdl: {
        testName: 'HDL Cholesterol',
        aliases: ['hdl', 'hdl cholesterol', 'high density lipoprotein', 'good cholesterol'],
        unit: 'mg/dL',
        defaultRange: { male: { low: 40, high: 90 }, female: { low: 50, high: 90 } },
        critical: { low: 20 },
        panel: 'Lipid Profile'
    },
    triglycerides: {
        testName: 'Triglycerides',
        aliases: ['triglycerides', 'tg', 'triacylglycerol'],
        unit: 'mg/dL',
        defaultRange: { low: 0, high: 150 },
        critical: { high: 500 },
        panel: 'Lipid Profile'
    },
    vldl: {
        testName: 'VLDL Cholesterol',
        aliases: ['vldl', 'vldl cholesterol', 'very low density lipoprotein'],
        unit: 'mg/dL',
        defaultRange: { low: 2, high: 30 },
        critical: null,
        panel: 'Lipid Profile'
    },
    cholesterol_hdl_ratio: {
        testName: 'Cholesterol/HDL Ratio',
        aliases: ['cholesterol/hdl ratio', 'chol/hdl', 'tc/hdl', 'cholesterol ratio'],
        unit: '',
        defaultRange: { low: 0, high: 5.0 },
        critical: null,
        panel: 'Lipid Profile'
    },

    // ── LIVER FUNCTION TESTS ──────────────────────────────────────
    alt: {
        testName: 'ALT (SGPT)',
        aliases: ['alt', 'sgpt', 'alanine aminotransferase', 'alanine transaminase'],
        unit: 'U/L',
        defaultRange: { male: { low: 0, high: 45 }, female: { low: 0, high: 35 } },
        critical: { high: 1000 },
        panel: 'Liver Function'
    },
    ast: {
        testName: 'AST (SGOT)',
        aliases: ['ast', 'sgot', 'aspartate aminotransferase', 'aspartate transaminase'],
        unit: 'U/L',
        defaultRange: { low: 0, high: 40 },
        critical: { high: 1000 },
        panel: 'Liver Function'
    },
    alp: {
        testName: 'Alkaline Phosphatase',
        aliases: ['alp', 'alkaline phosphatase', 'alk phos'],
        unit: 'U/L',
        defaultRange: { low: 44, high: 147 },
        critical: { high: 500 },
        panel: 'Liver Function'
    },
    total_bilirubin: {
        testName: 'Total Bilirubin',
        aliases: ['total bilirubin', 'bilirubin total', 'serum bilirubin', 't. bilirubin'],
        unit: 'mg/dL',
        defaultRange: { low: 0.1, high: 1.2 },
        critical: { high: 10 },
        panel: 'Liver Function'
    },
    direct_bilirubin: {
        testName: 'Direct Bilirubin',
        aliases: ['direct bilirubin', 'conjugated bilirubin', 'd. bilirubin'],
        unit: 'mg/dL',
        defaultRange: { low: 0, high: 0.3 },
        critical: { high: 5 },
        panel: 'Liver Function'
    },
    indirect_bilirubin: {
        testName: 'Indirect Bilirubin',
        aliases: ['indirect bilirubin', 'unconjugated bilirubin', 'i. bilirubin'],
        unit: 'mg/dL',
        defaultRange: { low: 0.1, high: 1.0 },
        critical: null,
        panel: 'Liver Function'
    },
    albumin: {
        testName: 'Albumin',
        aliases: ['albumin', 'serum albumin', 'alb'],
        unit: 'g/dL',
        defaultRange: { low: 3.5, high: 5.5 },
        critical: { low: 2.0 },
        panel: 'Liver Function'
    },
    total_protein: {
        testName: 'Total Protein',
        aliases: ['total protein', 'serum protein', 'tp'],
        unit: 'g/dL',
        defaultRange: { low: 6.0, high: 8.3 },
        critical: null,
        panel: 'Liver Function'
    },
    ggt: {
        testName: 'GGT',
        aliases: ['ggt', 'gamma gt', 'gamma-glutamyl transferase', 'gamma glutamyl transpeptidase'],
        unit: 'U/L',
        defaultRange: { male: { low: 0, high: 55 }, female: { low: 0, high: 38 } },
        critical: null,
        panel: 'Liver Function'
    },

    // ── KIDNEY FUNCTION TESTS ─────────────────────────────────────
    creatinine: {
        testName: 'Serum Creatinine',
        aliases: ['creatinine', 'serum creatinine', 's. creatinine', 'cr'],
        unit: 'mg/dL',
        defaultRange: { male: { low: 0.7, high: 1.3 }, female: { low: 0.6, high: 1.1 } },
        critical: { low: 0.4, high: 10 },
        panel: 'Kidney Function'
    },
    bun: {
        testName: 'Blood Urea Nitrogen',
        aliases: ['bun', 'blood urea nitrogen', 'urea nitrogen'],
        unit: 'mg/dL',
        defaultRange: { low: 7, high: 20 },
        critical: { high: 100 },
        panel: 'Kidney Function'
    },
    urea: {
        testName: 'Blood Urea',
        aliases: ['urea', 'blood urea', 'serum urea', 's. urea'],
        unit: 'mg/dL',
        defaultRange: { low: 15, high: 45 },
        critical: { high: 200 },
        panel: 'Kidney Function'
    },
    egfr: {
        testName: 'eGFR',
        aliases: ['egfr', 'estimated gfr', 'estimated glomerular filtration rate', 'gfr'],
        unit: 'mL/min/1.73m²',
        defaultRange: { low: 90, high: 120 },
        critical: { low: 15 },
        panel: 'Kidney Function'
    },
    uric_acid: {
        testName: 'Uric Acid',
        aliases: ['uric acid', 'serum uric acid', 's. uric acid'],
        unit: 'mg/dL',
        defaultRange: { male: { low: 3.5, high: 7.2 }, female: { low: 2.6, high: 6.0 } },
        critical: { high: 13 },
        panel: 'Kidney Function'
    },

    // ── ELECTROLYTES ──────────────────────────────────────────────
    sodium: {
        testName: 'Sodium',
        aliases: ['sodium', 'na', 'serum sodium', 's. sodium'],
        unit: 'mEq/L',
        defaultRange: { low: 136, high: 145 },
        critical: { low: 120, high: 160 },
        panel: 'Kidney Function'
    },
    potassium: {
        testName: 'Potassium',
        aliases: ['potassium', 'k', 'serum potassium', 's. potassium'],
        unit: 'mEq/L',
        defaultRange: { low: 3.5, high: 5.0 },
        critical: { low: 2.5, high: 6.5 },
        panel: 'Kidney Function'
    },
    chloride: {
        testName: 'Chloride',
        aliases: ['chloride', 'cl', 'serum chloride'],
        unit: 'mEq/L',
        defaultRange: { low: 98, high: 106 },
        critical: { low: 80, high: 120 },
        panel: 'Kidney Function'
    },
    calcium: {
        testName: 'Calcium',
        aliases: ['calcium', 'ca', 'serum calcium', 'total calcium'],
        unit: 'mg/dL',
        defaultRange: { low: 8.5, high: 10.5 },
        critical: { low: 6.0, high: 13.0 },
        panel: 'Kidney Function'
    },
    phosphorus: {
        testName: 'Phosphorus',
        aliases: ['phosphorus', 'phosphate', 'serum phosphorus', 'p'],
        unit: 'mg/dL',
        defaultRange: { low: 2.5, high: 4.5 },
        critical: { low: 1.0, high: 8.0 },
        panel: 'Kidney Function'
    },

    // ── THYROID PROFILE ───────────────────────────────────────────
    tsh: {
        testName: 'TSH',
        aliases: ['tsh', 'thyroid stimulating hormone', 'thyrotropin'],
        unit: 'mIU/L',
        defaultRange: { low: 0.4, high: 4.0 },
        critical: { low: 0.1, high: 20 },
        panel: 'Thyroid'
    },
    ft4: {
        testName: 'Free T4',
        aliases: ['ft4', 'free t4', 'free thyroxine', 'free thyroxin'],
        unit: 'ng/dL',
        defaultRange: { low: 0.8, high: 1.8 },
        critical: { low: 0.4, high: 4.0 },
        panel: 'Thyroid'
    },
    ft3: {
        testName: 'Free T3',
        aliases: ['ft3', 'free t3', 'free triiodothyronine'],
        unit: 'pg/mL',
        defaultRange: { low: 2.3, high: 4.2 },
        critical: { low: 1.0, high: 10 },
        panel: 'Thyroid'
    },
    total_t4: {
        testName: 'Total T4',
        aliases: ['total t4', 't4', 'thyroxine'],
        unit: 'µg/dL',
        defaultRange: { low: 5.0, high: 12.0 },
        critical: null,
        panel: 'Thyroid'
    },
    total_t3: {
        testName: 'Total T3',
        aliases: ['total t3', 't3', 'triiodothyronine'],
        unit: 'ng/dL',
        defaultRange: { low: 80, high: 200 },
        critical: null,
        panel: 'Thyroid'
    },

    // ── VITAMIN D ─────────────────────────────────────────────────
    vitamin_d: {
        testName: 'Vitamin D (25-OH)',
        aliases: ['vitamin d', 'vit d', '25-oh vitamin d', '25-hydroxyvitamin d', '25(oh)d', 'vitamin d3', '25 oh'],
        unit: 'ng/mL',
        defaultRange: { low: 30, high: 100 },
        critical: { low: 10 },
        panel: 'Vitamin D'
    },

    // ── VITAMIN B12 ───────────────────────────────────────────────
    vitamin_b12: {
        testName: 'Vitamin B12',
        aliases: ['vitamin b12', 'vit b12', 'b12', 'cobalamin', 'serum b12'],
        unit: 'pg/mL',
        defaultRange: { low: 200, high: 900 },
        critical: { low: 100 },
        panel: 'Vitamin B12'
    },

    // ── IRON STUDIES ──────────────────────────────────────────────
    serum_iron: {
        testName: 'Serum Iron',
        aliases: ['serum iron', 'iron', 's. iron'],
        unit: 'µg/dL',
        defaultRange: { male: { low: 65, high: 175 }, female: { low: 50, high: 170 } },
        critical: null,
        panel: 'Iron Studies'
    },
    ferritin: {
        testName: 'Ferritin',
        aliases: ['ferritin', 'serum ferritin', 's. ferritin'],
        unit: 'ng/mL',
        defaultRange: { male: { low: 20, high: 250 }, female: { low: 15, high: 150 } },
        critical: { low: 10, high: 1000 },
        panel: 'Iron Studies'
    },
    tibc: {
        testName: 'TIBC',
        aliases: ['tibc', 'total iron binding capacity'],
        unit: 'µg/dL',
        defaultRange: { low: 250, high: 450 },
        critical: null,
        panel: 'Iron Studies'
    },
    transferrin_saturation: {
        testName: 'Transferrin Saturation',
        aliases: ['transferrin saturation', 'tsat', 'iron saturation'],
        unit: '%',
        defaultRange: { low: 20, high: 50 },
        critical: null,
        panel: 'Iron Studies'
    },

    // ── URINALYSIS ────────────────────────────────────────────────
    urine_protein: {
        testName: 'Urine Protein',
        aliases: ['urine protein', 'proteinuria', 'protein (urine)'],
        unit: '',
        defaultRange: { low: 0, high: 0 },
        critical: null,
        panel: 'Urinalysis',
        isQualitative: true,
        normalValues: ['negative', 'nil', 'trace', 'absent']
    },
    urine_glucose: {
        testName: 'Urine Glucose',
        aliases: ['urine glucose', 'glycosuria', 'glucose (urine)'],
        unit: '',
        defaultRange: { low: 0, high: 0 },
        critical: null,
        panel: 'Urinalysis',
        isQualitative: true,
        normalValues: ['negative', 'nil', 'absent']
    },
    urine_rbc: {
        testName: 'Urine RBC',
        aliases: ['urine rbc', 'rbc (urine)', 'red blood cells (urine)', 'hematuria'],
        unit: '/HPF',
        defaultRange: { low: 0, high: 3 },
        critical: null,
        panel: 'Urinalysis'
    },
    urine_wbc: {
        testName: 'Urine WBC',
        aliases: ['urine wbc', 'wbc (urine)', 'white blood cells (urine)', 'pus cells'],
        unit: '/HPF',
        defaultRange: { low: 0, high: 5 },
        critical: null,
        panel: 'Urinalysis'
    },
    urine_ph: {
        testName: 'Urine pH',
        aliases: ['urine ph', 'ph (urine)'],
        unit: '',
        defaultRange: { low: 4.5, high: 8.0 },
        critical: null,
        panel: 'Urinalysis'
    },
    urine_specific_gravity: {
        testName: 'Urine Specific Gravity',
        aliases: ['specific gravity', 'urine specific gravity', 'sg', 'urine sg'],
        unit: '',
        defaultRange: { low: 1.005, high: 1.030 },
        critical: null,
        panel: 'Urinalysis'
    }
};

// ─── RED FLAG RULES ──────────────────────────────────────────────────
// Each rule defines a critical condition that should be prominently flagged.
// These are CONFIGURABLE — new rules can be added without code changes.

const RED_FLAG_RULES = [
    {
        id: 'critical_potassium_high',
        testKeys: ['potassium'],
        condition: (value) => value >= 6.0,
        label: 'Critically High Potassium',
        severity: 'RED',
        message: 'Potassium at this level may cause dangerous heart rhythm abnormalities. Urgent medical evaluation is recommended.'
    },
    {
        id: 'critical_potassium_low',
        testKeys: ['potassium'],
        condition: (value) => value <= 2.8,
        label: 'Critically Low Potassium',
        severity: 'RED',
        message: 'Severely low potassium may cause muscle weakness and dangerous heart rhythm disturbances. Urgent medical evaluation is recommended.'
    },
    {
        id: 'critical_hemoglobin_low',
        testKeys: ['hemoglobin'],
        condition: (value) => value < 7,
        label: 'Critically Low Hemoglobin',
        severity: 'RED',
        message: 'Hemoglobin below 7 g/dL may indicate severe anemia requiring urgent medical attention. This level may warrant blood transfusion evaluation.'
    },
    {
        id: 'critical_glucose_high',
        testKeys: ['fasting_glucose', 'random_glucose', 'postprandial_glucose'],
        condition: (value) => value >= 400,
        label: 'Severely Elevated Blood Glucose',
        severity: 'RED',
        message: 'Blood glucose at this level may indicate a potentially dangerous metabolic state. Urgent medical evaluation is recommended.'
    },
    {
        id: 'critical_glucose_low',
        testKeys: ['fasting_glucose', 'random_glucose', 'postprandial_glucose'],
        condition: (value) => value <= 50,
        label: 'Critically Low Blood Glucose',
        severity: 'RED',
        message: 'Blood glucose at this level may cause confusion, seizures, or loss of consciousness. Immediate medical attention is recommended.'
    },
    {
        id: 'critical_sodium_low',
        testKeys: ['sodium'],
        condition: (value) => value <= 125,
        label: 'Severely Low Sodium',
        severity: 'RED',
        message: 'Severely low sodium may cause confusion, seizures, and brain swelling. Urgent medical evaluation is recommended.'
    },
    {
        id: 'critical_sodium_high',
        testKeys: ['sodium'],
        condition: (value) => value >= 155,
        label: 'Severely High Sodium',
        severity: 'RED',
        message: 'Severely elevated sodium may indicate dangerous dehydration or other serious conditions. Urgent medical evaluation is recommended.'
    },
    {
        id: 'critical_creatinine_high',
        testKeys: ['creatinine'],
        condition: (value) => value >= 5,
        label: 'Severely Impaired Kidney Function',
        severity: 'RED',
        message: 'Creatinine at this level may indicate severely impaired kidney function. Urgent nephrology evaluation is recommended.'
    },
    {
        id: 'critical_egfr_low',
        testKeys: ['egfr'],
        condition: (value) => value < 15,
        label: 'Severely Reduced Kidney Filtration',
        severity: 'RED',
        message: 'eGFR below 15 may indicate kidney failure. Urgent nephrology evaluation is recommended.'
    },
    {
        id: 'critical_platelets_low',
        testKeys: ['platelets'],
        condition: (value) => value < 50,
        label: 'Critically Low Platelets',
        severity: 'RED',
        message: 'Platelet count this low may indicate risk of spontaneous bleeding. Urgent hematology evaluation is recommended.'
    },
    {
        id: 'critical_wbc_high',
        testKeys: ['wbc'],
        condition: (value) => value >= 25,
        label: 'Severely Elevated White Blood Cells',
        severity: 'ORANGE',
        message: 'Markedly elevated WBC may indicate serious infection or other conditions requiring prompt medical evaluation.'
    },
    {
        id: 'critical_wbc_low',
        testKeys: ['wbc'],
        condition: (value) => value < 2.5,
        label: 'Severely Low White Blood Cells',
        severity: 'ORANGE',
        message: 'Severely low WBC may indicate impaired immune function. Prompt medical evaluation is recommended.'
    },
    {
        id: 'critical_bilirubin_high',
        testKeys: ['total_bilirubin'],
        condition: (value) => value >= 5,
        label: 'Severely Elevated Bilirubin',
        severity: 'ORANGE',
        message: 'Markedly elevated bilirubin may indicate significant liver dysfunction or bile duct obstruction. Prompt medical evaluation is recommended.'
    },
    {
        id: 'critical_alt_ast_high',
        testKeys: ['alt', 'ast'],
        condition: (value) => value >= 500,
        label: 'Severely Elevated Liver Enzymes',
        severity: 'ORANGE',
        message: 'Liver enzymes at this level may indicate significant liver injury. Prompt hepatology evaluation is recommended.'
    },
    {
        id: 'critical_calcium_high',
        testKeys: ['calcium'],
        condition: (value) => value >= 12,
        label: 'Severely Elevated Calcium',
        severity: 'ORANGE',
        message: 'Markedly elevated calcium may cause kidney stones, confusion, and heart rhythm issues. Prompt medical evaluation is recommended.'
    },
    {
        id: 'critical_calcium_low',
        testKeys: ['calcium'],
        condition: (value) => value <= 7,
        label: 'Severely Low Calcium',
        severity: 'ORANGE',
        message: 'Severely low calcium may cause muscle spasms, tingling, and heart rhythm abnormalities. Prompt medical evaluation is recommended.'
    },
    {
        id: 'critical_tsh_high',
        testKeys: ['tsh'],
        condition: (value) => value >= 15,
        label: 'Markedly Elevated TSH',
        severity: 'ORANGE',
        message: 'TSH at this level may indicate significant hypothyroidism. Prompt endocrinology evaluation is recommended.'
    },
    {
        id: 'critical_tsh_low',
        testKeys: ['tsh'],
        condition: (value) => value <= 0.1,
        label: 'Markedly Suppressed TSH',
        severity: 'ORANGE',
        message: 'Suppressed TSH may indicate significant hyperthyroidism. Prompt endocrinology evaluation is recommended.'
    }
];

// ─── MULTI-VALUE PATTERN ANALYSIS ────────────────────────────────────
// Patterns the AI layer should recognize across related tests.

const LAB_PATTERNS = [
    {
        id: 'anemia_pattern',
        label: 'Possible Anemia Pattern',
        panel: 'CBC',
        testKeys: ['hemoglobin', 'hematocrit', 'mcv', 'mch', 'rdw'],
        description: 'Multiple CBC parameters may suggest an anemia pattern that warrants clinical correlation.'
    },
    {
        id: 'diabetes_pattern',
        label: 'Possible Blood Sugar Concern',
        panel: 'Blood Glucose',
        testKeys: ['fasting_glucose', 'hba1c', 'random_glucose'],
        description: 'Blood glucose parameters may suggest altered sugar metabolism warranting clinical evaluation.'
    },
    {
        id: 'dyslipidemia_pattern',
        label: 'Possible Lipid Abnormality',
        panel: 'Lipid Profile',
        testKeys: ['total_cholesterol', 'ldl', 'hdl', 'triglycerides'],
        description: 'Multiple lipid parameters may suggest a pattern warranting cardiovascular risk assessment.'
    },
    {
        id: 'liver_injury_pattern',
        label: 'Possible Liver Function Concern',
        panel: 'Liver Function',
        testKeys: ['alt', 'ast', 'alp', 'total_bilirubin', 'albumin'],
        description: 'Multiple liver function parameters may suggest hepatic involvement warranting further evaluation.'
    },
    {
        id: 'kidney_impairment_pattern',
        label: 'Possible Kidney Function Concern',
        panel: 'Kidney Function',
        testKeys: ['creatinine', 'bun', 'urea', 'egfr'],
        description: 'Multiple kidney function parameters may suggest renal impairment warranting clinical correlation.'
    },
    {
        id: 'thyroid_pattern',
        label: 'Possible Thyroid Function Concern',
        panel: 'Thyroid',
        testKeys: ['tsh', 'ft4', 'ft3'],
        description: 'Thyroid parameters may suggest altered thyroid function warranting endocrinology evaluation.'
    },
    {
        id: 'iron_deficiency_pattern',
        label: 'Possible Iron Deficiency Pattern',
        panel: 'Iron Studies',
        testKeys: ['serum_iron', 'ferritin', 'tibc', 'transferrin_saturation'],
        description: 'Iron study parameters may suggest iron deficiency warranting clinical correlation.'
    }
];

// ─── DETECTED PANELS ─────────────────────────────────────────────────
// Maps panel names to their constituent test keys for grouping.

const PANEL_DEFINITIONS = {
    'CBC': {
        label: 'Complete Blood Count (CBC)',
        testKeys: ['hemoglobin', 'hematocrit', 'rbc', 'wbc', 'platelets', 'mcv', 'mch', 'mchc', 'rdw', 'neutrophils', 'lymphocytes', 'eosinophils', 'monocytes', 'basophils', 'esr']
    },
    'Blood Glucose': {
        label: 'Blood Glucose',
        testKeys: ['fasting_glucose', 'random_glucose', 'postprandial_glucose']
    },
    'HbA1c': {
        label: 'HbA1c',
        testKeys: ['hba1c']
    },
    'Lipid Profile': {
        label: 'Lipid Profile',
        testKeys: ['total_cholesterol', 'ldl', 'hdl', 'triglycerides', 'vldl', 'cholesterol_hdl_ratio']
    },
    'Liver Function': {
        label: 'Liver Function Tests (LFT)',
        testKeys: ['alt', 'ast', 'alp', 'total_bilirubin', 'direct_bilirubin', 'indirect_bilirubin', 'albumin', 'total_protein', 'ggt']
    },
    'Kidney Function': {
        label: 'Kidney Function Tests (KFT)',
        testKeys: ['creatinine', 'bun', 'urea', 'egfr', 'uric_acid', 'sodium', 'potassium', 'chloride', 'calcium', 'phosphorus']
    },
    'Thyroid': {
        label: 'Thyroid Profile',
        testKeys: ['tsh', 'ft4', 'ft3', 'total_t4', 'total_t3']
    },
    'Vitamin D': {
        label: 'Vitamin D',
        testKeys: ['vitamin_d']
    },
    'Vitamin B12': {
        label: 'Vitamin B12',
        testKeys: ['vitamin_b12']
    },
    'Iron Studies': {
        label: 'Iron Studies',
        testKeys: ['serum_iron', 'ferritin', 'tibc', 'transferrin_saturation']
    },
    'Urinalysis': {
        label: 'Urinalysis',
        testKeys: ['urine_protein', 'urine_glucose', 'urine_rbc', 'urine_wbc', 'urine_ph', 'urine_specific_gravity']
    }
};

module.exports = {
    RISK_LEVELS,
    UPLOAD_LIMITS,
    LAB_TESTS,
    RED_FLAG_RULES,
    LAB_PATTERNS,
    PANEL_DEFINITIONS
};
