const { FamilyMember, Allergy, MedicalCondition, MedicineHistory } = require('../models');

// Canonical condition keys used by the deterministic safety engines.
// Free-text conditions are mapped onto these keys by keyword matching.
const CONDITION_KEY_MAP = [
    { match: ['kidney', 'renal'], key: 'kidney disease', label: 'KIDNEY SAFETY CONSIDERATION' },
    { match: ['liver', 'hepatic'], key: 'liver disease', label: 'LIVER SAFETY CONSIDERATION' },
    { match: ['asthma'], key: 'asthma', label: 'ASTHMA SAFETY CONSIDERATION' },
    { match: ['diabet'], key: 'diabetes', label: 'DIABETES SAFETY CONSIDERATION' },
    { match: ['hypertension', 'blood pressure'], key: 'hypertension', label: 'HYPERTENSION SAFETY CONSIDERATION' },
    { match: ['heart', 'cardiac'], key: 'heart disease', label: 'HEART SAFETY CONSIDERATION' },
    { match: ['gastric ulcer', 'peptic ulcer', 'stomach ulcer'], key: 'gastric ulcer', label: 'GASTRIC SAFETY CONSIDERATION' },
    { match: ['thyroid'], key: 'thyroid disease', label: 'THYROID SAFETY CONSIDERATION' }
];

const CHILD_AGE_LIMIT = 12;
const ELDERLY_AGE_THRESHOLD = 65;

// Derive age from dateOfBirth (preferred) or the stored age field.
function resolveAge(profile) {
    if (profile && profile.dateOfBirth) {
        const dob = new Date(profile.dateOfBirth);
        if (!isNaN(dob.getTime())) {
            const now = new Date();
            let age = now.getFullYear() - dob.getFullYear();
            const monthDiff = now.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
                age--;
            }
            if (age >= 0 && age < 130) return age;
        }
    }
    if (profile && profile.age != null && profile.age !== '') {
        const age = Number(profile.age);
        if (!isNaN(age) && age >= 0 && age < 130) return age;
    }
    return null;
}

// Map a free-text condition name to a canonical condition key, or null.
function normalizeConditionKey(conditionName) {
    const lower = String(conditionName || '').toLowerCase();
    for (const entry of CONDITION_KEY_MAP) {
        if (entry.match.some(m => lower.includes(m))) {
            return entry.key;
        }
    }
    return null;
}

// Verify the authenticated user owns the requested family profile.
// Returns the profile or throws a 404-style error (a missing profile and a
// foreign profile are indistinguishable so IDs cannot be probed).
function assertProfileOwnership(userId, profileId) {
    const profile = FamilyMember.findById(Number(profileId));
    if (!profile || String(profile.userId) !== String(userId)) {
        const err = new Error('Family profile not found.');
        err.statusCode = 404;
        throw err;
    }
    return profile;
}

// Automatically derive safety flags from stored profile information.
// Flags describe the safety factor — they never diagnose or label the person.
function deriveSafetyFlags(profile, allergies, medications, conditions, age) {
    const flags = [];

    for (const allergy of allergies) {
        // Food/other allergies are listed but are not medication-safety flags
        if (!allergy.allergyType || allergy.allergyType === 'medicine') {
            flags.push({
                type: 'allergy',
                severity: allergy.severity === 'critical' ? 'critical' : 'high',
                label: `${String(allergy.allergen).toUpperCase()} ALLERGY`
            });
        }
    }

    for (const condition of conditions) {
        const mapped = normalizeConditionKey(condition.conditionName);
        flags.push({
            type: 'condition',
            severity: 'medium',
            label: mapped ? (CONDITION_KEY_MAP.find(c => c.key === mapped)).label
                          : `${String(condition.conditionName).toUpperCase()} — RECORDED CONDITION`
        });
    }

    if (profile.pregnancyStatus === 'yes') {
        flags.push({ type: 'special', severity: 'high', label: 'PREGNANCY SAFETY CONSIDERATION' });
    }
    if (profile.breastfeedingStatus === 'yes') {
        flags.push({ type: 'special', severity: 'high', label: 'BREASTFEEDING SAFETY CONSIDERATION' });
    }
    if (age != null && age < CHILD_AGE_LIMIT) {
        flags.push({ type: 'special', severity: 'medium', label: 'PEDIATRIC SAFETY CONSIDERATION' });
    }
    if (age != null && age >= ELDERLY_AGE_THRESHOLD) {
        flags.push({ type: 'special', severity: 'medium', label: 'ELDERLY SAFETY CONSIDERATION' });
    }
    if (medications.length >= 2) {
        flags.push({ type: 'review', severity: 'medium', label: 'MEDICATION INTERACTION REVIEW' });
    }

    return flags;
}

// Full safety overview for one profile: identity, safety snapshot,
// detailed lists, special considerations, emergency info and flags.
function getProfileOverview(profileId) {
    const profile = FamilyMember.findById(profileId);
    if (!profile) return null;

    const age = resolveAge(profile);
    const allergies = Allergy.findByFamilyMember(profile.id);
    const medications = MedicineHistory.findByFamilyMember(profile.id, true);
    const conditions = MedicalCondition.findByFamilyMember(profile.id, true);
    const flags = deriveSafetyFlags(profile, allergies, medications, conditions, age);

    const specialConsiderations = [];
    if (profile.pregnancyStatus === 'yes') specialConsiderations.push({ label: 'Pregnancy', detail: 'Pregnant — medication checks include pregnancy safety information.' });
    if (profile.breastfeedingStatus === 'yes') specialConsiderations.push({ label: 'Breastfeeding', detail: 'Breastfeeding — medication checks include breastfeeding safety information.' });
    if (age != null && age < CHILD_AGE_LIMIT) specialConsiderations.push({ label: 'Child', detail: `Age ${age} — pediatric medication cautions apply.` });
    if (age != null && age >= ELDERLY_AGE_THRESHOLD) specialConsiderations.push({ label: 'Elderly', detail: `Age ${age} — age-related medication cautions apply.` });

    return {
        profile: {
            ...profile,
            resolvedAge: age
        },
        allergies,
        medications,
        conditions,
        specialConsiderations,
        snapshot: {
            allergyCount: allergies.length,
            medicationCount: medications.length,
            conditionCount: conditions.length,
            specialConsiderationCount: specialConsiderations.length
        },
        flags,
        lastUpdated: profile.updatedAt || profile.createdAt
    };
}

// Lightweight summaries for the vault grid (one card per family member).
function getProfilesWithSummary(userId) {
    const members = FamilyMember.findByUserId(userId);
    return members.map(member => {
        const age = resolveAge(member);
        const allergies = Allergy.findByFamilyMember(member.id);
        const medications = MedicineHistory.findByFamilyMember(member.id, true);
        const conditions = MedicalCondition.findByFamilyMember(member.id, true);
        const flags = deriveSafetyFlags(member, allergies, medications, conditions, age);
        return {
            id: member.id,
            name: member.name,
            relation: member.relation,
            age,
            dateOfBirth: member.dateOfBirth,
            sex: member.sex,
            pregnancyStatus: member.pregnancyStatus,
            breastfeedingStatus: member.breastfeedingStatus,
            snapshot: {
                allergyCount: allergies.length,
                medicationCount: medications.length,
                conditionCount: conditions.length
            },
            topFlags: flags.filter(f => f.type === 'allergy' || f.type === 'special').slice(0, 2),
            flagCount: flags.length,
            lastUpdated: member.updatedAt || member.createdAt
        };
    });
}

module.exports = {
    resolveAge,
    normalizeConditionKey,
    assertProfileOwnership,
    deriveSafetyFlags,
    getProfileOverview,
    getProfilesWithSummary,
    CONDITION_KEY_MAP,
    CHILD_AGE_LIMIT,
    ELDERLY_AGE_THRESHOLD
};
