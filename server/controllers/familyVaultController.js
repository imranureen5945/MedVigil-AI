const {
    FamilyMember, Allergy, MedicalCondition, MedicineHistory, Medicine, SafetyAlert, SafetyCheckLog
} = require('../models');
const auditService = require('../services/auditService');
const vaultSafetyService = require('../services/vaultSafetyService');
const medicationSafetyEngine = require('../services/medicationSafetyEngine');

const VALID_SEX = ['male', 'female', 'other'];
const VALID_STATUS = ['yes', 'no', 'not_applicable', 'unknown'];
const VALID_SEVERITIES = ['low', 'moderate', 'high', 'critical'];
const VALID_ALLERGY_TYPES = ['medicine', 'food', 'other'];

// ---------- validation helpers ----------

function validationError(res, message) {
    return res.status(400).json({ success: false, message });
}

function parseBasicProfileBody(body) {
    const errors = [];

    const name = String(body.name || '').trim();
    if (name.length < 2 || name.length > 100) {
        errors.push('Profile name must be between 2 and 100 characters.');
    }

    const relation = String(body.relation || '').trim();
    if (!relation || relation.length > 50) {
        errors.push('Relationship is required.');
    }

    let age = null;
    if (body.age !== undefined && body.age !== null && body.age !== '') {
        age = Number(body.age);
        if (isNaN(age) || age < 0 || age > 120) {
            errors.push('Age must be a number between 0 and 120.');
        }
    }

    let dateOfBirth = null;
    if (body.dateOfBirth !== undefined && body.dateOfBirth !== null && String(body.dateOfBirth).trim() !== '') {
        dateOfBirth = String(body.dateOfBirth).trim();
        const parsed = new Date(dateOfBirth);
        if (isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
            errors.push('Date of birth must be a valid date in the past.');
            dateOfBirth = null;
        } else if (age === null) {
            // Keep the legacy age field in sync when only DOB is provided
            age = vaultSafetyService.resolveAge({ dateOfBirth, age: null });
        }
    }

    let sex = null;
    if (body.sex !== undefined && body.sex !== null && String(body.sex).trim() !== '') {
        sex = String(body.sex).trim().toLowerCase();
        if (!VALID_SEX.includes(sex)) {
            errors.push('Sex must be male, female or other.');
        }
    }

    const statuses = {};
    for (const field of ['pregnancyStatus', 'breastfeedingStatus']) {
        let value = 'unknown';
        if (body[field] !== undefined && body[field] !== null && String(body[field]).trim() !== '') {
            value = String(body[field]).trim().toLowerCase();
            if (!VALID_STATUS.includes(value)) {
                errors.push(`${field} must be one of: yes, no, not_applicable, unknown.`);
            }
        }
        statuses[field] = value;
    }

    const text50 = (value) => {
        if (value === undefined || value === null) return null;
        const s = String(value).trim();
        if (!s) return null;
        if (s.length > 120) {
            errors.push(`${value} is too long (max 120 characters).`);
            return null;
        }
        return s;
    };

    return {
        errors,
        values: {
            name,
            relation,
            age,
            dateOfBirth,
            sex,
            pregnancyStatus: statuses.pregnancyStatus,
            breastfeedingStatus: statuses.breastfeedingStatus,
            emergencyContactName: text50(body.emergencyContactName),
            emergencyContactPhone: text50(body.emergencyContactPhone),
            emergencyNotes: body.emergencyNotes !== undefined && body.emergencyNotes !== null
                ? String(body.emergencyNotes).trim().slice(0, 500) || null
                : null
        }
    };
}

function normalizeAllergyInput(raw) {
    const allergen = String(raw.allergen || '').trim();
    if (!allergen || allergen.length > 120) return { error: 'Allergen name is required (max 120 characters).' };
    const allergyType = raw.allergyType ? String(raw.allergyType).trim().toLowerCase() : 'medicine';
    if (!VALID_ALLERGY_TYPES.includes(allergyType)) {
        return { error: `Allergy type must be one of: ${VALID_ALLERGY_TYPES.join(', ')}.` };
    }
    const severity = raw.severity ? String(raw.severity).trim().toLowerCase() : 'moderate';
    if (!VALID_SEVERITIES.includes(severity)) {
        return { error: `Allergy severity must be one of: ${VALID_SEVERITIES.join(', ')}.` };
    }
    return {
        value: {
            allergen,
            allergyType,
            severity,
            notes: raw.notes ? String(raw.notes).trim().slice(0, 300) : ''
        }
    };
}

function normalizeConditionInput(raw) {
    const conditionName = String(raw.conditionName || '').trim();
    if (!conditionName || conditionName.length > 120) return { error: 'Condition name is required (max 120 characters).' };
    const severity = raw.severity ? String(raw.severity).trim().toLowerCase() : 'moderate';
    if (!VALID_SEVERITIES.includes(severity)) {
        return { error: `Condition severity must be one of: ${VALID_SEVERITIES.join(', ')}.` };
    }
    return {
        value: {
            conditionName,
            severity,
            notes: raw.notes ? String(raw.notes).trim().slice(0, 300) : '',
            diagnosedDate: raw.diagnosedDate ? String(raw.diagnosedDate).trim() : undefined
        }
    };
}

// ---------- profile endpoints ----------

exports.getProfiles = (req, res, next) => {
    try {
        const profiles = vaultSafetyService.getProfilesWithSummary(req.user.id);
        res.json({ success: true, count: profiles.length, data: profiles });
    } catch (err) {
        next(err);
    }
};

exports.createProfile = (req, res, next) => {
    try {
        const { errors, values } = parseBasicProfileBody(req.body);
        if (errors.length > 0) return validationError(res, errors[0]);

        // Duplicate profile guard: same name + same relationship
        const existing = FamilyMember.findByUserId(req.user.id);
        const duplicate = existing.find(m =>
            String(m.name).trim().toLowerCase() === values.name.toLowerCase()
            && String(m.relation).trim().toLowerCase() === values.relation.toLowerCase()
        );
        if (duplicate) {
            return validationError(res, `A profile for "${values.name}" (${values.relation}) already exists.`);
        }

        const profile = FamilyMember.create({ userId: req.user.id, ...values });

        // Optional bulk additions from the creation wizard
        const createdConditions = [];
        const createdAllergies = [];
        const skipped = [];

        if (Array.isArray(req.body.conditions)) {
            for (const raw of req.body.conditions) {
                const { error, value } = normalizeConditionInput(raw);
                if (error) { skipped.push(error); continue; }
                if (MedicalCondition.findByFamilyMember(profile.id).some(c =>
                    c.conditionName.toLowerCase() === value.conditionName.toLowerCase())) {
                    continue;
                }
                createdConditions.push(MedicalCondition.create({ familyMemberId: profile.id, ...value }));
            }
        }

        if (Array.isArray(req.body.allergies)) {
            for (const raw of req.body.allergies) {
                const { error, value } = normalizeAllergyInput(raw);
                if (error) { skipped.push(error); continue; }
                if (Allergy.findByFamilyMemberAndAllergen(profile.id, value.allergen)) continue;
                createdAllergies.push(Allergy.create({ familyMemberId: profile.id, ...value }));
            }
        }

        if (createdConditions.length || createdAllergies.length) FamilyMember.touch(profile.id);

        auditService.log(req.user.id, 'CREATE_FAMILY_PROFILE', 'family_members', profile.id, {
            name: values.name, relation: values.relation,
            conditions: createdConditions.length, allergies: createdAllergies.length
        }, req);

        const overview = vaultSafetyService.getProfileOverview(profile.id);
        res.status(201).json({
            success: true,
            message: `Safety profile created for ${profile.name}.`,
            data: overview,
            skipped
        });
    } catch (err) {
        next(err);
    }
};

exports.getProfile = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const overview = vaultSafetyService.getProfileOverview(profile.id);
        res.json({ success: true, data: overview });
    } catch (err) {
        next(err);
    }
};

exports.updateProfile = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const { errors, values } = parseBasicProfileBody({ ...profile, ...req.body });
        if (errors.length > 0) return validationError(res, errors[0]);

        // Only forward fields the client actually sent (PATCH semantics)
        const allowed = ['name', 'relation', 'age', 'dateOfBirth', 'sex', 'pregnancyStatus',
            'breastfeedingStatus', 'emergencyContactName', 'emergencyContactPhone', 'emergencyNotes'];
        const patch = {};
        for (const field of allowed) {
            if (req.body[field] !== undefined) patch[field] = values[field];
        }

        FamilyMember.update(profile.id, req.user.id, patch);
        auditService.log(req.user.id, 'UPDATE_FAMILY_PROFILE', 'family_members', profile.id, { fields: Object.keys(patch) }, req);

        res.json({
            success: true,
            message: 'Profile updated.',
            data: vaultSafetyService.getProfileOverview(profile.id)
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteProfile = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);

        // Remove all safety data owned by this profile (explicit delete only —
        // this is the user's confirmation step).
        const { runQuery } = require('../config/database');
        runQuery('DELETE FROM allergies WHERE familyMemberId = ?', [profile.id]);
        runQuery('DELETE FROM medical_conditions WHERE familyMemberId = ?', [profile.id]);
        runQuery('DELETE FROM medicine_history WHERE familyMemberId = ?', [profile.id]);
        runQuery('DELETE FROM safety_alerts WHERE familyMemberId = ?', [profile.id]);
        runQuery('DELETE FROM safety_check_logs WHERE familyMemberId = ?', [profile.id]);
        FamilyMember.delete(profile.id, req.user.id);

        auditService.log(req.user.id, 'DELETE_FAMILY_PROFILE', 'family_members', profile.id, { name: profile.name }, req);

        res.json({ success: true, message: `Profile for ${profile.name} was deleted.` });
    } catch (err) {
        next(err);
    }
};

// ---------- medication endpoints ----------

exports.addProfileMedication = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const { medicineId, medicineName, activeIngredient, strength, frequency, reason, startDate, dosageNotes } = req.body;

        if (!medicineId && !String(medicineName || '').trim()) {
            return validationError(res, 'Select a medicine from the directory or enter a medicine name.');
        }

        let resolvedId = null;
        let standardizedName = null;
        let standardizedIngredient = null;
        let identified = true;

        if (medicineId) {
            const med = Medicine.findById(Number(medicineId));
            if (!med) return validationError(res, 'The selected medicine was not found in the directory.');
            resolvedId = med.id;
            standardizedName = med.brandName;
            standardizedIngredient = med.genericName;
        } else {
            // Try to confidently match a manually entered name against the directory
            const med = medicationSafetyEngine.resolveMedicine({ medicineName });
            if (med) {
                resolvedId = med.id;
                standardizedName = med.brandName;
                standardizedIngredient = med.genericName;
            } else {
                identified = false;
            }
        }

        const record = MedicineHistory.create({
            familyMemberId: profile.id,
            medicineId: resolvedId,
            medicineName: resolvedId ? null : String(medicineName).trim().slice(0, 150),
            activeIngredient: resolvedId ? null : (activeIngredient ? String(activeIngredient).trim().slice(0, 200) : null),
            strength: strength ? String(strength).trim().slice(0, 100) : null,
            frequency: frequency ? String(frequency).trim().slice(0, 100) : null,
            reason: reason ? String(reason).trim().slice(0, 200) : null,
            startDate,
            dosageNotes
        });
        FamilyMember.touch(profile.id);

        auditService.log(req.user.id, 'ADD_PROFILE_MEDICATION', 'medicine_history', record.id, {
            profileId: profile.id,
            medicine: record.brandName,
            identified
        }, req);

        res.status(201).json({
            success: true,
            message: identified
                ? `${record.brandName} was added to ${profile.name}'s current medicines.`
                : `${record.brandName} was added, but it is not confidently identified in the medicine directory. Please verify the name/active ingredient.`,
            identified,
            data: record
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteProfileMedication = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const record = MedicineHistory.findById(Number(req.params.medicationId));
        if (!record || String(record.familyMemberId) !== String(profile.id)) {
            return res.status(404).json({ success: false, message: 'Medication record not found.' });
        }

        MedicineHistory.delete(record.id);
        FamilyMember.touch(profile.id);
        auditService.log(req.user.id, 'DELETE_PROFILE_MEDICATION', 'medicine_history', record.id, {
            profileId: profile.id, medicine: record.brandName
        }, req);

        res.json({ success: true, message: `${record.brandName} was removed from current medicines.` });
    } catch (err) {
        next(err);
    }
};

// ---------- allergy endpoints ----------

exports.addProfileAllergies = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const items = Array.isArray(req.body.allergies) ? req.body.allergies
            : (Array.isArray(req.body) ? req.body : [req.body]);

        const created = [];
        const errors = [];
        const duplicates = [];

        for (const raw of items) {
            const { error, value } = normalizeAllergyInput(raw);
            if (error) { errors.push(error); continue; }
            if (Allergy.findByFamilyMemberAndAllergen(profile.id, value.allergen)) {
                duplicates.push(value.allergen);
                continue;
            }
            created.push(Allergy.create({ familyMemberId: profile.id, ...value }));
        }

        if (created.length === 0 && errors.length > 0) {
            return validationError(res, errors[0]);
        }
        if (created.length > 0) FamilyMember.touch(profile.id);

        auditService.log(req.user.id, 'ADD_PROFILE_ALLERGIES', 'allergies', profile.id, {
            profileId: profile.id, added: created.map(a => a.allergen)
        }, req);

        const message = created.length > 0
            ? `${created.length} allerg${created.length === 1 ? 'y' : 'ies'} recorded for ${profile.name}.`
            : 'No new allergies were added.';
        res.status(201).json({ success: true, message, data: created, duplicates, errors });
    } catch (err) {
        next(err);
    }
};

exports.deleteProfileAllergy = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const allergy = Allergy.findById(Number(req.params.allergyId));
        if (!allergy || String(allergy.familyMemberId) !== String(profile.id)) {
            return res.status(404).json({ success: false, message: 'Allergy record not found.' });
        }

        Allergy.delete(allergy.id);
        FamilyMember.touch(profile.id);
        auditService.log(req.user.id, 'DELETE_PROFILE_ALLERGY', 'allergies', allergy.id, {
            profileId: profile.id, allergen: allergy.allergen
        }, req);

        res.json({ success: true, message: `${allergy.allergen} allergy removed.` });
    } catch (err) {
        next(err);
    }
};

// ---------- condition endpoints ----------

exports.addProfileConditions = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const items = Array.isArray(req.body.conditions) ? req.body.conditions
            : (Array.isArray(req.body) ? req.body : [req.body]);

        const created = [];
        const errors = [];
        const duplicates = [];

        const existingNames = MedicalCondition.findByFamilyMember(profile.id)
            .map(c => c.conditionName.toLowerCase());

        for (const raw of items) {
            const { error, value } = normalizeConditionInput(raw);
            if (error) { errors.push(error); continue; }
            if (existingNames.includes(value.conditionName.toLowerCase())) {
                duplicates.push(value.conditionName);
                continue;
            }
            const record = MedicalCondition.create({ familyMemberId: profile.id, ...value });
            created.push(record);
            existingNames.push(value.conditionName.toLowerCase());
        }

        if (created.length === 0 && errors.length > 0) {
            return validationError(res, errors[0]);
        }
        if (created.length > 0) FamilyMember.touch(profile.id);

        auditService.log(req.user.id, 'ADD_PROFILE_CONDITIONS', 'medical_conditions', profile.id, {
            profileId: profile.id, added: created.map(c => c.conditionName)
        }, req);

        const message = created.length > 0
            ? `${created.length} condition${created.length === 1 ? '' : 's'} recorded for ${profile.name}.`
            : 'No new conditions were added.';
        res.status(201).json({ success: true, message, data: created, duplicates, errors });
    } catch (err) {
        next(err);
    }
};

exports.deleteProfileCondition = (req, res, next) => {
    try {
        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, req.params.id);
        const condition = MedicalCondition.findById(Number(req.params.conditionId));
        if (!condition || String(condition.familyMemberId) !== String(profile.id)) {
            return res.status(404).json({ success: false, message: 'Condition record not found.' });
        }

        MedicalCondition.delete(condition.id);
        FamilyMember.touch(profile.id);
        auditService.log(req.user.id, 'DELETE_PROFILE_CONDITION', 'medical_conditions', condition.id, {
            profileId: profile.id, condition: condition.conditionName
        }, req);

        res.json({ success: true, message: `${condition.conditionName} removed.` });
    } catch (err) {
        next(err);
    }
};

// ---------- medication safety check ----------

exports.checkMedicineSafety = (req, res, next) => {
    try {
        const { profileId, medicineName, medicineId } = req.body;
        if (!profileId) {
            return validationError(res, 'Select whose profile to check (profileId is required).');
        }
        if (!medicineId && !String(medicineName || '').trim()) {
            return validationError(res, 'Enter or select a medicine to check.');
        }

        const profile = vaultSafetyService.assertProfileOwnership(req.user.id, profileId);
        const result = medicationSafetyEngine.checkMedicineSafety(
            profile,
            { medicineId, medicineName: String(medicineName || '').trim() },
            { userId: req.user.id }
        );

        res.json({
            success: true,
            checkingFor: profile.name,
            data: result
        });
    } catch (err) {
        next(err);
    }
};
