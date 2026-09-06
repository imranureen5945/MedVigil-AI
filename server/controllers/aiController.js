const aiService = require('../services/aiService');
const auditService = require('../services/auditService');

const aiController = {
    analyzeMedicine: async (req, res, next) => {
        try {
            const { symptoms, language } = req.body;
            if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Symptoms query text is required' });
            }

            const analysis = await aiService.analyzeSymptoms(symptoms, language);
            
            if (req.user) {
                auditService.log(req.user.id, 'AI_SYMPTOM_QUERY', 'ai_service', null, { symptoms, matchedCount: analysis.matchedSymptoms.length }, req);
            }

            res.json({ success: true, data: analysis });
        } catch (error) {
            next(error);
        }
    },

    explainInteraction: async (req, res, next) => {
        try {
            const { drug1, drug2 } = req.body;
            if (!drug1 || !drug2) {
                return res.status(400).json({ success: false, message: 'drug1 and drug2 are required' });
            }

            const explanation = await aiService.explainInteraction(drug1, drug2);
            res.json({ success: true, data: explanation });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = aiController;
