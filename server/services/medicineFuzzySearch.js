/**
 * Medicine fuzzy-search utilities.
 *
 * Provides:
 *   - Levenshtein edit distance
 *   - OCR / common misspelling correction (shared with ocrService.js)
 *   - Roman-Urdu → English phonetic normalisation
 *   - Brand/generic/ingredient-aware fuzzy lookup against a medicine list
 *
 * The search pipeline mirrors how Pakistani users type medicine names:
 *   1. OCR correction       (panadl → Panadol)
 *   2. Roman Urdu mapping   (bukhar → fever, sar-dard → headache)
 *   3. Spacing normalisation (tagipmet → tagi met → sitagliptin + metformin)
 *   4. Levenshtein proximity  (Tagipment → Tagipmet  — distance 1)
 */

// ── Levenshtein distance ───────────────────────────────────────────────────────
function levenshtein(a, b) {
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;

    const matrix = [];
    for (let i = 0; i <= al; i++) {
        matrix[i] = [i];
        for (let j = 1; j <= bl; j++) {
            matrix[i][j] = i === 0
                ? j
                : Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
        }
    }
    return matrix[al][bl];
}

/**
 * Similarity score 0–1 between two strings (1 = identical).
 */
function similarity(a, b) {
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

// ── Common OCR misspellings (expanded from ocrService.js) ─────────────────────
const COMMON_OCR_TYPOS = {
    // Analgesics
    'panad0l': 'Panadol', 'panadl': 'Panadol', 'panadole': 'Panadol', 'panadol': 'Panadol',
    'calp0l': 'Calpol', 'calpl': 'Calpol',
    'brufn': 'Brufen', 'bruphn': 'Brufen', 'burfen': 'Brufen',
    'ponstn': 'Ponstan', 'p0nstan': 'Ponstan',
    'synflx': 'Synflex', 'synflax': 'Synflex',
    // Antibiotics
    'augmntin': 'Augmentin', 'augmantin': 'Augmentin', 'augmntn': 'Augmentin', 'augmnetin': 'Augmentin',
    'amoxl': 'Amoxil', 'amxyl': 'Amoxil', 'amoxil': 'Amoxil',
    'septrn': 'Septran', 'septra': 'Septran',
    'flagl': 'Flagyl', 'flgyl': 'Flagyl', 'flagl': 'Flagyl',
    'novidat': 'Novidat', 'novidte': 'Novidat', 'novidet': 'Novidat',
    'ciproxn': 'Ciproxin', 'ciprxn': 'Ciproxin',
    'az0max': 'Azomax', 'azimax': 'Azomax',
    'vel0sef': 'Velosef', 'veloseph': 'Velosef',
    // GI
    'r1sek': 'Risek', 'risik': 'Risek', 'risec': 'Risek', 'risak': 'Risek',
    'gaviscn': 'Gaviscon', 'gavison': 'Gaviscon',
    'm0tilium': 'Motilium', 'motilim': 'Motilium',
    'buscopn': 'Buscopan', 'busc0pan': 'Buscopan',
    'smecta': 'Smecta',
    // Cardio
    'n0rvasc': 'Norvasc', 'norvas': 'Norvasc', 'norvasak': 'Norvasc',
    'c0ncor': 'Concor', 'concor': 'Concor',
    // Diabetes
    'gluc0phage': 'Glucophage', 'gluco': 'Glucophage', 'glucophage': 'Glucophage',
    'gluc0phaje': 'Glucophage',
    'tagipmet': 'Tagipmet', 'tagipmnt': 'Tagipmet', 'tagipmt': 'Tagipmet',
    'tagipment': 'Tagipmet', 'tagi met': 'Tagipmet', 'tagi met': 'Tagipmet',
    'glimepride': 'Amaryl', 'glimepiride': 'Amaryl',
    // Respiratory
    'vent0lin': 'Ventolin', 'ventoln': 'Ventolin',
    'singulir': 'Singulair', 'singulair': 'Singulair',
    // Thyroid
    'thyr0x': 'Thyrox', 'thyroxine': 'Thyrox',
    // Others
    'zantac': 'Zantac', 'xanax': 'Xanax',
};

/**
 * Apply OCR/typo correction to a single word.
 */
function correctOcrTypo(word) {
    const lower = word.toLowerCase();
    return COMMON_OCR_TYPOS[lower] || word;
}

/**
 * Apply OCR correction to an entire input string.
 */
function correctOcrString(input) {
    if (!input || typeof input !== 'string') return '';
    return input
        .split(/\s+/)
        .map(correctOcrTypo)
        .join(' ');
}

// ── Roman Urdu → English symptom/condition keywords ───────────────────────────
const ROMAN_URDU_MAP = {
    'bukhar': 'fever',
    'sardard': 'headache',
    'sardard': 'headache',
    'pait': 'stomach',
    'dard': 'pain',
    'khansi': 'cough',
    'zukaam': 'cold',
    'tabkhir': 'fever',
    'blood pressure': 'hypertension',
    'bp': 'hypertension',
    'sugar': 'diabetes',
    'dil': 'heart',
    'saans': 'breathing',
    'jigar': 'liver',
    'gurday': 'kidney',
    'gurdah': 'kidney',
    'pathon': 'muscle',
    'haddi': 'bone',
    'nind': 'sleep',
    'tashawish': 'anxiety',
    'ghabrahat': 'anxiety',
    'pet': 'stomach',
    'tezabiyat': 'acidity',
    'badhazmi': 'indigestion',
    'qabz': 'constipation',
    'dast': 'diarrhea',
    'ulti': 'vomiting',
    'matli': 'nausea',
    'jild': 'skin',
    'kharish': 'itching',
};

/**
 * Translate Roman Urdu health terms to English equivalents.
 */
function translateRomanUrdu(input) {
    if (!input) return input;
    let result = input.toLowerCase();
    for (const [urdu, english] of Object.entries(ROMAN_URDU_MAP)) {
        result = result.replace(new RegExp(`\\b${urdu}\\b`, 'gi'), english);
    }
    return result;
}

// ── Spacing normalisation ─────────────────────────────────────────────────────
/**
 * Split compound medicine names that are typed without spaces.
 *   "tagipmet" → "tagi met"
 *   "glucophagexr" → "glucophage xr"
 * Uses a simple approach: try splitting at known boundaries.
 */
function normalizeSpacing(input) {
    if (!input || input.length < 4) return input;
    const lower = input.toLowerCase().trim();

    // Try common suffixes that users might concatenate
    const suffixes = ['xr', 'sr', 'mr', 'cr', 'er', 'ir', 'ds', 'forte', 'plus', 'extra'];
    for (const suffix of suffixes) {
        if (lower.endsWith(suffix) && lower.length > suffix.length + 2) {
            const base = lower.slice(0, lower.length - suffix.length);
            return base + ' ' + suffix;
        }
    }

    // Try known prefix patterns (e.g. "tagi" + "met" → "tagi met")
    const knownPrefixes = [
        'tagi', 'gluco', 'sitag', 'meta', 'amox', 'clav', 'para', 'ibro', 'omep',
        'metf', 'gli', 'sitaglip', 'linaglip', 'amlo', 'bisop', 'atorva', 'rosuva'
    ];
    for (const prefix of knownPrefixes) {
        if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
            const rest = lower.slice(prefix.length);
            // Only split if the rest looks like a word (not a continuation)
            if (rest.length >= 2 && !prefix.endsWith(rest[0])) {
                return prefix + ' ' + rest;
            }
        }
    }

    return lower;
}

// ── Generic-name tokeniser (reuses medicationSafetyEngine logic) ──────────────
function tokenizeName(name) {
    return String(name || '')
        .toLowerCase()
        .split(/[+,/\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 1);
}

// ── Smart fuzzy search ────────────────────────────────────────────────────────
/**
 * Search a medicine list with fuzzy matching.
 *
 * @param {string} query - User input (may contain typos, OCR errors, Roman Urdu)
 * @param {Array} allMedicines - Full medicine directory from findAll()
 * @param {object} [options]
 * @param {number} [options.threshold=0.65] - Minimum similarity score to accept
 * @param {number} [options.limit=10] - Maximum results to return
 * @param {Array<string>} [options.conditionKeys] - Patient condition keys for context-aware boosting
 * @returns {Array<{medicine: object, score: number, matchType: string}>}
 */
function fuzzySearch(query, allMedicines, options = {}) {
    const { threshold = 0.65, limit = 10, conditionKeys = [] } = options;
    if (!query || !allMedicines || allMedicines.length === 0) return [];

    // Step 1: Normalize the input
    let normalized = query.trim().toLowerCase();
    normalized = translateRomanUrdu(normalized);
    normalized = correctOcrString(normalized).toLowerCase();
    normalized = normalizeSpacing(normalized);

    const queryTokens = tokenizeName(normalized);
    if (queryTokens.length === 0) return [];

    // Step 2: Score every medicine in the directory
    const scored = allMedicines.map((med) => {
        let bestScore = 0;
        let matchType = '';

        // Compare against brand name
        const brandLower = String(med.brandName || '').toLowerCase();
        const brandScore = similarity(normalized, brandLower);
        if (brandScore > bestScore) {
            bestScore = brandScore;
            matchType = 'brand';
        }

        // Exact prefix match (bonus)
        if (brandLower.startsWith(normalized) || normalized.startsWith(brandLower)) {
            bestScore = Math.max(bestScore, 0.92);
            matchType = 'brand-prefix';
        }

        // Compare against generic name (whole and tokens)
        const genericLower = String(med.genericName || '').toLowerCase();
        const genericScore = similarity(normalized, genericLower);
        if (genericScore > bestScore) {
            bestScore = genericScore;
            matchType = 'generic';
        }

        // Token-level matching against generic name tokens
        const genericTokens = tokenizeName(genericLower);
        for (const qt of queryTokens) {
            for (const gt of genericTokens) {
                const tokenScore = similarity(qt, gt);
                if (tokenScore > bestScore) {
                    bestScore = tokenScore;
                    matchType = 'ingredient-token';
                }
            }
        }

        // Category matching (for condition-aware search)
        const categoryLower = String(med.category || '').toLowerCase();
        for (const qt of queryTokens) {
            if (categoryLower.includes(qt) || qt.includes(categoryLower)) {
                bestScore = Math.max(bestScore, 0.7);
                matchType = matchType || 'category';
            }
        }

        // Condition-aware boost: if patient has conditions that match this medicine's category
        if (conditionKeys.length > 0) {
            const CONDITION_CATEGORY_BOOST = {
                'diabetes': ['antidiabetic', 'insulin'],
                'hypertension': ['beta blocker', 'ace inhibitor', 'arb', 'calcium channel blocker', 'diuretic'],
                'asthma': ['bronchodilator', 'corticosteroid', 'leukotriene modifier'],
                'heart disease': ['beta blocker', 'ace inhibitor', 'statin', 'antiplatelet', 'anticoagulant'],
                'kidney disease': ['diuretic', 'ace inhibitor', 'arb'],
                'liver disease': ['hepatoprotective'],
                'thyroid disease': ['thyroid hormone'],
                'mental health': ['antidepressant', 'anxiolytic', 'antipsychotic', 'mood stabilizer'],
            };
            for (const key of conditionKeys) {
                const boostCategories = CONDITION_CATEGORY_BOOST[key] || [];
                if (boostCategories.some(bc => categoryLower.includes(bc))) {
                    bestScore = Math.min(bestScore + 0.1, 1.0);
                    matchType = matchType + '+condition-boost';
                }
            }
        }

        return { medicine: med, score: bestScore, matchType };
    });

    // Step 3: Filter by threshold and sort
    return scored
        .filter((item) => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Quick best-match lookup (returns the single best match or null).
 * Used by the safety engine's resolveMedicine as a fuzzy fallback.
 */
function findBestMatch(query, allMedicines, options = {}) {
    const results = fuzzySearch(query, allMedicines, { ...options, limit: 1, threshold: 0.6 });
    return results[0] || null;
}

module.exports = {
    levenshtein,
    similarity,
    correctOcrTypo,
    correctOcrString,
    translateRomanUrdu,
    normalizeSpacing,
    fuzzySearch,
    findBestMatch,
    tokenizeName,
    COMMON_OCR_TYPOS,
};
