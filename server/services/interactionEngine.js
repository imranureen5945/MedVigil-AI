const { prepareAndAll, prepareAndGet } = require('../config/database');
const { Allergy, MedicalCondition } = require('../models');

// Disease-contraindication mapping for safety checks
const CONTRAINDICATION_RULES = [
    { condition: 'asthma', category: 'NSAID', penalty: 15, severity: 'warning', message: 'NSAIDs like Ibuprofen/Aspirin can trigger bronchospasm in patients with asthma.' },
    { condition: 'asthma', genericPattern: 'propranolol|atenolol|timolol', penalty: 18, severity: 'critical', message: 'Non-selective beta-blockers can cause severe bronchoconstriction in asthma.' },
    { condition: 'gastric ulcer', category: 'NSAID', penalty: 15, severity: 'warning', message: 'NSAIDs can worsen gastric mucosal irritation and increase bleeding risk.' },
    { condition: 'hypertension', category: 'NSAID', penalty: 10, severity: 'caution', message: 'Prolonged NSAID use may elevate blood pressure or interfere with anti-hypertensives.' },
    { condition: 'kidney', category: 'NSAID', penalty: 18, severity: 'critical', message: 'NSAIDs reduce renal blood flow and should be avoided in renal impairment.' },
    { condition: 'diabetes', genericPattern: 'prednisolone|dexamethasone|hydrocortisone', penalty: 15, severity: 'warning', message: 'Systemic corticosteroids can significantly elevate blood glucose levels.' },
    { condition: 'liver', genericPattern: 'paracetamol|acetaminophen', penalty: 15, severity: 'warning', message: 'Use paracetamol with caution in hepatic impairment. Do not exceed 2g daily.' },
    { condition: 'pregnancy', category: 'NSAID', penalty: 20, severity: 'critical', message: 'NSAIDs are contraindicated in the third trimester of pregnancy.' },
    { condition: 'pregnancy', category: 'Antibiotic', genericPattern: 'doxycycline|ciprofloxacin|levofloxacin', penalty: 20, severity: 'critical', message: 'Fluoroquinolones & Tetracyclines should be avoided during pregnancy.' }
];

// Fetch active profile medications including custom entries that are not in
// the national medicine directory (LEFT JOIN). Rows are normalized so callers
// always see brandName/genericName/category/recallStatus.
function getActiveMedications(familyMemberId) {
    const rows = prepareAndAll(`
        SELECT mh.id as historyId, mh.dosageNotes, mh.medicineName, mh.activeIngredient,
               m.id as medicineId, m.brandName, m.genericName, m.manufacturer,
               m.drapRegNumber, m.category, m.recallStatus
        FROM medicine_history mh
        LEFT JOIN medicines m ON mh.medicineId = m.id
        WHERE mh.familyMemberId = ? AND mh.isActive = 1
    `, [familyMemberId]);

    return rows.map(r => ({
        ...r,
        brandName: r.brandName || r.medicineName || 'Unknown medicine',
        genericName: r.genericName || r.activeIngredient || r.medicineName || 'Unknown',
        category: r.category || null,
        recallStatus: r.recallStatus == null ? 0 : r.recallStatus
    }));
}

exports.getActiveMedications = getActiveMedications;

exports.calculateSafetyScore = (familyMemberId) => {
    let score = 100;
    const breakdown = [];
    const alerts = [];
    const structuredAlerts = [];

    // 1. Fetch active medicines (includes custom entries)
    const activeMeds = getActiveMedications(familyMemberId);

    // 2. Fetch allergies & medical conditions
    const allergies = Allergy.findByFamilyMember(familyMemberId);
    const conditions = MedicalCondition.findByFamilyMember(familyMemberId, true);

    const genericNames = activeMeds.map(m => m.genericName);

    // 3. Check DRAP Recalls
    for (let med of activeMeds) {
        if (med.recallStatus === 1) {
            score -= 20;
            breakdown.push({ factor: `Recalled Medicine: ${med.brandName}`, penalty: -20 });
            alerts.push(`CRITICAL: ${med.brandName} (${med.genericName}) has been recalled by DRAP.`);
            structuredAlerts.push({
                type: 'recall',
                severity: 'critical',
                title: `DRAP Recall: ${med.brandName}`,
                message: `${med.brandName} is subject to a DRAP recall alert. Discontinue and consult your physician.`,
                recommendation: 'Stop taking this medication immediately and contact your doctor for an alternative.'
            });
        }
    }

    // 4. Check Drug-Drug Interactions
    for (let i = 0; i < genericNames.length; i++) {
        for (let j = i + 1; j < genericNames.length; j++) {
            const g1 = genericNames[i];
            const g2 = genericNames[j];
            const interaction = prepareAndGet(`
                SELECT * FROM medicine_interactions 
                WHERE (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?)) 
                   OR (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))
            `, [g1, g2, g2, g1]);
            
            if (interaction) {
                const penalty = interaction.severity === 'critical' ? 20 : (interaction.severity === 'moderate' ? 12 : 8);
                score -= penalty;
                breakdown.push({ factor: `Interaction: ${g1} + ${g2}`, penalty: -penalty });
                alerts.push(`WARNING: Potential interaction between ${g1} and ${g2}: ${interaction.description}`);
                structuredAlerts.push({
                    type: 'interaction',
                    severity: interaction.severity || 'warning',
                    title: `Drug Interaction: ${g1} + ${g2}`,
                    message: interaction.description || `Potential adverse interaction detected between ${g1} and ${g2}.`,
                    recommendation: 'Discuss dose spacing or alternative agents with your healthcare provider.'
                });
            }
        }
    }

    // 5. Check Duplicate Ingredients
    const genericCounts = {};
    activeMeds.forEach(m => {
        const key = m.genericName.toLowerCase().trim();
        genericCounts[key] = (genericCounts[key] || []);
        genericCounts[key].push(m.brandName);
    });

    for (const [generic, brands] of Object.entries(genericCounts)) {
        if (brands.length > 1) {
            score -= 15;
            breakdown.push({ factor: `Duplicate Ingredient: ${generic} in (${brands.join(', ')})`, penalty: -15 });
            alerts.push(`WARNING: Duplicate active ingredient '${generic}' found in ${brands.join(' & ')}. Risk of accidental overdose.`);
            structuredAlerts.push({
                type: 'duplicate',
                severity: 'warning',
                title: `Duplicate Ingredient: ${generic}`,
                message: `You are currently taking multiple products containing ${generic} (${brands.join(', ')}).`,
                recommendation: 'Ensure you do not exceed the maximum daily therapeutic dose.'
            });
        }
    }

    // 6. Check Allergies
    for (let allergy of allergies) {
        const allergenLower = allergy.allergen.toLowerCase();
        for (let med of activeMeds) {
            if (med.genericName.toLowerCase().includes(allergenLower) || med.brandName.toLowerCase().includes(allergenLower)) {
                score -= 25;
                breakdown.push({ factor: `Allergy Conflict: ${allergy.allergen} with ${med.brandName}`, penalty: -25 });
                alerts.push(`CRITICAL: Known allergy to ${allergy.allergen} conflicts with active prescription ${med.brandName}!`);
                structuredAlerts.push({
                    type: 'allergy',
                    severity: 'critical',
                    title: `Allergy Conflict: ${allergy.allergen}`,
                    message: `Patient has documented allergy to ${allergy.allergen}, which matches ${med.brandName} (${med.genericName}).`,
                    recommendation: 'Immediately hold this medicine and alert your physician.'
                });
            }
        }
    }

    // 7. Check Condition Contraindications
    for (let cond of conditions) {
        const condLower = cond.conditionName.toLowerCase();
        for (let rule of CONTRAINDICATION_RULES) {
            if (condLower.includes(rule.condition)) {
                for (let med of activeMeds) {
                    const matchCategory = rule.category && med.category === rule.category;
                    const matchGeneric = rule.genericPattern && new RegExp(rule.genericPattern, 'i').test(med.genericName);
                    if (matchCategory || matchGeneric) {
                        score -= rule.penalty;
                        breakdown.push({ factor: `Precaution: ${cond.conditionName} vs ${med.brandName}`, penalty: -rule.penalty });
                        alerts.push(`CAUTION: ${med.brandName} requires precaution with ${cond.conditionName}. ${rule.message}`);
                        structuredAlerts.push({
                            type: 'condition',
                            severity: rule.severity,
                            title: `Precaution: ${cond.conditionName}`,
                            message: rule.message,
                            recommendation: 'Monitor symptoms closely and check with your prescribing doctor.'
                        });
                    }
                }
            }
        }
    }

    // 8. Multiple Antibiotic Check
    const antibiotics = activeMeds.filter(m => m.category === 'Antibiotic');
    if (antibiotics.length > 1) {
        score -= 12;
        breakdown.push({ factor: "Multiple Concurrent Antibiotics", penalty: -12 });
        alerts.push("WARNING: Taking multiple antibiotics concurrently. Risk of antimicrobial resistance (AMR) and gut microbiome disruption.");
        structuredAlerts.push({
            type: 'amr',
            severity: 'warning',
            title: 'Multiple Antibiotic Therapy',
            message: `Active antibiotics: ${antibiotics.map(a => a.brandName).join(', ')}. Multiple antibiotic usage increases AMR risk.`,
            recommendation: 'Verify with your physician that combined antibiotic therapy is intentional.'
        });
    }

    score = Math.max(0, Math.min(100, score));
    
    let riskLevel = 'safe';
    if (score < 50) riskLevel = 'critical';
    else if (score < 80) riskLevel = 'moderate';

    return { 
        score, 
        breakdown, 
        alerts, 
        structuredAlerts,
        riskLevel,
        activeMedicationCount: activeMeds.length,
        allergyCount: allergies.length,
        conditionCount: conditions.length
    };
};

exports.checkSingleMedicineSafety = (familyMemberId, medicine) => {
    const activeMeds = getActiveMedications(familyMemberId);

    const warnings = [];

    if (medicine.recallStatus === 1) {
        warnings.push({
            severity: 'critical',
            title: 'DRAP Recall Alert',
            message: `${medicine.brandName} is currently recalled by the Drug Regulatory Authority of Pakistan.`
        });
    }

    for (let active of activeMeds) {
        if (active.genericName.toLowerCase() === medicine.genericName.toLowerCase()) {
            warnings.push({
                severity: 'warning',
                title: 'Duplicate Active Ingredient',
                message: `You are already taking ${active.brandName} which also contains ${medicine.genericName}.`
            });
        }

        const interaction = prepareAndGet(`
            SELECT * FROM medicine_interactions 
            WHERE (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?)) 
               OR (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))
        `, [active.genericName, medicine.genericName, medicine.genericName, active.genericName]);

        if (interaction) {
            warnings.push({
                severity: interaction.severity || 'warning',
                title: `Interaction with ${active.brandName}`,
                message: interaction.description
            });
        }
    }

    return {
        safe: warnings.length === 0,
        warnings,
        status: warnings.some(w => w.severity === 'critical') ? 'critical' : (warnings.length > 0 ? 'caution' : 'safe')
    };
};
