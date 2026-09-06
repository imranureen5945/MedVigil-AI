const { runQuery } = require('../config/database');

exports.createNotification = (userId, type, title, message) => {
    runQuery("INSERT INTO notifications (userId, type, title, message) VALUES (?, ?, ?, ?)", [userId, type, title, message]);
};
