const { prepareAndGet, prepareAndAll } = require('../config/database');
const {
    Medicine, Interaction, Allergy, MedicalCondition, MedicineHistory,
    AllergenGroup, ConditionWarning, SafetyCheckLog
} = require('../models');
const { resolveAge, normalizeConditionKey, CHILD_AGE_LIMIT, ELDERLY_AGE_THRESHOLD } = require('./vaultSafetyService');
const { findBestMatch, correctOcrString, translateRomanUrdu, normalizeSpacing } = require('./medicineFuzzySearch');

const DISCLAIMER = 'This does not replace professional medical advice.';

// Split a medicine/ingredient name into comparable lowercase tokens
// ("Amoxicillin + Clavulanate" -> ["amoxicillin", "clavulanate"]).
function tokenizeIngredient(name) {
    return String(name || '')
        .toLowerCase()
        .split(/[+,/]/)
        .map(s => s.trim())
        .filter(s => s.length > 2);
}

/**
 * Resolve a candidate medicine against the national medicine directory.
 *
 * Resolution pipeline (most confident → least confident):
 *   1. Exact ID lookup
 *   2. Exact brand/generic name match
 *   3. Prefix match (brand/generic starts with query)
 *   4. OCR correction + normalisation retry
 *   5. Fuzzy matching with Levenshtein distance (threshold 0.65)
 *   6. Condition-aware fuzzy boost (uses patient conditions for context)
 *
 * Returns null only when the medicine truly cannot be identified.
 */
function resolveMedicine({ medicineId, medicineName }, options = {}) {
    const { conditionKeys = [] } = options;

    if (medicineId) {
        const byId = Medicine.findById(Number(medicineId));
        if (byId) return byId;
    }
    const query = String(medicineName || '').trim().toLowerCase();
    if (!query) return null;

    // Step 2: Exact match
    let med = prepareAndGet("SELECT * FROM medicines WHERE LOWER(brandName) = ?", [query]);
    if (!med) med = prepareAndGet("SELECT * FROM medicines WHERE LOWER(genericName) = ?", [query]);
    if (med) return med;

    // Step 3: Prefix match
    if (query.length >= 3) {
        med = prepareAndGet(
            `SELECT * FROM medicines
             WHERE LOWER(brandName) LIKE ? OR LOWER(genericName) LIKE ?
             ORDER BY brandName ASC LIMIT 1`,
            [`${query}%`, `${query}%`]
        );
        if (med) return med;
    }

    // Step 4: OCR correction + normalisation retry
    const corrected = correctOcrString(medicineName).toLowerCase().trim();
    const spaced = normalizeSpacing(corrected);
    if (corrected !== query) {
        med = prepareAndGet("SELECT * FROM medicines WHERE LOWER(brandName) = ?", [corrected]);
        if (!med) med = prepareAndGet("SELECT * FROM medicines WHERE LOWER(genericName) = ?", [corrected]);
        if (med) return med;
    }
    if (spaced !== corrected && spaced !== query) {
        med = prepareAndGet(
            `SELECT * FROM medicines
             WHERE LOWER(brandName) LIKE ? OR LOWER(genericName) LIKE ?
             ORDER BY brandName ASC LIMIT 1`,
            [`${spaced}%`, `${spaced}%`]
        );
        if (med) return med;
    }

    // Step 5: Fuzzy matching fallback (Levenshtein + ingredient tokens)
    const allMedicines = prepareAndAll("SELECT * FROM medicines", []);
    const fuzzyResult = findBestMatch(medicineName, allMedicines, {
        threshold: 0.6,
        conditionKeys
    });
    if (fuzzyResult && fuzzyResult.medicine) {
        return fuzzyResult.medicine;
    }

    return null;
}

// All comparable name tokens for a candidate medicine.
function candidateTokens(med) {
    const tokens = new Set();
    for (const source of [med.brandName, med.genericName, med.activeIngredient]) {
        for (const token of tokenizeIngredient(source)) {
            tokens.add(token);
        }
    }
    return tokens;
}

/**
 * Allergy check. Matching levels:
 *   1. exact / contained name match (candidate names vs recorded allergen)
 *   2. active-ingredient match via cross-reactive allergen groups
 *      (Penicillin allergy -> Amoxicillin / Augmentin alert)
 * Food and "other" allergy types are not used for medicine alerts.
 */
function checkAllergies(profile, allergies, med) {
    const alerts = [];
    if (!allergies.length || !med) return alerts;

    const names = [med.brandName, med.genericName].filter(Boolean).map(s => String(s).toLowerCase());
    const medTokens = candidateTokens(med);

    for (const allergy of allergies) {
        if (allergy.allergyType && allergy.allergyType !== 'medicine') continue;
        const allergen = String(allergy.allergen || '').trim();
        if (!allergen) continue;
        const allergenLower = allergen.toLowerCase();

        // 1. direct name match (either direction)
        let matchedBy = null;
        for (const name of names) {
            if (name === allergenLower || name.includes(allergenLower) || allergenLower.includes(name)) {
                matchedBy = 'direct name match';
                break;
            }
        }

        // 2. cross-reactive group matching on ingredients
        let groupInfo = null;
        if (!matchedBy) {
            const allergenTokens = new Set(tokenizeIngredient(allergen));
            const allergenMed = resolveMedicine({ medicineName: allergen });
            if (allergenMed) {
                for (const t of candidateTokens(allergenMed)) allergenTokens.add(t);
            }
            for (const token of allergenTokens) {
                const groups = AllergenGroup.findGroupsForMember(token);
                for (const group of groups) {
                    const members = AllergenGroup.findMembersOfGroup(group.groupName)
                        .map(m => String(m.memberName).toLowerCase());
                    const hit = [...medTokens].find(t => members.includes(t));
                    if (hit) {
                        matchedBy = `${hit} belongs to the ${group.groupName} family`;
                        groupInfo = group.groupName;
                        break;
                    }
                }
                if (matchedBy) break;
            }
        }

        if (matchedBy) {
            alerts.push({
                severity: allergy.severity === 'critical' ? 'critical' : 'high',
                title: 'ALLERGY ALERT',
                allergen: allergy.allergen,
                group: groupInfo,
                message: `${med.brandName} matches the recorded allergy "${allergy.allergen}" in this profile (${matchedBy}). Professional medical guidance is recommended before use.`
            });
        }
    }
    return alerts;
}

// Known drug-drug interactions between the candidate and current medicines.
function checkInteractions(med, currentMedications) {
    const alerts = [];
    if (!med || !med.genericName) return alerts;

    for (const current of currentMedications) {
        const interaction = prepareAndGet(`
            SELECT * FROM medicine_interactions
            WHERE (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))
               OR (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))
        `, [med.genericName, current.genericName, current.genericName, med.genericName]);

        if (interaction) {
            alerts.push({
                severity: String(interaction.severity || 'Moderate').toLowerCase(),
                title: 'INTERACTION ALERT',
                withMedicine: current.brandName,
                message: `${med.brandName} (${med.genericName}) may interact with ${current.brandName} (${current.genericName}): ${interaction.description || 'a potential interaction is documented.'} Discuss timing or alternatives with your healthcare provider.`
            });
        }
    }
    return alerts;
}

// Duplicate active ingredients (e.g. Panadol + Calpol both contain paracetamol).
function checkDuplicateIngredients(med, currentMedications) {
    const alerts = [];
    if (!med) return alerts;

    const medTokenSet = [...candidateTokens(med)];
    for (const current of currentMedications) {
        const currentTokens = tokenizeIngredient(current.genericName);
        const shared = medTokenSet.find(t => currentTokens.includes(t));
        if (shared) {
            alerts.push({
                severity: 'warning',
                title: 'DUPLICATE INGREDIENT ALERT',
                ingredient: shared,
                withMedicine: current.brandName,
                message: `${current.brandName} in this profile already contains "${shared}", the same active ingredient as ${med.brandName}. Taking both may exceed safe daily limits.`
            });
        }
    }
    return alerts;
}

// Condition-specific, pregnancy and age-related cautions from the verified
// condition_warnings rule table.
function checkConditionWarnings(profile, conditions, med, age) {
    const cautions = [];
    const pregnancyWarnings = [];
    const ageCautions = [];
    if (!med) return { cautions, pregnancyWarnings, ageCautions };

    const keys = new Set();
    for (const condition of conditions) {
        const key = normalizeConditionKey(condition.conditionName);
        if (key) keys.add(key);
    }

    const specialKeys = [];
    if (profile.pregnancyStatus === 'yes') specialKeys.push(['pregnancy', 'pregnancy']);
    if (profile.breastfeedingStatus === 'yes') specialKeys.push(['breastfeeding', 'breastfeeding']);
    if (age != null && age < CHILD_AGE_LIMIT) specialKeys.push(['child', 'age']);
    if (age != null && age >= ELDERLY_AGE_THRESHOLD) specialKeys.push(['elderly', 'age']);

    const medTokens = candidateTokens(med);
    const categoryLower = String(med.category || '').toLowerCase();

    const evaluateRule = (rule, bucket, kind) => {
        let matches = false;
        if (rule.matchType === 'category') {
            matches = categoryLower === String(rule.pattern).toLowerCase();
        } else if (rule.matchType === 'ingredient') {
            const patterns = String(rule.pattern).split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
            matches = [...medTokens].some(t => patterns.includes(t));
        }
        if (matches) {
            bucket.push({
                severity: rule.severity,
                title: kind === 'pregnancy' ? 'PREGNANCY CAUTION'
                    : kind === 'breastfeeding' ? 'BREASTFEEDING CAUTION'
                    : kind === 'age' ? 'AGE-RELATED CAUTION'
                    : 'CONDITION-SPECIFIC CAUTION',
                condition: rule.conditionKey,
                message: rule.message
            });
        }
    };

    for (const key of keys) {
        const rules = ConditionWarning.findByConditionKey(key);
        for (const rule of rules) evaluateRule(rule, cautions, 'condition');
    }
    for (const [key, kind] of specialKeys) {
        const rules = ConditionWarning.findByConditionKey(key);
        // Pregnancy and breastfeeding cautions are both surfaced through the
        // pregnancyWarnings bucket (the title distinguishes them).
        for (const rule of rules) {
            if (kind === 'age') {
                evaluateRule(rule, ageCautions, kind);
            } else {
                evaluateRule(rule, pregnancyWarnings, kind);
            }
        }
    }

    return { cautions, pregnancyWarnings, ageCautions };
}

/**
 * Full deterministic safety check of one medicine against one vault profile.
 * Returns the structured result defined by the Family Safety Vault spec —
 * including overallRisk: LOW | MODERATE | HIGH | UNKNOWN.
 * UNKNOWN is mandatory when the medicine cannot be confidently identified.
 */
function checkMedicineSafety(profile, { medicineId = null, medicineName = null }, options = {}) {
    const userId = options.userId;
    const allergies = Allergy.findByFamilyMember(profile.id);
    const currentMedications = MedicineHistory.findByFamilyMember(profile.id, true)
        .map(m => ({
            ...m,
            brandName: m.brandName || m.medicineName || 'Unknown medicine',
            genericName: m.genericName || m.activeIngredient || m.medicineName || 'Unknown'
        }));
    const conditions = MedicalCondition.findByFamilyMember(profile.id, true);
    const age = resolveAge(profile);

    // Build condition keys for condition-aware fuzzy matching
    const conditionKeys = conditions.map(c => normalizeConditionKey(c.conditionName)).filter(Boolean);

    const med = resolveMedicine({ medicineId, medicineName }, { conditionKeys });
    const identified = Boolean(med);
    const checkedName = med ? med.brandName : String(medicineName || '').trim();

    const result = {
        profileId: profile.id,
        profileName: profile.name,
        medicine: identified
            ? {
                id: med.id,
                name: med.brandName,
                genericName: med.genericName,
                category: med.category,
                manufacturer: med.manufacturer,
                drapRegNumber: med.drapRegNumber,
                recallStatus: med.recallStatus
            }
            : { id: null, name: checkedName, genericName: null, category: null, recallStatus: null },
        identified,
        allergyAlerts: [],
        interactionAlerts: [],
        duplicateIngredientAlerts: [],
        conditionWarnings: [],
        pregnancyWarnings: [],
        ageRelatedCautions: [],
        otherSafetyInfo: [],
        checksCompleted: [],
        linkedConditions: [],
        overallRisk: 'UNKNOWN',
        message: '',
        disclaimer: DISCLAIMER
    };

    if (!identified) {
        // Never invent information: report clearly and check only the exact
        // recorded-allergen name against what the user typed.
        result.allergyAlerts = checkAllergies(profile, allergies, {
            brandName: checkedName,
            genericName: null,
            activeIngredient: null
        });
        result.message = 'We couldn\'t verify this medicine against the available safety information. Please verify the name/active ingredient.';
        result.overallRisk = result.allergyAlerts.length > 0 ? 'HIGH' : 'UNKNOWN';
    } else {
        result.allergyAlerts = checkAllergies(profile, allergies, med);
        result.interactionAlerts = checkInteractions(med, currentMedications);
        result.duplicateIngredientAlerts = checkDuplicateIngredients(med, currentMedications);

        const { cautions, pregnancyWarnings, ageCautions } = checkConditionWarnings(profile, conditions, med, age);
        result.conditionWarnings = cautions;
        result.pregnancyWarnings = pregnancyWarnings;
        result.ageRelatedCautions = ageCautions;

        // Track which safety checks were completed (for UI transparency)
        result.checksCompleted = [
            'Medicine Identified',
            `${med.category || 'Medicine'} classified`,
            'Drug-Drug Interaction Check',
            'Duplicate Ingredient Check',
            'Allergy Conflict Check',
            'Condition Contraindication Check',
            'Pregnancy Risk Check',
            'Age-Related Caution Check',
            'DRAP Recall Status'
        ];

        // Link detected conditions to the medicine category
        if (conditionKeys.length > 0 && med.category) {
            const CONDITION_CATEGORY_MAP = {
                'diabetes': ['antidiabetic', 'insulin'],
                'hypertension': ['beta blocker', 'ace inhibitor', 'arb', 'calcium channel blocker', 'diuretic', 'vasodilator'],
                'asthma': ['bronchodilator', 'corticosteroid', 'leukotriene'],
                'heart disease': ['beta blocker', 'ace inhibitor', 'statin', 'antiplatelet', 'anticoagulant', 'nitrate', 'arni'],
                'kidney disease': ['diuretic', 'ace inhibitor', 'arb', 'phosphate binder'],
                'liver disease': ['hepatoprotective'],
                'thyroid disease': ['thyroid hormone', 'antithyroid'],
            };
            const catLower = med.category.toLowerCase();
            for (const key of conditionKeys) {
                const boostCats = CONDITION_CATEGORY_MAP[key] || [];
                if (boostCats.some(bc => catLower.includes(bc))) {
                    result.linkedConditions.push({
                        condition: key,
                        relevance: `Medicine category (${med.category}) is commonly used for ${key}`
                    });
                }
            }
        }

        if (med.recallStatus === 1) {
            result.otherSafetyInfo.push({
                severity: 'critical',
                title: 'DRAP RECALL NOTICE',
                message: `${med.brandName} is currently subject to a DRAP safety recall. Do not use it — ask your pharmacist or doctor about a replacement.`
            });
        }
        if (currentMedications.length >= 5) {
            result.otherSafetyInfo.push({
                severity: 'info',
                title: 'OTHER SAFETY INFORMATION',
                message: `This profile already has ${currentMedications.length} current medicines recorded. A pharmacist or doctor medication review is recommended.`
            });
        }

        // Never assume safety when reliable profile data is unavailable: a
        // profile with no core safety data cannot conclude LOW risk. However,
        // verified cautions that DID fire (e.g. a recorded pregnancy matched
        // against a tetracycline rule) must drive the risk on their own
        // severity instead of being buried under UNKNOWN.
        const hasCoreData = allergies.length > 0 || conditions.length > 0 || currentMedications.length > 0;
        if (!hasCoreData) {
            result.otherSafetyInfo.push({
                severity: 'info',
                title: 'OTHER SAFETY INFORMATION',
                message: 'This profile has no allergies, health conditions or current medicines recorded yet, so only the medicine directory data could be checked. Add safety information in the Family Safety Vault for a personalised check.'
            });
        }

        const hasRealAlerts = result.allergyAlerts.length > 0
            || result.interactionAlerts.length > 0
            || result.duplicateIngredientAlerts.length > 0
            || result.conditionWarnings.length > 0
            || result.pregnancyWarnings.length > 0
            || result.ageRelatedCautions.length > 0
            || result.otherSafetyInfo.some(a => a.severity === 'critical');

        if (!hasCoreData && !hasRealAlerts) {
            result.overallRisk = 'UNKNOWN';
            result.message = 'Only limited information is available for this profile, so safety could not be fully assessed.';
        } else {
            const hasHigh = result.allergyAlerts.length > 0
                || result.interactionAlerts.some(a => ['severe', 'critical', 'high'].includes(a.severity))
                || result.otherSafetyInfo.some(a => a.severity === 'critical')
                || result.conditionWarnings.some(a => a.severity === 'critical')
                || result.pregnancyWarnings.some(a => a.severity === 'critical')
                || result.ageRelatedCautions.some(a => a.severity === 'critical');
            const hasModerate = result.interactionAlerts.length > 0
                || result.duplicateIngredientAlerts.length > 0
                || result.conditionWarnings.length > 0
                || result.pregnancyWarnings.length > 0
                || result.ageRelatedCautions.length > 0;

            result.overallRisk = hasHigh ? 'HIGH' : (hasModerate ? 'MODERATE' : 'LOW');
            result.message = result.overallRisk === 'LOW'
                ? 'No major safety concern identified from the available profile information.'
                : 'Safety information was identified for this profile — review the findings below.';
        }
    }

    // Audit trail for safety-critical checks (which profile, which medicine,
    // which rules triggered — no unnecessary medical content).
    if (options.log !== false && userId) {
        try {
            const rules = [];
            if (result.allergyAlerts.length) rules.push('allergy');
            if (result.interactionAlerts.length) rules.push('interaction');
            if (result.duplicateIngredientAlerts.length) rules.push('duplicate_ingredient');
            if (result.conditionWarnings.length) rules.push('condition_warning');
            if (result.pregnancyWarnings.length) rules.push('pregnancy_warning');
            if (result.ageRelatedCautions.length) rules.push('age_caution');
            if (result.otherSafetyInfo.length) rules.push('other_info');
            SafetyCheckLog.create({
                userId,
                familyMemberId: profile.id,
                medicineName: checkedName,
                medicineId: med ? med.id : null,
                overallRisk: result.overallRisk,
                rulesTriggered: rules
            });
        } catch (logErr) {
            // Audit failure must never break a safety check response
            console.error('[Vault] safety check log failed:', logErr.message);
        }
    }

    return result;
}

module.exports = {
    resolveMedicine,
    tokenizeIngredient,
    checkMedicineSafety,
    DISCLAIMER
};
