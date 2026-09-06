const { Medicine, Interaction } = require('../models');

exports.getAllMedicines = (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 500;
        const meds = Medicine.findAll(limit);
        res.json(meds);
    } catch(err) {
        next(err);
    }
};

exports.searchMedicines = (req, res, next) => {
    try {
        const q = req.query.q || '';
        // Use smart search that combines SQL LIKE + fuzzy fallback
        const smartResult = Medicine.smartSearch(q, { limit: 12 });
        // Merge SQL results and fuzzy suggestions into one array
        const merged = [
            ...smartResult.results,
            ...smartResult.fuzzySuggestions
        ].slice(0, 20);
        res.json(merged);
    } catch(err) {
        next(err);
    }
};
exports.getMedicine = (req, res, next) => {
    try {
        const med = Medicine.findById(req.params.id);
        if (!med) {
            // Try fuzzy match before giving up
            const allMeds = Medicine.findAll();
            const { findBestMatch } = require('../services/medicineFuzzySearch');
            const fuzzyResult = findBestMatch(req.params.id, allMeds, { threshold: 0.6 });
            if (fuzzyResult) {
                return res.json({
                    ...fuzzyResult.medicine,
                    _fuzzyMatch: true,
                    _matchType: fuzzyResult.matchType,
                    _score: fuzzyResult.score
                });
            }
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.json(med);
    } catch(err) {
        next(err);
    }
};

exports.getInteractions = (req, res, next) => {
    try {
        const med = Medicine.findById(req.params.id);
        if (!med) return res.status(404).json({ message: "Medicine not found" });

        const interactions = Interaction.findByGeneric(med.genericName);
        res.json(interactions);
    } catch(err) {
        next(err);
    }
};

exports.getRecalled = (req, res, next) => {
    try {
        const meds = Medicine.findRecalls();
        res.json(meds);
    } catch(err) {
        next(err);
    }
};

exports.compareMedicines = (req, res, next) => {
    try {
        const { id1, id2 } = req.params;
        const med1 = Medicine.findById(id1);
        const med2 = Medicine.findById(id2);

        if (!med1 || !med2) {
            return res.status(404).json({ success: false, message: 'One or both medicines not found' });
        }

        const interactions = Interaction.findInteractions(med1.genericName, med2.genericName);
        const isSameGeneric = med1.genericName.toLowerCase() === med2.genericName.toLowerCase();

        res.json({
            medicine1: med1,
            medicine2: med2,
            isDuplicateGeneric: isSameGeneric,
            hasInteraction: interactions.length > 0,
            interactions,
            safetyStatus: isSameGeneric ? 'warning_duplicate' : (interactions.length > 0 ? 'warning_interaction' : 'compatible')
        });
    } catch(err) {
        next(err);
    }
};
