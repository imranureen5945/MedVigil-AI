const aiService = require('../services/aiService');
const auditService = require('../services/auditService');
const vaultSafetyService = require('../services/vaultSafetyService');
const medicationSafetyEngine = require('../services/medicationSafetyEngine');

exports.analyzeSymptoms = async (req, res, next) => {
    try {
        const { text, language = 'en', familyMemberId } = req.body;
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please describe your symptoms before analyzing.'
            });
        }

        if (text.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a more detailed symptom description for accurate analysis.'
            });
        }

        const analysis = await aiService.analyzeSymptoms(text, language);

        // ---- Family Safety Vault integration ----
        // When a profile is explicitly selected, the assessment uses the stored
        // safety information (age, conditions, allergies, current medicines)
        // instead of asking for it again, and every suggested medicine is
        // checked against that profile server-side.
        let vaultProfile = null;
        let vaultSafetyChecks = [];
        if (req.user && familyMemberId) {
            try {
                const profile = vaultSafetyService.assertProfileOwnership(req.user.id, familyMemberId);
                const overview = vaultSafetyService.getProfileOverview(profile.id);
                vaultProfile = {
                    id: profile.id,
                    name: profile.name,
                    relation: profile.relation,
                    age: overview.profile.resolvedAge,
                    allergyCount: overview.snapshot.allergyCount,
                    medicationCount: overview.snapshot.medicationCount,
                    conditionCount: overview.snapshot.conditionCount,
                    flags: overview.flags,
                    conditions: overview.conditions.map(c => c.conditionName),
                    allergies: overview.allergies.map(a => a.allergen)
                };

                vaultSafetyChecks = analysis.suggestedMedicines.map(med =>
                    medicationSafetyEngine.checkMedicineSafety(
                        profile,
                        { medicineId: med.id, medicineName: med.brandName },
                        { userId: req.user.id }
                    )
                );
            } catch (vaultErr) {
                // An inaccessible/unknown profile must never block symptom
                // analysis — report it so the frontend can warn the user.
                vaultProfile = { error: 'Selected family profile could not be used. Please re-select the profile in the Family Safety Vault.' };
            }
        }

        if (req.user) {
            auditService.log(req.user.id, 'ANALYZE_SYMPTOMS', 'symptoms', null, {
                query: text,
                matchedCount: analysis.matchedSymptoms.length,
                hasRedFlags: analysis.redFlags?.length > 0,
                vaultProfileId: vaultProfile && vaultProfile.id ? vaultProfile.id : null
            }, req);
        }

        // Structure response with all new fields
        res.json({
            success: true,
            symptom: text,
            category: analysis.matchedSymptoms.length > 0
                ? analysis.matchedSymptoms.map(s => s.category).join(', ')
                : 'General Assessment',
            redFlags: analysis.redFlags || [],
            clinicalSummary: analysis.clinicalSummary,
            medicines: analysis.suggestedMedicines.map(m => ({
                id: m.id,
                brandName: m.brandName,
                genericName: m.genericName,
                manufacturer: m.manufacturer,
                drapRegNumber: m.drapRegNumber || 'DRAP-VERIFIED',
                usage_: m.usage,
                dosage: m.dosage,
                category: m.category,
                isVerified: 1,
                recallStatus: m.recallStatus || 0,
                infoNote: `Therapeutic class: ${m.category}. Informational guidance only.`
            })),
            followUpQuestions: analysis.followUpQuestions || [],
            safetyNotes: analysis.safetyNotes || [],
            vaultProfile,
            vaultSafetyChecks,
            disclaimer: 'This information is educational only and does NOT constitute a medical diagnosis or prescription. Your symptoms may be consistent with multiple conditions. Always consult a licensed physician via Doctor Connect for proper clinical evaluation.',
            urduDisclaimer: 'یہ معلومات صرف تعلیمی نوعیت کی ہیں اور طبی تشخیص یا نسخہ نہیں ہیں۔ آپ کی علامات متعدد حالتوں سے مطابقت رکھ سکتی ہیں۔ مناسب کلینیکل جائزے کے لیے ہمیشہ لائسنس یافتہ ڈاکٹر سے مشورہ کریں۔'
        });
    } catch (err) {
        next(err);
    }
};
