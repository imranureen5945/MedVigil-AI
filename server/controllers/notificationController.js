const { prepareAndAll, runQuery } = require('../config/database');

exports.getNotifications = (req, res, next) => {
    try {
        const notifications = prepareAndAll("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC", [req.user.id]);
        res.json(notifications);
    } catch(err) {
        next(err);
    }
};

exports.markRead = (req, res, next) => {
    try {
        runQuery("UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?", [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.markAllRead = (req, res, next) => {
    try {
        runQuery("UPDATE notifications SET isRead = 1 WHERE userId = ?", [req.user.id]);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};
