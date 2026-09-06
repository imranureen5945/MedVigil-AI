const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const User = {
    findById(id) {
        return prepareAndGet("SELECT id, name, email, role, language, isFirstLogin, activeMemberId, createdAt FROM users WHERE id = ?", [id]);
    },
    findByEmail(email) {
        return prepareAndGet("SELECT * FROM users WHERE email = ?", [email]);
    },
    create({ name, email, passwordHash, role = 'patient', language = 'en' }) {
        const res = runQuery(
            "INSERT INTO users (name, email, passwordHash, role, language, isFirstLogin) VALUES (?, ?, ?, ?, ?, 1)",
            [name, email, passwordHash, role, language]
        );
        return this.findById(res.lastInsertRowid);
    },
    update(id, data) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.language !== undefined) { fields.push('language = ?'); values.push(data.language); }
        if (data.isFirstLogin !== undefined) { fields.push('isFirstLogin = ?'); values.push(data.isFirstLogin); }
        if (data.activeMemberId !== undefined) { fields.push('activeMemberId = ?'); values.push(data.activeMemberId); }
        if (fields.length === 0) return this.findById(id);
        values.push(id);
        runQuery(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
};

module.exports = User;
