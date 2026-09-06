const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const ALL_FIELDS = 'id, name, doctorId, passwordHash, specialization, title, qualification, photo, intro, availability, experience, email, hospital';
const PUBLIC_FIELDS = 'id, name, doctorId, specialization, title, qualification, photo, intro, availability, experience, email, hospital';

const Doctor = {
    findById(id) {
        return prepareAndGet(`SELECT ${ALL_FIELDS} FROM doctors WHERE id = ?`, [id]);
    },
    findByDoctorId(doctorId) {
        return prepareAndGet("SELECT * FROM doctors WHERE doctorId = ?", [doctorId]);
    },
    findByEmail(email) {
        return prepareAndGet("SELECT * FROM doctors WHERE LOWER(email) = LOWER(?)", [email]);
    },
    findAll() {
        return prepareAndAll(`SELECT ${PUBLIC_FIELDS} FROM doctors ORDER BY name`);
    },
    create({ name, doctorId, passwordHash, specialization, title, qualification, photo, intro, availability, experience, email, hospital }) {
        const res = runQuery(
            `INSERT INTO doctors (
                name, doctorId, passwordHash, specialization, title, qualification,
                photo, intro, availability, experience, email, hospital
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, doctorId, passwordHash, specialization,
                title || null, qualification || null, photo || null, intro || null,
                availability || 'Available', experience || null, email || null, hospital || null
            ]
        );
        return this.findById(res.lastInsertRowid);
    }
};

module.exports = Doctor;
