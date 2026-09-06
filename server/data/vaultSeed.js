/**
 * Family Safety Vault reference data.
 *
 * Seeds two verified rule tables used by the deterministic safety engines:
 *  1. allergen_groups     — cross-reactive ingredient families. A recorded allergy
 *                           to any member must flag every other member of the family
 *                           (e.g. Penicillin allergy -> Amoxicillin / Augmentin alert).
 *  2. condition_warnings  — condition / special-status cautions against medicine
 *                           categories or active ingredients (kidney disease x NSAIDs,
 *                           pregnancy x fluoroquinolones, child x Aspirin, etc.).
 *
 * All inserts use INSERT OR IGNORE so this runs idempotently on every startup
 * and upgrades existing databases without touching user data.
 */
module.exports = function seedVaultData(db) {
    // ---------------------------------------------------------------
    // 1. Cross-reactive allergen families (verified clinical groupings)
    // ---------------------------------------------------------------
    const allergenGroups = {
        'Penicillins': [
            'penicillin', 'amoxicillin', 'ampicillin', 'cloxacillin', 'flucloxacillin',
            'piperacillin', 'ticarcillin', 'temocillin', 'benzylpenicillin',
            'phenoxymethylpenicillin', 'co-amoxiclav', 'clavulanate'
        ],
        'Cephalosporins': [
            'cephalexin', 'cefixime', 'cefradine', 'ceftriaxone', 'cefaclor',
            'cefuroxime', 'ceftazidime', 'cephradine'
        ],
        'Sulfonamide antibiotics': [
            'sulfamethoxazole', 'co-trimoxazole', 'trimethoprim', 'sulfadiazine', 'septran'
        ],
        'NSAIDs': [
            'aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'mefenamic acid',
            'ketoprofen', 'ketorolac', 'piroxicam', 'indomethacin', 'celecoxib',
            'etoricoxib', 'aceclofenac', 'acetylsalicylic acid'
        ],
        'Tetracyclines': [
            'doxycycline', 'tetracycline', 'minocycline'
        ],
        'Fluoroquinolones': [
            'ciprofloxacin', 'levofloxacin', 'ofloxacin', 'moxifloxacin', 'norfloxacin'
        ]
    };

    for (const [groupName, members] of Object.entries(allergenGroups)) {
        for (const member of members) {
            db.run(
                "INSERT OR IGNORE INTO allergen_groups (groupName, memberName) VALUES (?, ?)",
                [groupName, member]
            );
        }
    }

    // ---------------------------------------------------------------
    // 2. Condition / special-status warnings
    //    matchType 'category'   -> matches medicines.category (e.g. 'NSAID')
    //    matchType 'ingredient' -> matches any token of the active ingredient
    //                              (comma separated list supported)
    // ---------------------------------------------------------------
    const conditionWarnings = [
        // Kidney disease
        ['kidney disease', 'category', 'NSAID', 'critical',
            'NSAIDs (such as ibuprofen, diclofenac or aspirin) can reduce blood flow to the kidneys and may worsen kidney function. They are generally avoided in kidney disease unless a physician specifically advises otherwise.'],
        ['kidney disease', 'ingredient', 'metformin', 'warning',
            'Metformin is cleared by the kidneys. In kidney disease the dose may need adjustment, so professional advice is recommended before use.'],

        // Liver disease
        ['liver disease', 'ingredient', 'paracetamol,acetaminophen', 'warning',
            'Paracetamol is processed by the liver. In liver disease the total daily dose should be limited (commonly not above 2g per day) — professional advice is recommended before use.'],
        ['liver disease', 'category', 'Statin', 'caution',
            'Statins can affect liver enzymes. Monitoring is advised when liver disease is present.'],

        // Asthma
        ['asthma', 'category', 'NSAID', 'warning',
            'NSAIDs can trigger bronchospasm in some people with asthma. Professional advice is recommended before use.'],
        ['asthma', 'ingredient', 'propranolol,atenolol,timolol,bisoprolol,metoprolol', 'critical',
            'Beta-blockers can oppose asthma treatment and may cause severe bronchoconstriction. They are generally avoided in asthma.'],

        // Diabetes
        ['diabetes', 'ingredient', 'prednisolone,dexamethasone,hydrocortisone,betamethasone', 'warning',
            'Systemic corticosteroids can significantly raise blood glucose levels. Professional monitoring is recommended.'],

        // Hypertension
        ['hypertension', 'category', 'NSAID', 'caution',
            'Regular NSAID use can raise blood pressure and may reduce the effect of blood pressure medicines.'],

        // Heart disease
        ['heart disease', 'category', 'NSAID', 'caution',
            'NSAIDs can cause fluid retention and may increase cardiovascular risk in people with heart disease.'],

        // Pregnancy
        ['pregnancy', 'category', 'NSAID', 'warning',
            'NSAIDs are generally avoided during pregnancy, particularly in the third trimester. Professional advice is recommended before use.'],
        ['pregnancy', 'ingredient', 'doxycycline,tetracycline,minocycline', 'warning',
            'Tetracycline antibiotics are generally avoided during pregnancy. Professional advice is recommended before use.'],
        ['pregnancy', 'ingredient', 'ciprofloxacin,levofloxacin,ofloxacin,moxifloxacin', 'warning',
            'Fluoroquinolone antibiotics are generally avoided during pregnancy. Professional advice is recommended before use.'],
        ['pregnancy', 'ingredient', 'warfarin,methotrexate,isotretinoin', 'critical',
            'This medicine is known to be harmful in pregnancy and is generally contraindicated. Professional advice is essential before use.'],

        // Breastfeeding
        ['breastfeeding', 'ingredient', 'codeine', 'critical',
            'Codeine is generally not recommended while breastfeeding because it can pass into breast milk and affect the baby.'],
        ['breastfeeding', 'ingredient', 'aspirin,acetylsalicylic acid', 'warning',
            'Aspirin is generally avoided while breastfeeding. Professional advice is recommended before use.'],

        // Elderly (age 65+)
        ['elderly', 'category', 'NSAID', 'caution',
            'In older adults NSAIDs increase the risk of stomach bleeding and kidney problems. Use the lowest effective dose and consult a doctor.'],
        ['elderly', 'ingredient', 'alprazolam,bromazepam,lorazepam,clonazepam,diazepam', 'caution',
            'Sedative medicines increase the risk of falls and confusion in older adults. Professional advice is recommended.'],

        // Children (under 12)
        ['child', 'ingredient', 'aspirin,acetylsalicylic acid', 'critical',
            'Aspirin is not recommended for children under 12 because of the risk of Reye\'s syndrome (a rare but serious illness).'],
        ['child', 'ingredient', 'codeine', 'critical',
            'Codeine is not recommended for children because of the risk of severe breathing problems.'],
        ['child', 'ingredient', 'ciprofloxacin,levofloxacin,ofloxacin,moxifloxacin,doxycycline,tetracycline', 'warning',
            'This antibiotic class is generally avoided in young children. Professional advice is recommended before use.']
    ];

    for (const [conditionKey, matchType, pattern, severity, message] of conditionWarnings) {
        db.run(
            "INSERT OR IGNORE INTO condition_warnings (conditionKey, matchType, pattern, severity, message) VALUES (?, ?, ?, ?, ?)",
            [conditionKey, matchType, pattern, severity, message]
        );
    }
};
