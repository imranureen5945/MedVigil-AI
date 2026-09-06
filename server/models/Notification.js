const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const Notification = {
    findByUserId(userId) {
        return prepareAndAll("SELECT * FROM notifications WHERE userId = ? ORDER BY id DESC LIMIT 50", [userId]);
    },
    create({ userId, type, title, message }) {
        const res = runQuery(
            "INSERT INTO notifications (userId, type, title, message) VALUES (?, ?, ?, ?)",
            [userId, type, title, message]
        );
        return prepareAndGet("SELECT * FROM notifications WHERE id = ?", [res.lastInsertRowid]);
    },
    markRead(id, userId) {
        return runQuery("UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?", [id, userId]);
    },
    markAllRead(userId) {
        return runQuery("UPDATE notifications SET isRead = 1 WHERE userId = ?", [userId]);
    }
};

module.exports = Notification;
