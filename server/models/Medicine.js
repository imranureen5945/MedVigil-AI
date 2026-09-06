const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');
const { fuzzySearch, findBestMatch, correctOcrString } = require('../services/medicineFuzzySearch');

const Medicine = {
    findById(id) {
        return prepareAndGet("SELECT * FROM medicines WHERE id = ?", [id]);
    },
    findByDrapNumber(drapRegNumber) {
        return prepareAndGet("SELECT * FROM medicines WHERE drapRegNumber = ?", [drapRegNumber]);
    },
    findAll(limit = 500) {
        return prepareAndAll("SELECT * FROM medicines LIMIT ?", [limit]);
    },
    search(query) {
        const pattern = `%${query}%`;
        return prepareAndAll(
            "SELECT * FROM medicines WHERE brandName LIKE ? OR genericName LIKE ? OR category LIKE ? ORDER BY brandName ASC LIMIT 50",
            [pattern, pattern, pattern]
        );
    },
    findRecalls() {
        return prepareAndAll("SELECT * FROM medicines WHERE recallStatus = 1");
    },
    /**
     * Smart search: combines SQL LIKE matching with fuzzy fallback.
     * Returns { results: Array, fuzzySuggestions: Array, hasExact: boolean }.
     *
     * The SQL LIKE search handles exact/prefix matches (fast path).
     * If the SQL search returns few or no results, the fuzzy engine
     * kicks in with OCR correction, alternate spelling, Roman Urdu,
     * and Levenshtein distance matching.
     */
    smartSearch(query, options = {}) {
        const { conditionKeys = [], limit = 10 } = options;
        const trimmed = String(query || '').trim();
        if (!trimmed) return { results: [], fuzzySuggestions: [], hasExact: false };

        // Step 1: Fast SQL LIKE search
        const pattern = `%${trimmed}%`;
        const sqlResults = prepareAndAll(
            `SELECT * FROM medicines
             WHERE LOWER(brandName) LIKE LOWER(?)
                OR LOWER(genericName) LIKE LOWER(?)
                OR LOWER(category) LIKE LOWER(?)
             ORDER BY brandName ASC LIMIT 50`,
            [pattern, pattern, pattern]
        );

        const hasExact = sqlResults.length > 0;

        // Step 2: If SQL found plenty of results, return them directly
        if (sqlResults.length >= 5) {
            return { results: sqlResults.slice(0, limit), fuzzySuggestions: [], hasExact: true };
        }

        // Step 3: Fuzzy fallback — load full directory for scoring
        const allMedicines = prepareAndAll("SELECT * FROM medicines", []);
        const fuzzyResults = fuzzySearch(trimmed, allMedicines, {
            threshold: 0.55,
            limit: 10,
            conditionKeys
        });

        // Merge: SQL results first (they're more confident), then fuzzy suggestions
        const sqlIds = new Set(sqlResults.map(m => m.id));
        const fuzzySuggestions = fuzzyResults
            .filter(fr => !sqlIds.has(fr.medicine.id))
            .map(fr => ({
                ...fr.medicine,
                _fuzzyScore: fr.score,
                _matchType: fr.matchType
            }));

        return {
            results: sqlResults.slice(0, limit),
            fuzzySuggestions,
            hasExact
        };
    }
};

module.exports = Medicine;
