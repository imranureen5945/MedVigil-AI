const { prepareAndGet, prepareAndAll } = require('../config/database');
const { Medicine, MedicineHistory } = require('../models');

const drapApiClient = {
    lookupMedicine: async (registrationNumber) => {
        return Medicine.findByDrapNumber(registrationNumber);
    },

    getRecalledMedicines: async () => {
        return Medicine.findRecalls();
    },

    batchCheckMedications: async (familyMemberId) => {
        const activeMeds = MedicineHistory.findByFamilyMember(familyMemberId, true);
        const flagged = [];

        for (const record of activeMeds) {
            if (record.recallStatus === 1) {
                flagged.push({
                    medicineId: record.medicineId,
                    brandName: record.brandName,
                    genericName: record.genericName,
                    drapRegNumber: record.drapRegNumber,
                    reason: 'DRAP Safety Notification: Substandard or contaminated batch recall.'
                });
            }
        }

        return {
            checkedCount: activeMeds.length,
            flaggedCount: flagged.length,
            flaggedMedications: flagged,
            drapSyncTimestamp: new Date().toISOString()
        };
    },

    getSafetyBulletins: async () => {
        return [
            {
                id: 'DRAP-SB-2024-08',
                title: 'Advisory on Inappropriate Antibiotic Combinations',
                date: '2024-08-15',
                category: 'Antimicrobial Stewardship',
                summary: 'Healthcare practitioners and public are advised against co-prescribing multiple broad-spectrum oral antibiotics without microbiological culture evidence.'
            },
            {
                id: 'DRAP-SB-2024-05',
                title: 'Ranitidine Quality Standards Recall Notice',
                date: '2024-05-10',
                category: 'Product Recall',
                summary: 'Continuation of precautionary market monitoring for NDMA impurities in histamine H2 receptor antagonists.'
            },
            {
                id: 'DRAP-SB-2024-02',
                title: 'Pediatric Paracetamol Syrup Dosing Guidelines',
                date: '2024-02-18',
                category: 'Dosage Advisory',
                summary: 'Weight-based dosing must be strictly followed for pediatric liquid suspensions to avoid accidental hepatotoxicity.'
            }
        ];
    }
};

module.exports = drapApiClient;
