const { prepareAndGet, prepareAndAll } = require('../config/database');

// Cross-reactive allergen families (e.g. Penicillins). Used by the medication
// safety engine so a recorded allergy to one member flags other members of
// the same family.
const AllergenGroup = {
    findGroupsForMember(memberName) {
        return prepareAndAll(
            "SELECT DISTINCT groupName FROM allergen_groups WHERE LOWER(memberName) = LOWER(?)",
            [String(memberName).trim()]
        );
    },
    findMembersOfGroup(groupName) {
        return prepareAndAll(
            "SELECT memberName FROM allergen_groups WHERE LOWER(groupName) = LOWER(?)",
            [groupName]
        );
    },
    findAll() {
        return prepareAndAll("SELECT * FROM allergen_groups ORDER BY groupName, memberName");
    }
};

module.exports = AllergenGroup;
