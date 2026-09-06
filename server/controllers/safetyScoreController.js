const { calculateSafetyScore, checkSingleMedicineSafety } = require('../services/interactionEngine');
const { SafetyAlert, FamilyMember, MedicineHistory, Allergy } = require('../models');

exports.getSafetyScore = (req, res, next) => {
    try {
        const { familyMemberId } = req.params;
        const result = calculateSafetyScore(familyMemberId);
        res.json(result);
    } catch(err) {
        next(err);
    }
};

exports.getAlerts = (req, res, next) => {
    try {
        const { familyMemberId } = req.params;
        // First get stored alerts
        const dbAlerts = SafetyAlert.findByFamilyMember(familyMemberId, true);
        
        // Also get live calculated alerts from interaction engine
        const liveCheck = calculateSafetyScore(familyMemberId);
        
        // Merge structured alerts
        const allAlerts = [
            ...dbAlerts.map(a => ({
                id: a.id,
                type: a.type || 'warning',
                severity: a.severity || 'warning',
                title: a.type === 'recall' ? 'DRAP Safety Notice' : 'Clinical Safety Alert',
                message: a.message,
                createdAt: a.createdAt
            })),
            ...(liveCheck.structuredAlerts || []).map((sa, idx) => ({
                id: `live-${idx + 1}`,
                type: sa.type,
                severity: sa.severity,
                title: sa.title,
                message: sa.message,
                recommendation: sa.recommendation,
                createdAt: 'Live Evaluation'
            }))
        ];

        res.json(allAlerts);
    } catch(err) {
        next(err);
    }
};

exports.getInsights = (req, res, next) => {
    try {
        const userId = req.user.id;
        const members = FamilyMember.findByUserId(userId);
        const insights = [];

        for (const m of members) {
            const safety = calculateSafetyScore(m.id);
            const activeMeds = MedicineHistory.findByFamilyMember(m.id, true);
            const allergies = Allergy.findByFamilyMember(m.id);

            if (safety.riskLevel === 'critical') {
                insights.push({
                    priority: 'high',
                    type: 'critical',
                    member: m.name,
                    title: `Critical Alert for ${m.name}`,
                    message: `Safety score is ${safety.score}/100. Potential drug conflicts or recall detected.`,
                    action: '/safety-center'
                });
            }

            // Antibiotic duration reminder
            const antibiotics = activeMeds.filter(med => med.category === 'Antibiotic');
            if (antibiotics.length > 0) {
                insights.push({
                    priority: 'medium',
                    type: 'amr',
                    member: m.name,
                    title: `Complete Full Antibiotic Course (${m.name})`,
                    message: `Taking ${antibiotics.map(a => a.brandName).join(', ')}. Complete the exact prescribed duration to prevent AMR.`,
                    action: '/amr'
                });
            }

            // Hydration and food timing
            const hasNSAID = activeMeds.some(med => med.category === 'NSAID');
            if (hasNSAID) {
                insights.push({
                    priority: 'low',
                    type: 'dosage',
                    member: m.name,
                    title: `Take NSAIDs After Meals (${m.name})`,
                    message: 'Painkillers like Brufen/Ponstan should always be taken after food to protect stomach lining.',
                    action: '/drug-info'
                });
            }
        }

        if (insights.length === 0) {
            insights.push(
                {
                    priority: 'low',
                    type: 'safe',
                    title: 'Prescription Records Optimal',
                    message: 'All active medications for your family are verified against DRAP registration.',
                    action: '/dashboard'
                },
                {
                    priority: 'low',
                    type: 'info',
                    title: 'Family Medicine Reminder',
                    message: 'Keep medication expiry dates updated by scanning package labels with OCR.',
                    action: '/scan-medicine'
                }
            );
        }

        res.json({ count: insights.length, insights });
    } catch(err) {
        next(err);
    }
};

exports.checkSingle = (req, res, next) => {
    try {
        const { familyMemberId, medicine } = req.body;
        if (!familyMemberId || !medicine) {
            return res.status(400).json({ success: false, message: 'familyMemberId and medicine object required' });
        }
        const check = checkSingleMedicineSafety(familyMemberId, medicine);
        res.json({ success: true, data: check });
    } catch (err) {
        next(err);
    }
};
