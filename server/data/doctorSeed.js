/**
 * Verified hackathon demo doctors.
 * The Doctor Portal is restricted to exactly these two clinicians.
 * On every startup the doctors table is reset to contain ONLY these records.
 */
const bcrypt = require('bcryptjs');

const VERIFIED_DOCTORS = [
    {
        name: 'Dr Faisal Maqsood',
        doctorId: 'DR-FM-001',
        password: 'Faisal@MedVigil2026',
        specialization: 'Family Medicine',
        title: 'Consultant Family Physician',
        qualification: 'MBBS from Russia',
        photo: 'https://ui-avatars.com/api/?name=Faisal+Maqsood&background=0D9488&color=fff&size=256&bold=true&length=2',
        intro: 'Experienced family physician with 23 years in primary care, preventive medicine, and chronic disease management for all age groups.',
        availability: 'Available',
        experience: '23 Years Experience',
        email: 'faisal.maqsood.clinical@medvigilai.com',
        hospital: 'MedVigil Telehealth Unit'
    },
    {
        name: 'Dr Aneeqa Talib',
        doctorId: 'DR-AT-002',
        password: 'Aneeqa@MedVigil2026',
        specialization: 'Internal Medicine',
        title: 'Consultant Internal Medicine',
        qualification: 'Medical Student (Final Year) — Clinical Training in Progress',
        photo: 'https://ui-avatars.com/api/?name=Aneeqa+Talib&background=2563EB&color=fff&size=256&bold=true&length=2',
        intro: 'Final-year medical student at Bakhtawar Amin Medical & Dental College, Multan, currently completing clinical training with a focus on internal medicine and patient care.',
        availability: 'Available',
        experience: 'Clinical Training in Progress',
        email: 'aneeqa.talib.healthcare@medvigilai.com',
        hospital: 'MedVigil Telehealth Unit'
    }
];

module.exports = function seedDoctors(db) {
    // Remove any previously seeded or manually registered doctors.
    // This guarantees the demo environment contains ONLY the two verified clinicians.
    db.run('DELETE FROM doctors');

    const stmt = db.prepare(`
        INSERT INTO doctors (
            name, doctorId, passwordHash, specialization, title, qualification,
            photo, intro, availability, experience, email, hospital
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const doc of VERIFIED_DOCTORS) {
        const passwordHash = bcrypt.hashSync(doc.password, bcrypt.genSaltSync(10));
        stmt.run([
            doc.name,
            doc.doctorId,
            passwordHash,
            doc.specialization,
            doc.title,
            doc.qualification,
            doc.photo,
            doc.intro,
            doc.availability,
            doc.experience,
            doc.email,
            doc.hospital
        ]);
    }

    stmt.free();
    console.log(`Seeded ${VERIFIED_DOCTORS.length} verified demo doctors`);
};
