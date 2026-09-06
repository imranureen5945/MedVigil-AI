const { prepareAndGet, prepareAndAll, runQuery } = require('../config/database');

const Interaction = {
    findInteractions(generic1, generic2) {
        return prepareAndAll(
            `SELECT * FROM medicine_interactions 
             WHERE (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))
                OR (LOWER(genericName1) = LOWER(?) AND LOWER(genericName2) = LOWER(?))`,
            [generic1, generic2, generic2, generic1]
        );
    },
    findByGeneric(genericName) {
        const pattern = `%${genericName.toLowerCase()}%`;
        return prepareAndAll(
            `SELECT * FROM medicine_interactions 
             WHERE LOWER(genericName1) LIKE ? OR LOWER(genericName2) LIKE ?`,
            [pattern, pattern]
        );
    },
    findAll() {
        return prepareAndAll("SELECT * FROM medicine_interactions");
    }
};

module.exports = Interaction;
