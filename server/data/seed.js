/**
 * Seed the medicines directory and drug-interaction reference data.
 * All demo user / doctor / family accounts have been removed for production.
 * vaultSeed.js (allergen groups + condition warnings) is called separately
 * from database.js and remains unchanged.
 */
module.exports = function seed(db) {
    
    // Seed medicines - Comprehensive list of real Pakistani brands
    const medicines = [
        // Analgesics & Antipyretics
        ['Panadol', 'Paracetamol', 'GSK Pakistan', 'DRAP-001', 'Fever, mild to moderate pain', '1-2 tablets every 4-6 hours', 'Analgesic', 0],
        ['Calpol', 'Paracetamol', 'GSK Pakistan', 'DRAP-002', 'Fever in children', 'As per body weight', 'Analgesic', 0],
        ['Disprin', 'Aspirin', 'Reckitt Benckiser', 'DRAP-003', 'Headache, pain', '1-2 tablets dissolved in water', 'Analgesic', 0],
        ['Brufen', 'Ibuprofen', 'Abbott Pakistan', 'DRAP-004', 'Pain, fever, inflammation', '400mg every 6-8 hours', 'NSAID', 0],
        ['Ponstan', 'Mefenamic Acid', 'Pfizer Pakistan', 'DRAP-005', 'Menstrual cramps, mild pain', '500mg every 8 hours', 'NSAID', 0],
        ['Nurofen', 'Ibuprofen', 'Reckitt Benckiser', 'DRAP-006', 'Pain, inflammation', '1-2 tablets every 8 hours', 'NSAID', 0],
        ['Tylenol', 'Paracetamol', 'Johnson & Johnson', 'DRAP-007', 'Fever, pain', '1 tablet every 6 hours', 'Analgesic', 0],
        ['Synflex', 'Naproxen Sodium', 'Highnoon Laboratories', 'DRAP-008', 'Severe pain, arthritis', '550mg every 12 hours', 'NSAID', 0],
        ['Brexin', 'Piroxicam', 'Chiesi Pakistan', 'DRAP-009', 'Joint pain, osteoarthritis', '1 tablet daily', 'NSAID', 0],
        ['Lofnac', 'Diclofenac Potassium', 'Hilton Pharma', 'DRAP-010', 'Acute pain, inflammation', '50mg every 8 hours', 'NSAID', 0],

        // Antibiotics
        ['Augmentin', 'Amoxicillin + Clavulanate', 'GSK Pakistan', 'DRAP-011', 'Bacterial infections', '625mg/1g every 12 hours', 'Antibiotic', 0],
        ['Amoxil', 'Amoxicillin', 'GSK Pakistan', 'DRAP-012', 'General bacterial infections', '250mg-500mg every 8 hours', 'Antibiotic', 0],
        ['Septran', 'Co-trimoxazole', 'Aspen Pharmacare', 'DRAP-013', 'Urinary tract infections', '2 tablets every 12 hours', 'Antibiotic', 0],
        ['Flagyl', 'Metronidazole', 'Sanofi Pakistan', 'DRAP-014', 'Amoebic infections, diarrhea', '400mg every 8 hours', 'Antibiotic', 0],
        ['Ciproxin', 'Ciprofloxacin', 'Bayer Pakistan', 'DRAP-015', 'Typhoid, UTI', '500mg every 12 hours', 'Antibiotic', 0],
        ['Azomax', 'Azithromycin', 'Abbott Pakistan', 'DRAP-016', 'Respiratory tract infections', '500mg daily for 3 days', 'Antibiotic', 0],
        ['Vibramycin', 'Doxycycline', 'Pfizer Pakistan', 'DRAP-017', 'Acne, respiratory infections', '100mg daily', 'Antibiotic', 0],
        ['Novidat', 'Ciprofloxacin', 'Sami Pharmaceuticals', 'DRAP-018', 'Bacterial infections', '500mg every 12 hours', 'Antibiotic', 0],
        ['Leflox', 'Levofloxacin', 'Getz Pharma', 'DRAP-019', 'Respiratory and UTI infections', '500mg daily', 'Antibiotic', 0],
        ['Velosef', 'Cephradine', 'GSK Pakistan', 'DRAP-020', 'Skin and soft tissue infections', '500mg every 6 hours', 'Antibiotic', 0],

        // Antacids & GI
        ['Risek', 'Omeprazole', 'Getz Pharma', 'DRAP-021', 'Gastric ulcers, GERD', '20mg/40mg daily before meal', 'Antacid', 0],
        ['Zantac', 'Ranitidine', 'GSK Pakistan', 'DRAP-022', 'Heartburn, acidity', '150mg twice daily', 'Antacid', 1], // Marked as recalled
        ['Motilium', 'Domperidone', 'Johnson & Johnson', 'DRAP-023', 'Nausea, vomiting', '10mg before meals', 'GI Agent', 0],
        ['Imodium', 'Loperamide', 'Johnson & Johnson', 'DRAP-024', 'Diarrhea', '2mg after loose stool', 'Antidiarrheal', 0],
        ['Buscopan', 'Hyoscine', 'Sanofi Pakistan', 'DRAP-025', 'Abdominal cramps', '10mg every 8 hours', 'Antispasmodic', 0],
        ['Gaviscon', 'Sodium Alginate + Bicarbonate', 'Reckitt Benckiser', 'DRAP-026', 'Heartburn, acid indigestion', '2-4 spoons after meals', 'Antacid', 0],
        ['Smecta', 'Dioctahedral Smectite', 'Ipsen', 'DRAP-027', 'Acute diarrhea', '1 sachet in water', 'Antidiarrheal', 0],
        ['Gravinate', 'Dimenhydrinate', 'Searle Pakistan', 'DRAP-028', 'Motion sickness, nausea', '50mg as needed', 'Antiemetic', 0],
        ['Entamizole', 'Metronidazole + Diloxanide', 'Abbott Pakistan', 'DRAP-029', 'Amoebiasis, dysentery', '1 tablet twice daily', 'Antiamoebic', 0],
        ['Mucaine', 'Oxethazaine + Alumina', 'Wyeth Pakistan', 'DRAP-030', 'Gastritis, acidity', '1-2 spoons as needed', 'Antacid', 0],

        // Cardiovascular
        ['Concor', 'Bisoprolol', 'Merck', 'DRAP-031', 'Hypertension, heart failure', '5mg daily', 'Beta Blocker', 0],
        ['Lopressor', 'Metoprolol', 'Novartis', 'DRAP-032', 'Hypertension', '50mg daily', 'Beta Blocker', 0],
        ['Norvasc', 'Amlodipine', 'Pfizer Pakistan', 'DRAP-033', 'Hypertension, angina', '5mg-10mg daily', 'Calcium Channel Blocker', 0],
        ['Lipitor', 'Atorvastatin', 'Pfizer Pakistan', 'DRAP-034', 'High cholesterol', '10mg-40mg daily at night', 'Statin', 0],
        ['Crestor', 'Rosuvastatin', 'AstraZeneca', 'DRAP-035', 'High cholesterol', '10mg daily', 'Statin', 0],
        ['Cozaar', 'Losartan', 'MSD', 'DRAP-036', 'Hypertension', '50mg daily', 'ARB', 0],
        ['Tritace', 'Ramipril', 'Sanofi Pakistan', 'DRAP-037', 'Hypertension, heart failure', '2.5mg-5mg daily', 'ACE Inhibitor', 0],
        ['Zocor', 'Simvastatin', 'MSD', 'DRAP-038', 'High cholesterol', '20mg at night', 'Statin', 0],
        ['Lanoxin', 'Digoxin', 'GSK Pakistan', 'DRAP-039', 'Heart failure, atrial fibrillation', '0.25mg daily', 'Cardiac Glycoside', 0],
        ['Aldomet', 'Methyldopa', 'Aspen Pharmacare', 'DRAP-040', 'Hypertension in pregnancy', '250mg 2-3 times daily', 'Alpha-2 Agonist', 0],

        // Diabetes
        ['Glucophage', 'Metformin', 'Merck', 'DRAP-041', 'Type 2 Diabetes', '500mg-1000mg with meals', 'Antidiabetic', 0],
        ['Amaryl', 'Glimepiride', 'Sanofi Pakistan', 'DRAP-042', 'Type 2 Diabetes', '1mg-4mg daily', 'Antidiabetic', 0],
        ['Januvia', 'Sitagliptin', 'MSD', 'DRAP-043', 'Type 2 Diabetes', '100mg daily', 'Antidiabetic', 0],
        ['Diamicron', 'Gliclazide', 'Servier', 'DRAP-044', 'Type 2 Diabetes', '30mg-60mg daily', 'Antidiabetic', 0],
        ['Daonil', 'Glibenclamide', 'Sanofi Pakistan', 'DRAP-045', 'Type 2 Diabetes', '5mg daily', 'Antidiabetic', 0],
        ['Getryl', 'Glimepiride', 'Getz Pharma', 'DRAP-046', 'Type 2 Diabetes', '2mg-4mg daily', 'Antidiabetic', 0],
        ['Neodipar', 'Metformin', 'Sanofi Pakistan', 'DRAP-047', 'Type 2 Diabetes', '500mg with meals', 'Antidiabetic', 0],
        ['Jardiance', 'Empagliflozin', 'Boehringer Ingelheim', 'DRAP-048', 'Type 2 Diabetes', '10mg daily', 'Antidiabetic', 0],
        ['Trajenta', 'Linagliptin', 'Boehringer Ingelheim', 'DRAP-049', 'Type 2 Diabetes', '5mg daily', 'Antidiabetic', 0],
        ['Mixtard', 'Human Insulin', 'Novo Nordisk', 'DRAP-050', 'Type 1/Type 2 Diabetes', 'As prescribed', 'Insulin', 0],

        // Respiratory
        ['Ventolin', 'Salbutamol', 'GSK Pakistan', 'DRAP-051', 'Asthma, COPD', '1-2 puffs as needed', 'Bronchodilator', 0],
        ['Seretide', 'Salmeterol + Fluticasone', 'GSK Pakistan', 'DRAP-052', 'Asthma, COPD', '1 puff twice daily', 'Corticosteroid/Bronchodilator', 0],
        ['Singulair', 'Montelukast', 'MSD', 'DRAP-053', 'Asthma, allergic rhinitis', '10mg at night', 'Leukotriene Receptor Antagonist', 0],
        ['Benadryl', 'Diphenhydramine', 'Johnson & Johnson', 'DRAP-054', 'Cough, allergy', '1-2 spoons as needed', 'Antihistamine', 0],
        ['Corex', 'Chlorpheniramine + Codeine', 'Pfizer Pakistan', 'DRAP-055', 'Dry cough', '1 spoon every 8 hours', 'Cough Suppressant', 0],
        ['Hydryllin', 'Aminophylline + Diphenhydramine', 'Searle Pakistan', 'DRAP-056', 'Cough, bronchospasm', '1 spoon every 6 hours', 'Cough Syrup', 0],
        ['Acefyl', 'Acefylline Piperazine', 'Nabiqasim Industries', 'DRAP-057', 'Cough, asthma', '1 spoon 3 times daily', 'Bronchodilator', 0],
        ['Pulmicort', 'Budesonide', 'AstraZeneca', 'DRAP-058', 'Asthma maintenance', 'Via nebulizer twice daily', 'Corticosteroid', 0],
        ['Symbicort', 'Budesonide + Formoterol', 'AstraZeneca', 'DRAP-059', 'Asthma, COPD', '1-2 puffs twice daily', 'Corticosteroid/Bronchodilator', 0],
        ['Aerolin', 'Salbutamol', 'GSK Pakistan', 'DRAP-060', 'Asthma relief', '1-2 puffs as needed', 'Bronchodilator', 0],

        // Dermatology
        ['Dermovate', 'Clobetasol Propionate', 'GSK Pakistan', 'DRAP-061', 'Eczema, psoriasis', 'Apply thinly once or twice daily', 'Topical Corticosteroid', 0],
        ['Betnovate', 'Betamethasone Valerate', 'GSK Pakistan', 'DRAP-062', 'Skin inflammation, allergies', 'Apply thinly twice daily', 'Topical Corticosteroid', 0],
        ['Candid', 'Clotrimazole', 'Glenmark Pharmaceuticals', 'DRAP-063', 'Fungal infections', 'Apply twice daily', 'Antifungal', 0],
        ['Fucicort', 'Fusidic Acid + Betamethasone', 'Leo Pharma', 'DRAP-064', 'Infected eczema', 'Apply twice daily', 'Antibacterial/Corticosteroid', 0],
        ['Fucidin', 'Fusidic Acid', 'Leo Pharma', 'DRAP-065', 'Skin infections', 'Apply 3 times daily', 'Topical Antibiotic', 0],
        ['Polyfax', 'Polymyxin B + Bacitracin', 'GSK Pakistan', 'DRAP-066', 'Minor cuts, scrapes, burns', 'Apply 2-3 times daily', 'Topical Antibiotic', 0],
        ['Hydrozole', 'Hydrocortisone + Clotrimazole', 'GSK Pakistan', 'DRAP-067', 'Fungal infections with inflammation', 'Apply twice daily', 'Antifungal/Corticosteroid', 0],
        ['Kenacomb', 'Triamcinolone + Neomycin + Nystatin', 'Aspen Pharmacare', 'DRAP-068', 'Skin infections', 'Apply 2-3 times daily', 'Multipurpose Cream', 0],
        ['Skinoren', 'Azelaic Acid', 'Bayer Pakistan', 'DRAP-069', 'Acne vulgaris', 'Apply twice daily', 'Anti-acne', 0],
        ['Daktarin', 'Miconazole', 'Johnson & Johnson', 'DRAP-070', 'Fungal infections', 'Apply twice daily', 'Antifungal', 0],

        // Vitamins & Supplements
        ['Centrum', 'Multivitamins', 'Haleon', 'DRAP-071', 'General wellbeing', '1 tablet daily', 'Multivitamin', 0],
        ['Caltrate', 'Calcium + Vitamin D', 'Haleon', 'DRAP-072', 'Bone health', '1 tablet daily', 'Calcium Supplement', 0],
        ['Ferosoft', 'Iron (Polymaltose Complex)', 'PharmEvo', 'DRAP-073', 'Iron deficiency anemia', '1 tablet/spoon daily', 'Iron Supplement', 0],
        ['Neurobion', 'Vitamin B Complex', 'Martin Dow', 'DRAP-074', 'Nerve health', '1 tablet daily', 'Vitamin B Supplement', 0],
        ['Folic Acid', 'Folic Acid', 'Various', 'DRAP-075', 'Pregnancy support, anemia', '5mg daily', 'Vitamin', 0],
        ['Surbex Z', 'Vitamins + Zinc', 'Abbott Pakistan', 'DRAP-076', 'Vitamin deficiency, immunity', '1 tablet daily', 'Multivitamin', 0],
        ['CAC-1000', 'Calcium + Vitamin C, D, B6', 'GSK Pakistan', 'DRAP-077', 'Bone health, immunity', '1 effervescent tablet daily', 'Calcium Supplement', 0],
        ['Evion', 'Vitamin E', 'Martin Dow', 'DRAP-078', 'Skin and hair health', '1 capsule daily', 'Vitamin', 0],
        ['Iberet', 'Iron + Vitamin C + B Complex', 'Abbott Pakistan', 'DRAP-079', 'Anemia', '1 tablet daily', 'Iron Supplement', 0],
        ['Zincol', 'Zinc Sulphate', 'Getz Pharma', 'DRAP-080', 'Zinc deficiency, diarrhea in kids', '1 spoon daily', 'Zinc Supplement', 0],

        // Mental Health
        ['Lexotanil', 'Bromazepam', 'Martin Dow', 'DRAP-081', 'Anxiety, tension', '1.5mg-3mg up to 3 times daily', 'Anxiolytic', 0],
        ['Xanax', 'Alprazolam', 'Pfizer Pakistan', 'DRAP-082', 'Anxiety, panic disorders', '0.25mg-0.5mg up to 3 times daily', 'Anxiolytic', 0],
        ['Prozac', 'Fluoxetine', 'Eli Lilly', 'DRAP-083', 'Depression, OCD', '20mg daily', 'Antidepressant', 0],
        ['Risperdal', 'Risperidone', 'Johnson & Johnson', 'DRAP-084', 'Schizophrenia, bipolar', '1mg-2mg daily', 'Antipsychotic', 0],
        ['Zoloft', 'Sertraline', 'Pfizer Pakistan', 'DRAP-085', 'Depression, panic attacks', '50mg daily', 'Antidepressant', 0],
        ['Cipralex', 'Escitalopram', 'Lundbeck', 'DRAP-086', 'Depression, generalized anxiety', '10mg daily', 'Antidepressant', 0],
        ['Rivotril', 'Clonazepam', 'Martin Dow', 'DRAP-087', 'Epilepsy, panic disorders', '0.5mg-1mg daily', 'Anticonvulsant/Anxiolytic', 0],
        ['Ativan', 'Lorazepam', 'Wyeth Pakistan', 'DRAP-088', 'Severe anxiety', '1mg-2mg daily', 'Anxiolytic', 0],
        ['Seroquel', 'Quetiapine', 'AstraZeneca', 'DRAP-089', 'Schizophrenia, bipolar', '50mg-300mg daily', 'Antipsychotic', 0],
        ['Epival', 'Divalproex Sodium', 'Abbott Pakistan', 'DRAP-090', 'Epilepsy, bipolar disorder', '250mg-500mg daily', 'Anticonvulsant', 0],

        // Pain & Inflammation (Additional)
        ['Voltaren', 'Diclofenac Sodium', 'Novartis', 'DRAP-091', 'Pain, arthritis', '50mg every 8 hours', 'NSAID', 0],
        ['Tramal', 'Tramadol', 'Searle Pakistan', 'DRAP-092', 'Moderate to severe pain', '50mg every 6 hours', 'Opioid Analgesic', 0],
        ['Arcoxia', 'Etoricoxib', 'MSD', 'DRAP-093', 'Osteoarthritis, gout', '60mg-90mg daily', 'NSAID', 0],
        ['Toradol', 'Ketorolac', 'Martin Dow', 'DRAP-094', 'Severe short-term pain', '10mg every 6 hours', 'NSAID', 0],
        ['Celebrex', 'Celecoxib', 'Pfizer Pakistan', 'DRAP-095', 'Arthritis, acute pain', '100mg-200mg daily', 'NSAID', 0],
        ['Nuberol Forte', 'Paracetamol + Orphenadrine', 'Searle Pakistan', 'DRAP-096', 'Muscle spasms, pain', '1 tablet twice daily', 'Muscle Relaxant/Analgesic', 0],
        ['Muscoril', 'Thiocolchicoside', 'Sanofi Pakistan', 'DRAP-097', 'Muscle spasms', '4mg twice daily', 'Muscle Relaxant', 0],
        ['Myonal', 'Eperisone', 'Abbott Pakistan', 'DRAP-098', 'Muscle stiffness', '50mg three times daily', 'Muscle Relaxant', 0],
        ['Keto', 'Ketoprofen', 'Sanofi Pakistan', 'DRAP-099', 'Pain, inflammation', '100mg twice daily', 'NSAID', 0],
        ['Cafergot', 'Ergotamine + Caffeine', 'Novartis', 'DRAP-100', 'Migraine attacks', '1-2 tablets at onset', 'Antimigraine', 0],

        // Allergies
        ['Zyrtec', 'Cetirizine', 'GSK Pakistan', 'DRAP-101', 'Allergic rhinitis, hives', '10mg daily', 'Antihistamine', 0],
        ['Claritin', 'Loratadine', 'Bayer Pakistan', 'DRAP-102', 'Allergies, runny nose', '10mg daily', 'Antihistamine', 0],
        ['Atarax', 'Hydroxyzine', 'UCB Pharma', 'DRAP-103', 'Itching, anxiety', '10mg-25mg daily', 'Antihistamine', 0],
        ['Avil', 'Pheniramine Maleate', 'Sanofi Pakistan', 'DRAP-104', 'Allergic conditions', '1 tablet as needed', 'Antihistamine', 0],
        ['Telfast', 'Fexofenadine', 'Sanofi Pakistan', 'DRAP-105', 'Seasonal allergies', '120mg-180mg daily', 'Antihistamine', 0],
        ['Kestine', 'Ebastine', 'Highnoon Laboratories', 'DRAP-106', 'Allergic rhinitis', '10mg-20mg daily', 'Antihistamine', 0],
        ['Rigix', 'Cetirizine', 'AGP Limited', 'DRAP-107', 'Allergies', '10mg daily', 'Antihistamine', 0],
        ['Softin', 'Loratadine', 'PharmEvo', 'DRAP-108', 'Allergies', '10mg daily', 'Antihistamine', 0],
        ['Fexet', 'Fexofenadine', 'Getz Pharma', 'DRAP-109', 'Allergies', '120mg daily', 'Antihistamine', 0],
        ['Xyzal', 'Levocetirizine', 'GSK Pakistan', 'DRAP-110', 'Allergic rhinitis', '5mg daily', 'Antihistamine', 0],
        
        // Let's add 40 more mixed common Pakistani meds to reach 150
        ['Serc', 'Betahistine', 'Abbott Pakistan', 'DRAP-111', 'Vertigo, Meniere disease', '16mg twice daily', 'Antivertigo', 0],
        ['Stemetil', 'Prochlorperazine', 'Sanofi Pakistan', 'DRAP-112', 'Nausea, vertigo', '5mg 3 times daily', 'Antiemetic', 0],
        ['Maxolon', 'Metoclopramide', 'GSK Pakistan', 'DRAP-113', 'Nausea, vomiting', '10mg 3 times daily', 'Antiemetic', 0],
        ['Aldactone', 'Spironolactone', 'Pfizer Pakistan', 'DRAP-114', 'Edema, hypertension', '25mg-100mg daily', 'Diuretic', 0],
        ['Lasix', 'Furosemide', 'Sanofi Pakistan', 'DRAP-115', 'Edema, hypertension', '20mg-40mg daily', 'Diuretic', 0],
        ['Tenormin', 'Atenolol', 'AstraZeneca', 'DRAP-116', 'Hypertension', '50mg daily', 'Beta Blocker', 0],
        ['Angised', 'Glyceryl Trinitrate', 'GSK Pakistan', 'DRAP-117', 'Angina (chest pain)', '0.5mg under tongue', 'Nitrate', 0],
        ['Plavix', 'Clopidogrel', 'Sanofi Pakistan', 'DRAP-118', 'Prevention of blood clots', '75mg daily', 'Antiplatelet', 0],
        ['Aspirin', 'Aspirin', 'Bayer Pakistan', 'DRAP-119', 'Pain, blood thinner', '75mg-300mg daily', 'NSAID/Antiplatelet', 0],
        ['Thyroxine', 'Levothyroxine', 'GSK Pakistan', 'DRAP-120', 'Hypothyroidism', '50mcg-100mcg daily', 'Thyroid Hormone', 0],
        ['NeoMercazole', 'Carbimazole', 'Amdipharm', 'DRAP-121', 'Hyperthyroidism', '5mg-15mg daily', 'Antithyroid', 0],
        ['Danzen', 'Serratiopeptidase', 'Hilton Pharma', 'DRAP-122', 'Inflammation, swelling', '10mg 3 times daily', 'Anti-inflammatory', 0],
        ['Cataflam', 'Diclofenac Potassium', 'Novartis', 'DRAP-123', 'Pain, inflammation', '50mg every 8 hours', 'NSAID', 0],
        ['Zyloric', 'Allopurinol', 'GSK Pakistan', 'DRAP-124', 'Gout, high uric acid', '100mg-300mg daily', 'Antigout', 0],
        ['Uric', 'Febuxostat', 'Getz Pharma', 'DRAP-125', 'Gout', '40mg-80mg daily', 'Antigout', 0],
        ['Prothiaden', 'Dosulepin', 'Abbott Pakistan', 'DRAP-126', 'Depression', '25mg-75mg at night', 'Antidepressant', 0],
        ['Kemadrin', 'Procyclidine', 'GSK Pakistan', 'DRAP-127', 'Parkinsons disease', '2.5mg-5mg 3 times daily', 'Anticholinergic', 0],
        ['Tegretol', 'Carbamazepine', 'Novartis', 'DRAP-128', 'Epilepsy, nerve pain', '100mg-200mg twice daily', 'Anticonvulsant', 0],
        ['Keppra', 'Levetiracetam', 'GSK Pakistan', 'DRAP-129', 'Epilepsy', '500mg twice daily', 'Anticonvulsant', 0],
        ['Dilantin', 'Phenytoin', 'Pfizer Pakistan', 'DRAP-130', 'Epilepsy', '100mg 3 times daily', 'Anticonvulsant', 0],
        ['Losec', 'Omeprazole', 'AstraZeneca', 'DRAP-132', 'GERD, ulcers', '20mg daily', 'PPI', 0],
        ['Nexium', 'Esomeprazole', 'AstraZeneca', 'DRAP-133', 'GERD, ulcers', '20mg-40mg daily', 'PPI', 0],
        ['Dexilant', 'Dexlansoprazole', 'Takeda', 'DRAP-134', 'GERD', '30mg-60mg daily', 'PPI', 0],
        ['Ganaton', 'Itopride', 'Abbott Pakistan', 'DRAP-135', 'Dyspepsia, GI motility', '50mg 3 times daily', 'Prokinetic', 0],
        ['Cremaffin', 'Liquid Paraffin + Magnesia', 'Abbott Pakistan', 'DRAP-136', 'Constipation', '1-2 spoons at night', 'Laxative', 0],
        ['Skilax', 'Sodium Picosulfate', 'Surge Labs', 'DRAP-137', 'Constipation', '10-15 drops at night', 'Laxative', 0],
        ['Lactulose', 'Lactulose', 'Various', 'DRAP-138', 'Constipation, hepatic encephalopathy', '15ml twice daily', 'Laxative', 0],
        ['Nydrane', 'Beclamide', 'Various', 'DRAP-140', 'Behavioral disorders', '500mg daily', 'Anticonvulsant', 1], // Recalled
        ['Rocephin', 'Ceftriaxone', 'Martin Dow', 'DRAP-141', 'Severe bacterial infections', '1g-2g daily (IV/IM)', 'Antibiotic', 0],
        ['Klaricid', 'Clarithromycin', 'Abbott Pakistan', 'DRAP-142', 'Respiratory tract infections', '250mg-500mg twice daily', 'Antibiotic', 0],
        ['Cefspan', 'Cefixime', 'Barrett Hodgson', 'DRAP-143', 'Typhoid, respiratory infections', '400mg daily', 'Antibiotic', 0],
        ['Tarivid', 'Ofloxacin', 'Sanofi Pakistan', 'DRAP-144', 'Urinary tract infections', '200mg-400mg twice daily', 'Antibiotic', 0],
        ['Minocin', 'Minocycline', 'Wyeth Pakistan', 'DRAP-145', 'Acne, infections', '100mg daily', 'Antibiotic', 0],
        ['Zovirax', 'Acyclovir', 'GSK Pakistan', 'DRAP-146', 'Herpes infections', '200mg 5 times daily', 'Antiviral', 0],
        ['Tamiflu', 'Oseltamivir', 'Roche Pakistan', 'DRAP-147', 'Influenza', '75mg twice daily', 'Antiviral', 0],
        ['Malathion', 'Malathion', 'Various', 'DRAP-148', 'Head lice', 'Apply externally', 'Antiparasitic', 0],
        ['Vermox', 'Mebendazole', 'Johnson & Johnson', 'DRAP-149', 'Worm infections', '100mg twice daily for 3 days', 'Anthelmintic', 0],
        ['Zentel', 'Albendazole', 'GSK Pakistan', 'DRAP-150', 'Worm infections', '400mg single dose', 'Anthelmintic', 0],

        // ── Diabetes (Extended) ──────────────────────────────────────────────
        ['Tagipmet', 'Sitagliptin + Metformin', 'MSD', 'DRAP-151', 'Type 2 Diabetes', '50/500mg or 50/1000mg twice daily', 'Antidiabetic', 0],
        ['Galvus Met', 'Vildagliptin + Metformin', 'Novartis', 'DRAP-152', 'Type 2 Diabetes', '50/500mg or 50/1000mg twice daily', 'Antidiabetic', 0],
        ['Invokana', 'Canagliflozin', 'Johnson & Johnson', 'DRAP-153', 'Type 2 Diabetes', '100mg-300mg daily', 'Antidiabetic (SGLT2)', 0],
        ['Forxiga', 'Dapagliflozin', 'AstraZeneca', 'DRAP-154', 'Type 2 Diabetes, heart failure', '5mg-10mg daily', 'Antidiabetic (SGLT2)', 0],
        ['Trulicity', 'Dulaglutide', 'Eli Lilly', 'DRAP-155', 'Type 2 Diabetes', '0.75mg-1.5mg weekly injection', 'Antidiabetic (GLP-1)', 0],
        ['Victoza', 'Liraglutide', 'Novo Nordisk', 'DRAP-156', 'Type 2 Diabetes, obesity', '0.6mg-1.8mg daily injection', 'Antidiabetic (GLP-1)', 0],
        ['Insulatard', 'Isophane Insulin (NPH)', 'Novo Nordisk', 'DRAP-157', 'Type 1/Type 2 Diabetes', 'As prescribed by doctor', 'Insulin', 0],
        ['Lantus', 'Insulin Glargine', 'Sanofi Pakistan', 'DRAP-158', 'Type 1/Type 2 Diabetes', 'Once daily at bedtime', 'Insulin (Long-acting)', 0],
        ['NovoRapid', 'Insulin Aspart', 'Novo Nordisk', 'DRAP-159', 'Type 1/Type 2 Diabetes', 'Before meals', 'Insulin (Rapid-acting)', 0],
        ['Onglyza', 'Saxagliptin', 'AstraZeneca', 'DRAP-160', 'Type 2 Diabetes', '2.5mg-5mg daily', 'Antidiabetic (DPP-4)', 0],
        ['Byetta', 'Exenatide', 'AstraZeneca', 'DRAP-161', 'Type 2 Diabetes', '5mcg-10mcg twice daily injection', 'Antidiabetic (GLP-1)', 0],
        ['Glucobay', 'Acarbose', 'Bayer Pakistan', 'DRAP-162', 'Type 2 Diabetes', '25mg-100mg with meals', 'Antidiabetic (Alpha-glucosidase)', 0],

        // ── Hypertension / Blood Pressure (Extended) ─────────────────────────
        ['Vasotec', 'Enalapril', 'MSD', 'DRAP-163', 'Hypertension, heart failure', '5mg-20mg daily', 'ACE Inhibitor', 0],
        ['Zestril', 'Lisinopril', 'AstraZeneca', 'DRAP-164', 'Hypertension, heart failure', '5mg-40mg daily', 'ACE Inhibitor', 0],
        ['Capoten', 'Captopril', 'Bristol-Myers Squibb', 'DRAP-165', 'Hypertension', '25mg-50mg twice daily', 'ACE Inhibitor', 0],
        ['Diovan', 'Valsartan', 'Novartis', 'DRAP-166', 'Hypertension, heart failure', '80mg-160mg daily', 'ARB', 0],
        ['Micardis', 'Telmisartan', 'Boehringer Ingelheim', 'DRAP-167', 'Hypertension', '40mg-80mg daily', 'ARB', 0],
        ['Aprovel', 'Irbesartan', 'Sanofi Pakistan', 'DRAP-168', 'Hypertension, diabetic nephropathy', '150mg-300mg daily', 'ARB', 0],
        ['Dilatrend', 'Carvedilol', 'Roche Pakistan', 'DRAP-169', 'Hypertension, heart failure', '6.25mg-25mg twice daily', 'Beta Blocker', 0],
        ['Nebilet', 'Nebivolol', 'Menarini', 'DRAP-170', 'Hypertension', '5mg daily', 'Beta Blocker', 0],
        ['Cardizem', 'Diltiazem', 'Sanofi Pakistan', 'DRAP-171', 'Hypertension, angina, arrhythmia', '60mg-120mg twice daily', 'Calcium Channel Blocker', 0],
        ['Isoptin', 'Verapamil', 'Abbott Pakistan', 'DRAP-172', 'Hypertension, angina, arrhythmia', '80mg-120mg 3 times daily', 'Calcium Channel Blocker', 0],
        ['Hydralazine', 'Hydralazine', 'Various', 'DRAP-173', 'Hypertension', '25mg-50mg 3 times daily', 'Vasodilator', 0],
        ['Minipress', 'Prazosin', 'Pfizer Pakistan', 'DRAP-174', 'Hypertension', '1mg-5mg twice daily', 'Alpha-1 Blocker', 0],
        ['Catapres', 'Clonidine', 'Boehringer Ingelheim', 'DRAP-175', 'Hypertension', '0.1mg-0.3mg twice daily', 'Alpha-2 Agonist', 0],
        ['Natrilix', 'Indapamide', 'Servier', 'DRAP-176', 'Hypertension, edema', '1.5mg-2.5mg daily', 'Diuretic', 0],
        ['Hydrochlorothiazide', 'Hydrochlorothiazide', 'Various', 'DRAP-177', 'Hypertension, edema', '12.5mg-25mg daily', 'Diuretic (Thiazide)', 0],
        ['Dytor', 'Torsemide', 'Cipla', 'DRAP-178', 'Edema, hypertension', '5mg-20mg daily', 'Diuretic (Loop)', 0],

        // ── Heart / Cardiac (Extended) ───────────────────────────────────────
        ['Warfarin', 'Warfarin', 'Various', 'DRAP-179', 'Blood clot prevention', 'Dose individualised by INR', 'Anticoagulant', 0],
        ['Xarelto', 'Rivaroxaban', 'Bayer Pakistan', 'DRAP-180', 'DVT, AFib stroke prevention', '10mg-20mg daily', 'Anticoagulant (NOAC)', 0],
        ['Eliquis', 'Apixaban', 'Bristol-Myers Squibb', 'DRAP-181', 'DVT, AFib stroke prevention', '2.5mg-5mg twice daily', 'Anticoagulant (NOAC)', 0],
        ['Brilinta', 'Ticagrelor', 'AstraZeneca', 'DRAP-182', 'Acute coronary syndrome', '90mg twice daily', 'Antiplatelet', 0],
        ['Efient', 'Prasugrel', 'Eli Lilly', 'DRAP-183', 'Acute coronary syndrome', '10mg daily', 'Antiplatelet', 0],
        ['Imdur', 'Isosorbide Mononitrate', 'AstraZeneca', 'DRAP-184', 'Angina prevention', '30mg-60mg daily', 'Nitrate', 0],
        ['Entresto', 'Sacubitril + Valsartan', 'Novartis', 'DRAP-185', 'Heart failure', '24/26mg to 97/103mg twice daily', 'ARNI', 0],
        ['Corlanor', 'Ivabradine', 'Servier', 'DRAP-186', 'Heart failure, angina', '5mg-7.5mg twice daily', 'HCN Channel Blocker', 0],
        ['Cordarone', 'Amiodarone', 'Sanofi Pakistan', 'DRAP-187', 'Arrhythmias', '200mg daily', 'Antiarrhythmic', 0],
        ['Cardace', 'Ramipril', 'Sanofi Pakistan', 'DRAP-188', 'Hypertension, post-MI', '2.5mg-10mg daily', 'ACE Inhibitor', 0],
        ['Ecotrin', 'Aspirin (Low-dose)', 'GSK Pakistan', 'DRAP-189', 'Heart attack/stroke prevention', '75mg-150mg daily', 'Antiplatelet', 0],
        ['Clopivas', 'Clopidogrel', 'Getz Pharma', 'DRAP-190', 'Blood clot prevention', '75mg daily', 'Antiplatelet', 0],

        // ── Asthma / Respiratory (Extended) ──────────────────────────────────
        ['Atrovent', 'Ipratropium Bromide', 'Boehringer Ingelheim', 'DRAP-191', 'COPD, asthma', '2 puffs 4 times daily', 'Bronchodilator (Anticholinergic)', 0],
        ['Spiriva', 'Tiotropium', 'Boehringer Ingelheim', 'DRAP-192', 'COPD maintenance', '1 inhalation daily', 'Bronchodilator (LAMA)', 0],
        ['Advair Diskus', 'Salmeterol + Fluticasone', 'GSK Pakistan', 'DRAP-193', 'Asthma, COPD', '1 inhalation twice daily', 'Corticosteroid/Bronchodilator', 0],
        ['Flixotide', 'Fluticasone Propionate', 'GSK Pakistan', 'DRAP-194', 'Asthma maintenance', '50mcg-250mcg twice daily', 'Corticosteroid (Inhaled)', 0],
        ['Nasonex', 'Mometasone Furoate', 'MSD', 'DRAP-195', 'Allergic rhinitis, nasal polyps', '2 sprays each nostril daily', 'Corticosteroid (Nasal)', 0],
        ['Flonase', 'Fluticasone Nasal', 'GSK Pakistan', 'DRAP-196', 'Allergic rhinitis', '1-2 sprays each nostril daily', 'Corticosteroid (Nasal)', 0],
        ['Relvar Ellipta', 'Vilanterol + Fluticasone', 'GSK Pakistan', 'DRAP-197', 'Asthma, COPD', '1 inhalation daily', 'Corticosteroid/Bronchodilator', 0],
        ['Montelukast', 'Montelukast', 'Various', 'DRAP-198', 'Asthma, allergic rhinitis', '10mg at night', 'Leukotriene Receptor Antagonist', 0],

        // ── Allergy (Extended) ───────────────────────────────────────────────
        ['Allegra', 'Fexofenadine', 'Sanofi Pakistan', 'DRAP-199', 'Seasonal allergies, hives', '120mg-180mg daily', 'Antihistamine', 0],
        ['Reactine', 'Cetirizine', 'Johnson & Johnson', 'DRAP-200', 'Allergies, hives', '10mg daily', 'Antihistamine', 0],
        ['Clarinex', 'Desloratadine', 'MSD', 'DRAP-201', 'Allergic rhinitis', '5mg daily', 'Antihistamine', 0],
        ['Bilaxten', 'Bilastine', 'Menarini', 'DRAP-202', 'Allergic rhinitis, urticaria', '20mg daily', 'Antihistamine', 0],
        ['Rupafin', 'Rupatadine', 'Uriach', 'DRAP-203', 'Allergic rhinitis, urticaria', '10mg daily', 'Antihistamine', 0],

        // ── Thyroid ──────────────────────────────────────────────────────────
        ['Thyrox', 'Levothyroxine Sodium', 'Martin Dow', 'DRAP-204', 'Hypothyroidism', '25mcg-150mcg daily', 'Thyroid Hormone', 0],
        ['Eltroxin', 'Levothyroxine Sodium', 'GSK Pakistan', 'DRAP-205', 'Hypothyroidism', '50mcg-200mcg daily', 'Thyroid Hormone', 0],
        ['Liothyronine', 'Liothyronine (T3)', 'Various', 'DRAP-206', 'Severe hypothyroidism', '5mcg-25mcg daily', 'Thyroid Hormone', 0],

        // ── Kidney Disease ───────────────────────────────────────────────────
        ['Renagel', 'Sevelamer', 'Sanofi Pakistan', 'DRAP-207', 'High phosphate in CKD', '800mg-1600mg with meals', 'Phosphate Binder', 0],
        ['Ketosteril', 'Keto-analogues of Amino Acids', 'Fresenius Kabi', 'DRAP-208', 'Chronic kidney disease', '4-8 tablets with meals', 'Amino Acid Supplement', 0],
        ['Eprex', 'Epoetin Alfa', 'Johnson & Johnson', 'DRAP-209', 'Anemia in CKD', 'As prescribed by nephrologist', 'Erythropoietin', 0],
        ['Rocaltrol', 'Calcitriol', 'Roche Pakistan', 'DRAP-210', 'CKD bone disease, low calcium', '0.25mcg-0.5mcg daily', 'Vitamin D Analogue', 0],
        ['Kayexalate', 'Sodium Polystyrene Sulfonate', 'Sanofi Pakistan', 'DRAP-211', 'High potassium (hyperkalemia)', '15g-30g daily', 'Potassium Binder', 0],
        ['Alphad3', 'Alfacalcidol', 'Leo Pharma', 'DRAP-212', 'CKD bone disease', '0.25mcg-1mcg daily', 'Vitamin D Analogue', 0],

        // ── Liver Disease ────────────────────────────────────────────────────
        ['Hepa-Merz', 'L-Ornithine L-Aspartate', 'Merz Pharma', 'DRAP-213', 'Liver disease, hepatic encephalopathy', '3g-6g daily', 'Hepatoprotective', 0],
        ['Udiliv', 'Ursodeoxycholic Acid', 'Abbott Pakistan', 'DRAP-214', 'Cholestatic liver disease, gallstones', '250mg-500mg twice daily', 'Hepatoprotective', 0],
        ['Silybon', 'Silymarin (Milk Thistle)', 'Micro Labs', 'DRAP-215', 'Liver support', '140mg-420mg daily', 'Hepatoprotective', 0],
        ['Heptral', 'Ademetionine (SAMe)', 'Abbott Pakistan', 'DRAP-216', 'Liver disease, cholestasis', '400mg-800mg daily', 'Hepatoprotective', 0],

        // ── Mental Health (Extended) ─────────────────────────────────────────
        ['Wellbutrin', 'Bupropion', 'GSK Pakistan', 'DRAP-217', 'Depression, smoking cessation', '150mg-300mg daily', 'Antidepressant (NDRI)', 0],
        ['Effexor', 'Venlafaxine', 'Pfizer Pakistan', 'DRAP-218', 'Depression, anxiety', '37.5mg-150mg daily', 'Antidepressant (SNRI)', 0],
        ['Remeron', 'Mirtazapine', 'MSD', 'DRAP-219', 'Depression with insomnia/weight loss', '15mg-45mg at night', 'Antidepressant (NaSSA)', 0],
        ['Abilify', 'Aripiprazole', 'Otsuka', 'DRAP-220', 'Schizophrenia, bipolar, depression adjunct', '5mg-30mg daily', 'Antipsychotic (Atypical)', 0],
        ['Lamictal', 'Lamotrigine', 'GSK Pakistan', 'DRAP-221', 'Epilepsy, bipolar maintenance', '25mg-200mg daily', 'Anticonvulsant/Mood Stabilizer', 0],
        ['Depakote', 'Valproate Semisodium', 'Abbott Pakistan', 'DRAP-222', 'Epilepsy, bipolar, migraine prevention', '250mg-1000mg daily', 'Anticonvulsant/Mood Stabilizer', 0],
        ['Cymbalta', 'Duloxetine', 'Eli Lilly', 'DRAP-223', 'Depression, neuropathic pain, fibromyalgia', '30mg-60mg daily', 'Antidepressant (SNRI)', 0],
        ['Pristiq', 'Desvenlafaxine', 'Pfizer Pakistan', 'DRAP-224', 'Depression', '50mg daily', 'Antidepressant (SNRI)', 0],
        ['Lithium', 'Lithium Carbonate', 'Various', 'DRAP-225', 'Bipolar disorder', '300mg-900mg daily', 'Mood Stabilizer', 0],
        ['Invega', 'Paliperidone', 'Johnson & Johnson', 'DRAP-226', 'Schizophrenia', '3mg-12mg daily', 'Antipsychotic (Atypical)', 0],

        // ── Women's Health ───────────────────────────────────────────────────
        ['Folvite', 'Folic Acid 5mg', 'Pfizer Pakistan', 'DRAP-227', 'Pregnancy support, anemia prevention', '5mg daily during pregnancy', 'Vitamin', 0],
        ['Pregnacare', 'Multivitamin (Prenatal)', 'Vitabiotics', 'DRAP-228', 'Pregnancy nutritional support', '1 tablet daily', 'Prenatal Supplement', 0],
        ['Ovacare', 'Multivitamin + Myo-Inositol', 'Meyer Organics', 'DRAP-229', 'PCOS, fertility support', '1 sachet daily', 'Fertility Supplement', 0],
        ['Dostinex', 'Cabergoline', 'Pfizer Pakistan', 'DRAP-230', 'Hyperprolactinemia, fertility', '0.25mg-1mg twice weekly', 'Dopamine Agonist', 0],
        ['Duphaston', 'Dydrogesterone', 'Abbott Pakistan', 'DRAP-231', 'Threatened miscarriage, menstrual disorders', '10mg twice daily', 'Progestogen', 0],
        ['Primolut-N', 'Norethisterone', 'Bayer Pakistan', 'DRAP-232', 'Menstrual disorders, endometriosis', '5mg 2-3 times daily', 'Progestogen', 0],
        ['Cyclogest', 'Progesterone', 'Actavis', 'DRAP-233', 'Luteal phase support, PMS', '200mg-400mg daily (vaginal)', 'Progestogen', 0],

        // ── Rheumatology / Autoimmune ────────────────────────────────────────
        ['Methotrexate', 'Methotrexate', 'Various', 'DRAP-234', 'Rheumatoid arthritis, psoriasis', '7.5mg-25mg weekly', 'Immunosuppressant (DMARD)', 0],
        ['Plaquenil', 'Hydroxychloroquine', 'Sanofi Pakistan', 'DRAP-235', 'Lupus, rheumatoid arthritis, malaria', '200mg-400mg daily', 'Antimalarial/DMARD', 0],
        ['Sulfasalazine', 'Sulfasalazine', 'Various', 'DRAP-236', 'Rheumatoid arthritis, IBD', '500mg-2g daily', 'DMARD', 0],
        ['Leflunomide', 'Leflunomide', 'Sanofi Pakistan', 'DRAP-237', 'Rheumatoid arthritis', '10mg-20mg daily', 'Immunosuppressant (DMARD)', 0],
        ['Colchicine', 'Colchicine', 'Various', 'DRAP-238', 'Gout attacks, familial Mediterranean fever', '0.5mg-1.5mg daily', 'Antigout', 0],

        // ── Ophthalmology ────────────────────────────────────────────────────
        ['Xalatan', 'Latanoprost', 'Pfizer Pakistan', 'DRAP-239', 'Glaucoma', '1 drop nightly', 'Prostaglandin Analogue', 0],
        ['Timoptic', 'Timolol', 'MSD', 'DRAP-240', 'Glaucoma', '1 drop twice daily', 'Beta Blocker (Ophthalmic)', 0],
        ['Tobrex', 'Tobramycin', 'Novartis', 'DRAP-241', 'Eye infections', '1-2 drops every 4 hours', 'Antibiotic (Ophthalmic)', 0],

        // ── Dermatology (Extended) ───────────────────────────────────────────
        ['Tretinoin', 'Tretinoin', 'Johnson & Johnson', 'DRAP-242', 'Acne, photoaging', 'Apply nightly', 'Retinoid (Topical)', 0],
        ['Adapalene', 'Adapalene', 'Galderma', 'DRAP-243', 'Acne vulgaris', 'Apply nightly', 'Retinoid (Topical)', 0],
        ['Elidel', 'Pimecrolimus', 'Novartis', 'DRAP-244', 'Atopic dermatitis (eczema)', 'Apply twice daily', 'Calcineurin Inhibitor', 0],
        ['Protopic', 'Tacrolimus', 'Astellas', 'DRAP-245', 'Atopic dermatitis (eczema)', 'Apply twice daily', 'Calcineurin Inhibitor', 0],

        // ── GI / Hepatology (Extended) ───────────────────────────────────────
        ['Mesacol', 'Mesalazine', 'Sun Pharma', 'DRAP-246', 'Ulcerative colitis, Crohns disease', '800mg-1.6g 3 times daily', 'Anti-inflammatory (GI)', 0],
        ['Pentasa', 'Mesalazine', 'Ferring', 'DRAP-247', 'Ulcerative colitis', '1g-2g twice daily', 'Anti-inflammatory (GI)', 0],
        ['Colospas', 'Mebeverine', 'Abbott Pakistan', 'DRAP-248', 'Irritable bowel syndrome', '135mg-200mg 3 times daily', 'Antispasmodic (GI)', 0],
        ['Librax', 'Chlordiazepoxide + Clidinium', 'Roche Pakistan', 'DRAP-249', 'IBS, anxiety with GI symptoms', '1-2 capsules before meals', 'Antispasmodic/Anxiolytic', 0],

        // ── Additional Cardiovascular ────────────────────────────────────────
        ['Cardura', 'Doxazosin', 'Pfizer Pakistan', 'DRAP-250', 'Hypertension, BPH', '1mg-8mg daily', 'Alpha-1 Blocker', 0],
        ['Zaroxolyn', 'Metolazone', 'Various', 'DRAP-251', 'Edema, resistant hypertension', '2.5mg-10mg daily', 'Diuretic (Thiazide-like)', 0],
        ['Eplerenone', 'Eplerenone', 'Pfizer Pakistan', 'DRAP-252', 'Heart failure, hypertension', '25mg-50mg daily', 'Diuretic (Potassium-sparing)', 0],
        ['Amiodar', 'Amiodarone', 'Sami Pharmaceuticals', 'DRAP-253', 'Cardiac arrhythmias', '200mg 1-3 times daily', 'Antiarrhythmic', 0],

        // ── Pain (Extended) ──────────────────────────────────────────────────
        ['Lyrica', 'Pregabalin', 'Pfizer Pakistan', 'DRAP-254', 'Neuropathic pain, fibromyalgia, epilepsy', '75mg-300mg daily', 'Anticonvulsant/Neuropathic Pain', 0],
        ['Neurontin', 'Gabapentin', 'Pfizer Pakistan', 'DRAP-255', 'Neuropathic pain, epilepsy', '300mg-900mg 3 times daily', 'Anticonvulsant/Neuropathic Pain', 0],
        ['Ultracet', 'Tramadol + Paracetamol', 'Johnson & Johnson', 'DRAP-256', 'Moderate to severe pain', '1-2 tablets every 6 hours', 'Opioid/Analgesic Combination', 0],

        // ── Urology ──────────────────────────────────────────────────────────
        ['Flomax', 'Tamsulosin', 'Boehringer Ingelheim', 'DRAP-257', 'Benign prostatic hyperplasia (BPH)', '0.4mg daily', 'Alpha-1 Blocker (Urology)', 0],
        ['Proscar', 'Finasteride', 'MSD', 'DRAP-258', 'BPH, male pattern baldness', '5mg daily (BPH), 1mg (hair)', '5-Alpha Reductase Inhibitor', 0],

        // ── Additional Antibiotics ───────────────────────────────────────────
        ['Tazocin', 'Piperacillin + Tazobactam', 'Pfizer Pakistan', 'DRAP-259', 'Severe hospital infections', '4.5g IV every 6-8 hours', 'Antibiotic (Broad-spectrum)', 0],
        ['Merrem', 'Meropenem', 'AstraZeneca', 'DRAP-260', 'Severe resistant infections', '1g-2g IV every 8 hours', 'Antibiotic (Carbapenem)', 0],
        ['Linezolid', 'Linezolid', 'Pfizer Pakistan', 'DRAP-261', 'MRSA, VRE infections', '600mg twice daily', 'Antibiotic (Oxazolidinone)', 0],
        ['Tigecycline', 'Tigecycline', 'Pfizer Pakistan', 'DRAP-262', 'Complicated infections', '50mg IV every 12 hours', 'Antibiotic (Glycylcycline)', 0],

        // ── Endocrine ────────────────────────────────────────────────────────
        ['Metformin XR', 'Metformin Extended Release', 'Various', 'DRAP-263', 'Type 2 Diabetes', '500mg-2000mg daily with evening meal', 'Antidiabetic', 0],
        ['Actos', 'Pioglitazone', 'Takeda', 'DRAP-264', 'Type 2 Diabetes', '15mg-45mg daily', 'Antidiabetic (TZD)', 0],

        // ── Bone Health ──────────────────────────────────────────────────────
        ['Fosamax', 'Alendronate', 'MSD', 'DRAP-265', 'Osteoporosis', '70mg weekly', 'Bisphosphonate', 0],
        ['Boniva', 'Ibandronate', 'Roche Pakistan', 'DRAP-266', 'Osteoporosis', '150mg monthly', 'Bisphosphonate', 0],
        ['Prolia', 'Denosumab', 'Amgen', 'DRAP-267', 'Osteoporosis', '60mg injection every 6 months', 'RANKL Inhibitor', 0]
    ];

    for (let med of medicines) {
        db.run("INSERT OR IGNORE INTO medicines (brandName, genericName, manufacturer, drapRegNumber, usage_, dosage, category, recallStatus) VALUES (?,?,?,?,?,?,?,?)", med);
    }
    
    // Seed drug interactions (30 real interactions)
    const interactions = [
        ['Aspirin', 'Ibuprofen', 'High', 'Concurrent use increases risk of gastrointestinal bleeding and reduces aspirin efficacy.'],
        ['Paracetamol', 'Warfarin', 'Moderate', 'Prolonged regular use of paracetamol may enhance the anticoagulant effect of warfarin.'],
        ['Amoxicillin', 'Methotrexate', 'High', 'Penicillins can reduce the excretion of methotrexate, causing potential toxicity.'],
        ['Omeprazole', 'Clopidogrel', 'High', 'Omeprazole can reduce the antiplatelet effect of clopidogrel, increasing cardiovascular risk.'],
        ['Metronidazole', 'Alcohol', 'Severe', 'May cause a disulfiram-like reaction (severe nausea, vomiting, flushing, tachycardia).'],
        ['Ciprofloxacin', 'Calcium + Vitamin D', 'Moderate', 'Calcium decreases the absorption of ciprofloxacin, reducing its effectiveness.'],
        ['Atorvastatin', 'Clarithromycin', 'High', 'Clarithromycin strongly increases atorvastatin levels, risking muscle toxicity (rhabdomyolysis).'],
        ['Simvastatin', 'Amlodipine', 'Moderate', 'Amlodipine can increase simvastatin exposure; simvastatin dose should be limited.'],
        ['Metformin', 'Iodinated Contrast Media', 'Severe', 'Risk of lactic acidosis; metformin should be paused before imaging procedures.'],
        ['Azithromycin', 'Ondansetron', 'Moderate', 'Both can prolong the QT interval, increasing risk of arrhythmias.'],
        ['Fluoxetine', 'Tramadol', 'High', 'Increased risk of serotonin syndrome and potential reduction of tramadol efficacy.'],
        ['Levothyroxine', 'Iron (Polymaltose Complex)', 'Moderate', 'Iron supplements reduce levothyroxine absorption; separate doses by 4 hours.'],
        ['Losartan', 'Spironolactone', 'High', 'Increased risk of dangerous hyperkalemia (high potassium).'],
        ['Salbutamol', 'Propranolol', 'Severe', 'Propranolol, a non-selective beta blocker, opposes the bronchodilating effect of salbutamol.'],
        ['Diclofenac Sodium', 'Lisinopril', 'High', 'NSAIDs can reduce the antihypertensive effect and increase the risk of kidney injury.'],
        ['Warfarin', 'Ibuprofen', 'Severe', 'NSAIDs dramatically increase bleeding risk when combined with warfarin.'],
        ['Warfarin', 'Aspirin', 'Severe', 'Both affect blood clotting; concurrent use greatly increases bleeding risk unless specifically directed.'],
        ['Digoxin', 'Furosemide', 'High', 'Furosemide can lower potassium, increasing the risk of digoxin toxicity.'],
        ['Metformin', 'Furosemide', 'Moderate', 'Furosemide may increase metformin plasma levels; monitor blood glucose closely.'],
        ['Lisinopril', 'Spironolactone', 'High', 'Both increase potassium levels; combined use risks dangerous hyperkalemia.'],
        ['Sitagliptin', 'ACE Inhibitor', 'Moderate', 'Increased risk of angioedema when DPP-4 inhibitors are combined with ACE inhibitors.'],
        ['Amiodarone', 'Digoxin', 'High', 'Amiodarone increases digoxin levels by 70-100%; digoxin dose must be reduced.'],
        ['Alprazolam', 'Fluoxetine', 'Moderate', 'Fluoxetine increases alprazolam levels, enhancing sedation and psychomotor impairment.'],
        ['Sertraline', 'Tramadol', 'High', 'Increased risk of serotonin syndrome; symptoms include agitation, tremor, and hyperthermia.'],
        ['Valsartan', 'Lithium', 'High', 'ARBs can increase lithium levels and toxicity; monitor lithium levels closely.'],
        ['Hydroxychloroquine', 'Azithromycin', 'High', 'Both prolong QT interval; concurrent use increases risk of cardiac arrhythmias.'],
        ['Rivaroxaban', 'Clarithromycin', 'High', 'Clarithromycin increases rivaroxaban levels, raising the risk of major bleeding.'],
        ['Metformin', 'Alcohol', 'Moderate', 'Excessive alcohol intake with metformin increases the risk of lactic acidosis.'],
        ['Prednisolone', 'Ibuprofen', 'Moderate', 'Combined use increases the risk of gastrointestinal ulceration and bleeding.']
    ];

    for (let inter of interactions) {
        db.run("INSERT OR IGNORE INTO medicine_interactions (genericName1, genericName2, severity, description) VALUES (?,?,?,?)", inter);
    }

};

