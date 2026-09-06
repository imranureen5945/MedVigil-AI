const symptomMap = {
    'headache': ['Panadol', 'Disprin', 'Nurofen', 'Ponstan'],
    'fever': ['Panadol', 'Calpol', 'Brufen', 'Tylenol'],
    'stomach ache': ['Risek', 'Flagyl', 'Buscopan', 'Zantac'],
    'acidity': ['Risek', 'Gaviscon', 'Motilium', 'Zantac'],
    'infection': ['Augmentin', 'Amoxil', 'Septran', 'Ciproxin'],
    'pain': ['Ponstan', 'Brufen', 'Voltaren', 'Tramal'],
    'migraine': ['Panadol', 'Nurofen', 'Cafergot', 'Sumatriptan'],
    'nausea': ['Motilium', 'Gravinate', 'Maxolon'],
    'diarrhea': ['Imodium', 'Flagyl', 'Smecta', 'Entamizole'],
    'constipation': ['Dulcolax', 'Lactulose', 'Skilax', 'Cremaffin'],
    'allergies': ['Zyrtec', 'Claritin', 'Atarax', 'Avil'],
    'cough': ['Corex', 'Benadryl', 'Hydryllin', 'Acefyl'],
    'sore throat': ['Strepsils', 'Lofnac', 'Azomax'],
    'asthma': ['Ventolin', 'Seretide', 'Singulair'],
    'hypertension': ['Concor', 'Lopressor', 'Norvasc', 'Cozaar'],
    'high cholesterol': ['Lipitor', 'Crestor', 'Zocor'],
    'diabetes': ['Glucophage', 'Amaryl', 'Januvia', 'Diamicron'],
    'skin rash': ['Dermovate', 'Betnovate', 'Candid', 'Fucicort'],
    'anxiety': ['Lexotanil', 'Xanax', 'Ativan'],
    'depression': ['Prozac', 'Zoloft', 'Cipralex'],
    'vitamin deficiency': ['Centrum', 'Caltrate', 'Ferosoft', 'Neurobion'],
    'joint pain': ['Arcoxia', 'Voltaren', 'Celebrex', 'Brexin'],
    'backache': ['Ponstan', 'Brufen', 'Muscoril', 'Nuberol Forte'],
    'toothache': ['Synflex', 'Ponstan', 'Brufen', 'Keto'],
    'dizziness': ['Serc', 'Stemetil', 'Cinnarizine']
};

exports.getRelatedMedicines = (symptom) => {
    const meds = symptomMap[symptom.toLowerCase()] || [];
    return {
        medicines: meds,
        disclaimer: 'Please consult a doctor through Doctor Connect for personalized advice.'
    };
};
