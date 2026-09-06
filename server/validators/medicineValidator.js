const validateAddMedication = (req, res, next) => {
    const { familyMemberId, medicineId } = req.body;
    if (!familyMemberId || isNaN(Number(familyMemberId))) {
        return res.status(400).json({ success: false, message: 'Valid familyMemberId is required.' });
    }
    if (!medicineId || isNaN(Number(medicineId))) {
        return res.status(400).json({ success: false, message: 'Valid medicineId is required.' });
    }
    next();
};

const validateSearchMedicine = (req, res, next) => {
    const query = req.query.q;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Search query "q" parameter is required.' });
    }
    next();
};

module.exports = {
    validateAddMedication,
    validateSearchMedicine
};
