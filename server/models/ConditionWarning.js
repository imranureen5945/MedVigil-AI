const { prepareAndGet, prepareAndAll } = require('../config/database');

// Condition / special-status warning rules (kidney disease x NSAIDs,
// pregnancy x fluoroquinolones, child x aspirin, etc.)
const ConditionWarning = {
    findByConditionKey(conditionKey) {
        return prepareAndAll(
            "SELECT * FROM condition_warnings WHERE LOWER(conditionKey) = LOWER(?)",
            [conditionKey]
        );
    },
    findAll() {
        return prepareAndAll("SELECT * FROM condition_warnings ORDER BY conditionKey");
    }
};

module.exports = ConditionWarning;
