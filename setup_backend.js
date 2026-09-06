const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'server');

const dirs = [
    '',
    'config',
    'data',
    'middleware',
    'routes',
    'controllers',
    'services'
];

dirs.forEach(d => {
    const dirPath = path.join(root, d);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const files = {
    'package.json': `{
  "name": "medvigil-server",
  "version": "1.0.0",
  "description": "MedVigil AI Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^11.2.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
`,
    '.env': `MEDICINE_API_KEY=your_medicine_api_key_here
JWT_SECRET=your_secure_jwt_secret_here
DB_PATH=./data/medvigil.db
PORT=5000
OPENFDA_BASE_URL=https://api.fda.gov/drug
`,
    'config/env.js': `require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const jwtSecret = process.env.JWT_SECRET || (
    isProduction ? undefined : 'dev-only-insecure-secret-replace-in-production'
);

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production');
}

module.exports = {
    port: process.env.PORT || 5000,
    jwtSecret,
    dbPath: process.env.DB_PATH || './data/medvigil.db',
    medicineApiKey: process.env.MEDICINE_API_KEY,
    openFdaBaseUrl: process.env.OPENFDA_BASE_URL
};
`,
    'config/database.js': `const Database = require('better-sqlite3');
const path = require('path');
const env = require('./env');
const seed = require('../data/seed');
const fs = require('fs');

let db;

function initDb() {
    const dbDir = path.dirname(path.resolve(__dirname, '..', env.dbPath));
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(path.resolve(__dirname, '..', env.dbPath));

    db.exec(\`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            passwordHash TEXT,
            role TEXT DEFAULT 'patient',
            language TEXT DEFAULT 'en',
            isFirstLogin INTEGER DEFAULT 1,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            doctorId TEXT UNIQUE,
            passwordHash TEXT,
            specialization TEXT
        );

        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT,
            age INTEGER,
            relation TEXT,
            avatar TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brandName TEXT,
            genericName TEXT,
            manufacturer TEXT,
            drapRegNumber TEXT,
            usage TEXT,
            dosage TEXT,
            category TEXT,
            recallStatus INTEGER DEFAULT 0,
            recallDate TEXT,
            isVerified INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS scan_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            medicineId INTEGER,
            scanDate TEXT DEFAULT CURRENT_TIMESTAMP,
            ocrText TEXT,
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id),
            FOREIGN KEY (medicineId) REFERENCES medicines(id)
        );

        CREATE TABLE IF NOT EXISTS safety_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            type TEXT,
            severity TEXT,
            message TEXT,
            isRead INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );

        CREATE TABLE IF NOT EXISTS doctor_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patientId INTEGER,
            doctorId INTEGER,
            message TEXT,
            urgencyTag TEXT DEFAULT 'routine',
            status TEXT DEFAULT 'sent',
            contextSnapshot TEXT,
            reply TEXT,
            isVerified INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            repliedAt TEXT,
            seenAt TEXT,
            FOREIGN KEY (patientId) REFERENCES users(id),
            FOREIGN KEY (doctorId) REFERENCES doctors(id)
        );

        CREATE TABLE IF NOT EXISTS medicine_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            medicineId INTEGER,
            startDate TEXT DEFAULT CURRENT_TIMESTAMP,
            endDate TEXT,
            dosageNotes TEXT,
            isActive INTEGER DEFAULT 1,
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id),
            FOREIGN KEY (medicineId) REFERENCES medicines(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            type TEXT,
            title TEXT,
            message TEXT,
            isRead INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS emergency_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            bloodType TEXT,
            allergies TEXT,
            emergencyContacts TEXT,
            criticalMedications TEXT,
            notes TEXT,
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );
        
        CREATE TABLE IF NOT EXISTS medicine_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            genericName1 TEXT,
            genericName2 TEXT,
            severity TEXT,
            description TEXT
        );
    \`);

    const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    if (usersCount === 0) {
        seed(db);
    }
}

function getDb() {
    if (!db) {
        initDb();
    }
    return db;
}

module.exports = { getDb, initDb };
`,
    'data/seed.js': `const bcrypt = require('bcryptjs');

module.exports = function seed(db) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('doctor123', salt);

    const insertDoctor = db.prepare("INSERT INTO doctors (name, doctorId, passwordHash, specialization) VALUES (?, ?, ?, ?)");
    insertDoctor.run("Dr. Faisal Maqsood", "DR-FM-001", passwordHash, "Family Medicine");
    insertDoctor.run("Dr. Aneeqa Talib", "DR-AT-002", passwordHash, "Internal Medicine");

    const insertMedicine = db.prepare(\`
        INSERT INTO medicines (brandName, genericName, manufacturer, drapRegNumber, usage, dosage, category, recallStatus) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`);

    const medicinesData = [];
    const brands = ['Panadol', 'Augmentin', 'Risek', 'Flagyl', 'Brufen', 'Ponstan', 'Amoxil', 'Septran', 'Calpol', 'Disprin',
                    'Amaryl', 'Glucophage', 'Zestril', 'Concor', 'Lipget', 'Xanax', 'Lexotanil', 'Gravinate', 'Arinac', 'Rigix'];
    const generics = ['Paracetamol', 'Amoxicillin/Clavulanate', 'Omeprazole', 'Metronidazole', 'Ibuprofen', 'Mefenamic Acid', 'Amoxicillin', 'Co-trimoxazole', 'Paracetamol', 'Aspirin',
                      'Glimepiride', 'Metformin', 'Lisinopril', 'Bisoprolol', 'Atorvastatin', 'Alprazolam', 'Bromazepam', 'Dimenhydrinate', 'Ibuprofen/Pseudoephedrine', 'Cetirizine'];
    const manufacturers = ['GSK Pakistan', 'GSK Pakistan', 'Getz Pharma', 'Sanofi-Aventis', 'Abbott', 'Pfizer', 'GSK Pakistan', 'GSK Pakistan', 'GSK Pakistan', 'Reckitt Benckiser',
                           'Sanofi-Aventis', 'Merck', 'Sami Pharmaceuticals', 'Merck', 'Getz Pharma', 'Pfizer', 'Martin Dow', 'Searle', 'Abbott', 'AGP'];
    const categories = ['Analgesic', 'Antibiotic', 'Antacid', 'Antibiotic', 'NSAID', 'NSAID', 'Antibiotic', 'Antibiotic', 'Analgesic', 'Analgesic',
                        'Antidiabetic', 'Antidiabetic', 'Antihypertensive', 'Antihypertensive', 'Lipid-lowering', 'Anxiolytic', 'Anxiolytic', 'Antiemetic', 'Cold/Flu', 'Antihistamine'];
    
    // Generate 200+ medicines
    for (let i = 0; i < 210; i++) {
        let idx = i % 20;
        let suffix = i > 19 ? \` \${Math.floor(i/20)}\` : '';
        medicinesData.push([
            brands[idx] + suffix,
            generics[idx],
            manufacturers[idx],
            \`DRAP-\${10000 + i}\`,
            \`Used for treating \${categories[idx].toLowerCase()} related conditions\`,
            \`Take 1 tablet every 8 hours\`,
            categories[idx],
            i % 50 === 0 ? 1 : 0 // Some recalled
        ]);
    }

    const insertManyMedicines = db.transaction((meds) => {
        for (const med of meds) {
            insertMedicine.run(...med);
        }
    });
    insertManyMedicines(medicinesData);

    const insertInteraction = db.prepare(\`
        INSERT INTO medicine_interactions (genericName1, genericName2, severity, description)
        VALUES (?, ?, ?, ?)
    \`);
    
    insertInteraction.run('Ibuprofen', 'Aspirin', 'High', 'Increased risk of gastrointestinal bleeding');
    insertInteraction.run('Omeprazole', 'Clopidogrel', 'High', 'Reduced effectiveness of Clopidogrel');
    insertInteraction.run('Paracetamol', 'Metoclopramide', 'Moderate', 'Increased absorption rate of Paracetamol');
};
`,
    'middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const requirePatient = [authenticate, (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Access denied: Patient only' });
    }
    next();
}];

const requireDoctor = [authenticate, (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied: Doctor only' });
    }
    next();
}];

module.exports = { authenticate, requirePatient, requireDoctor };
`,
    'middleware/rateLimiter.js': `const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, 
    message: 'Too many authentication attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
`,
    'middleware/errorHandler.js': `const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = errorHandler;
`,
    'server.js': `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { initDb } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(generalLimiter);

initDb();

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/family', require('./routes/patient.routes'));
app.use('/api/medicines', require('./routes/medicine.routes'));
app.use('/api/scan', require('./routes/scan.routes'));
app.use('/api/safety', require('./routes/safety.routes'));
app.use('/api/messages', require('./routes/doctorConnect.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/emergency', require('./routes/emergency.routes'));

app.use(errorHandler);

app.listen(env.port, () => {
    console.log(\`MedVigil AI Server running on port \${env.port}\`);
});
`,
    'controllers/authController.js': `const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const env = require('../config/env');

exports.signup = (req, res, next) => {
    try {
        const { name, email, password, language } = req.body;
        const db = getDb();
        
        const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const result = db.prepare("INSERT INTO users (name, email, passwordHash, language) VALUES (?, ?, ?, ?)").run(name, email, hash, language || 'en');
        
        const token = jwt.sign({ id: result.lastInsertRowid, role: 'patient' }, env.jwtSecret, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: 'patient' } });
    } catch (err) {
        next(err);
    }
};

exports.login = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const db = getDb();
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
};

exports.doctorLogin = (req, res, next) => {
    try {
        const { doctorId, password } = req.body;
        const db = getDb();
        const doctor = db.prepare("SELECT * FROM doctors WHERE doctorId = ?").get(doctorId);
        if (!doctor || !bcrypt.compareSync(password, doctor.passwordHash)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: doctor.id, role: 'doctor', doctorId: doctor.doctorId }, env.jwtSecret, { expiresIn: '7d' });
        res.json({ token, user: { id: doctor.id, name: doctor.name, role: 'doctor', specialization: doctor.specialization } });
    } catch (err) {
        next(err);
    }
};

exports.getMe = (req, res, next) => {
    try {
        const db = getDb();
        if (req.user.role === 'doctor') {
            const doctor = db.prepare("SELECT id, name, doctorId, specialization FROM doctors WHERE id = ?").get(req.user.id);
            res.json(doctor);
        } else {
            const user = db.prepare("SELECT id, name, email, role, language, isFirstLogin, createdAt FROM users WHERE id = ?").get(req.user.id);
            res.json(user);
        }
    } catch (err) {
        next(err);
    }
};
`,
    'routes/auth.routes.js': `const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/doctor-login', authLimiter, authController.doctorLogin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
`,
    'controllers/patientController.js': `const { getDb } = require('../config/database');

exports.getFamilyMembers = (req, res, next) => {
    try {
        const db = getDb();
        const members = db.prepare("SELECT * FROM family_members WHERE userId = ?").all(req.user.id);
        res.json(members);
    } catch(err) {
        next(err);
    }
};

exports.addFamilyMember = (req, res, next) => {
    try {
        const { name, age, relation, avatar } = req.body;
        const db = getDb();
        const result = db.prepare("INSERT INTO family_members (userId, name, age, relation, avatar) VALUES (?, ?, ?, ?, ?)").run(req.user.id, name, age, relation, avatar);
        res.status(201).json({ id: result.lastInsertRowid, userId: req.user.id, name, age, relation, avatar });
    } catch(err) {
        next(err);
    }
};

exports.updateFamilyMember = (req, res, next) => {
    try {
        const { name, age, relation, avatar } = req.body;
        const db = getDb();
        db.prepare("UPDATE family_members SET name=?, age=?, relation=?, avatar=? WHERE id=? AND userId=?").run(name, age, relation, avatar, req.params.id, req.user.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.deleteFamilyMember = (req, res, next) => {
    try {
        const db = getDb();
        db.prepare("DELETE FROM family_members WHERE id=? AND userId=?").run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.activateFamilyMember = (req, res, next) => {
    try {
        res.json({ success: true, message: 'Activated profile', id: req.params.id });
    } catch(err) {
        next(err);
    }
};
`,
    'routes/patient.routes.js': `const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { requirePatient } = require('../middleware/authMiddleware');

router.use(requirePatient);
router.get('/members', patientController.getFamilyMembers);
router.post('/members', patientController.addFamilyMember);
router.put('/members/:id', patientController.updateFamilyMember);
router.delete('/members/:id', patientController.deleteFamilyMember);
router.put('/members/:id/activate', patientController.activateFamilyMember);

module.exports = router;
`,
    'controllers/medicineController.js': `const { getDb } = require('../config/database');

exports.searchMedicines = (req, res, next) => {
    try {
        const q = req.query.q || '';
        const db = getDb();
        const meds = db.prepare("SELECT * FROM medicines WHERE brandName LIKE ? OR genericName LIKE ? LIMIT 50").all(\`%\${q}%\`, \`%\${q}%\`);
        res.json(meds);
    } catch(err) {
        next(err);
    }
};

exports.getMedicine = (req, res, next) => {
    try {
        const db = getDb();
        const med = db.prepare("SELECT * FROM medicines WHERE id = ?").get(req.params.id);
        if (!med) return res.status(404).json({message: "Not found"});
        res.json(med);
    } catch(err) {
        next(err);
    }
};

exports.getInteractions = (req, res, next) => {
    try {
        const db = getDb();
        const med = db.prepare("SELECT * FROM medicines WHERE id = ?").get(req.params.id);
        if (!med) return res.status(404).json({message: "Not found"});

        const interactions = db.prepare("SELECT * FROM medicine_interactions WHERE genericName1 = ? OR genericName2 = ?").all(med.genericName, med.genericName);
        res.json(interactions);
    } catch(err) {
        next(err);
    }
};

exports.getRecalled = (req, res, next) => {
    try {
        const db = getDb();
        const meds = db.prepare("SELECT * FROM medicines WHERE recallStatus = 1").all();
        res.json(meds);
    } catch(err) {
        next(err);
    }
};
`,
    'routes/medicine.routes.js': `const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/search', medicineController.searchMedicines);
router.get('/recalls', medicineController.getRecalled);
router.get('/:id', medicineController.getMedicine);
router.get('/:id/interactions', medicineController.getInteractions);

module.exports = router;
`,
    'controllers/scanController.js': `const { getDb } = require('../config/database');

exports.lookupScan = (req, res, next) => {
    try {
        const { text } = req.body;
        const db = getDb();
        const words = text.split(/\\s+/);
        let match = null;
        for (let word of words) {
            if (word.length > 3) {
                const med = db.prepare("SELECT * FROM medicines WHERE brandName LIKE ? LIMIT 1").get(\`%\${word}%\`);
                if (med) {
                    match = med;
                    break;
                }
            }
        }
        res.json({ match });
    } catch(err) {
        next(err);
    }
};

exports.saveScan = (req, res, next) => {
    try {
        const { familyMemberId, medicineId, ocrText } = req.body;
        const db = getDb();
        const result = db.prepare("INSERT INTO scan_records (familyMemberId, medicineId, ocrText) VALUES (?, ?, ?)").run(familyMemberId, medicineId, ocrText);
        res.status(201).json({ id: result.lastInsertRowid });
    } catch(err) {
        next(err);
    }
};

exports.getScanHistory = (req, res, next) => {
    try {
        const db = getDb();
        const history = db.prepare(\`
            SELECT s.*, m.brandName, m.genericName 
            FROM scan_records s 
            LEFT JOIN medicines m ON s.medicineId = m.id 
            WHERE s.familyMemberId = ?
            ORDER BY s.scanDate DESC
        \`).all(req.params.familyMemberId);
        res.json(history);
    } catch(err) {
        next(err);
    }
};
`,
    'routes/scan.routes.js': `const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.post('/lookup', scanController.lookupScan);
router.post('/save', scanController.saveScan);
router.get('/history/:familyMemberId', scanController.getScanHistory);

module.exports = router;
`,
    'services/interactionEngine.js': `const { getDb } = require('../config/database');

exports.calculateSafetyScore = (familyMemberId) => {
    const db = getDb();
    let score = 100;
    const breakdown = [];
    const alerts = [];

    const activeMeds = db.prepare(\`
        SELECT m.* FROM medicine_history mh
        JOIN medicines m ON mh.medicineId = m.id
        WHERE mh.familyMemberId = ? AND mh.isActive = 1
    \`).all(familyMemberId);

    const genericNames = activeMeds.map(m => m.genericName);
    
    // Check recalls
    for (let med of activeMeds) {
        if (med.recallStatus === 1) {
            score -= 20;
            breakdown.push({ factor: \`Recalled Medicine: \${med.brandName}\`, penalty: -20 });
            alerts.push(\`CRITICAL: \${med.brandName} has been recalled by DRAP.\`);
        }
    }

    // Interactions
    for (let i = 0; i < genericNames.length; i++) {
        for (let j = i + 1; j < genericNames.length; j++) {
            const interaction = db.prepare(\`
                SELECT * FROM medicine_interactions 
                WHERE (genericName1 = ? AND genericName2 = ?) OR (genericName1 = ? AND genericName2 = ?)
            \`).get(genericNames[i], genericNames[j], genericNames[j], genericNames[i]);
            
            if (interaction) {
                score -= 15;
                breakdown.push({ factor: \`Interaction: \${genericNames[i]} + \${genericNames[j]}\`, penalty: -15 });
                alerts.push(\`WARNING: Potential interaction between \${genericNames[i]} and \${genericNames[j]}.\`);
            }
        }
    }

    // Antibiotic check
    const antibiotics = activeMeds.filter(m => m.category === 'Antibiotic');
    if (antibiotics.length > 1) {
        score -= 12;
        breakdown.push({ factor: "Multiple Antibiotics", penalty: -12 });
        alerts.push("WARNING: Taking multiple antibiotics concurrently. Consult your doctor.");
    }

    score = Math.max(0, score);
    
    let riskLevel = 'safe';
    if (score < 50) riskLevel = 'critical';
    else if (score < 80) riskLevel = 'moderate';

    return { score, breakdown, alerts, riskLevel };
};
`,
    'controllers/safetyScoreController.js': `const { calculateSafetyScore } = require('../services/interactionEngine');
const { getDb } = require('../config/database');

exports.getSafetyScore = (req, res, next) => {
    try {
        const result = calculateSafetyScore(req.params.familyMemberId);
        res.json(result);
    } catch(err) {
        next(err);
    }
};

exports.getAlerts = (req, res, next) => {
    try {
        const db = getDb();
        const alerts = db.prepare("SELECT * FROM safety_alerts WHERE familyMemberId = ? AND isRead = 0").all(req.params.familyMemberId);
        res.json(alerts);
    } catch(err) {
        next(err);
    }
};

exports.getInsights = (req, res, next) => {
    try {
        res.json({ insights: ["Stay hydrated while on antibiotics", "Consider taking antacids 2 hours apart from other meds"] });
    } catch(err) {
        next(err);
    }
};
`,
    'routes/safety.routes.js': `const express = require('express');
const router = express.Router();
const safetyScoreController = require('../controllers/safetyScoreController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/score/:familyMemberId', safetyScoreController.getSafetyScore);
router.get('/alerts/:familyMemberId', safetyScoreController.getAlerts);
router.get('/insights/:userId', safetyScoreController.getInsights);

module.exports = router;
`,
    'services/drapApiClient.js': `const { getDb } = require('../config/database');

exports.lookupMedicine = async (registrationNumber) => {
    const db = getDb();
    return db.prepare("SELECT * FROM medicines WHERE drapRegNumber = ?").get(registrationNumber);
};
`,
    'controllers/doctorConnectController.js': `const { getDb } = require('../config/database');
const { calculateSafetyScore } = require('../services/interactionEngine');

exports.sendMessage = (req, res, next) => {
    try {
        const { doctorId, message, urgencyTag, familyMemberId } = req.body;
        const db = getDb();
        
        const safety = calculateSafetyScore(familyMemberId);
        const snapshot = JSON.stringify(safety);

        const result = db.prepare(\`
            INSERT INTO doctor_messages (patientId, doctorId, message, urgencyTag, contextSnapshot)
            VALUES (?, ?, ?, ?, ?)
        \`).run(req.user.id, doctorId, message, urgencyTag || 'routine', snapshot);
        
        res.status(201).json({ id: result.lastInsertRowid });
    } catch(err) {
        next(err);
    }
};

exports.getPatientMessages = (req, res, next) => {
    try {
        const db = getDb();
        const msgs = db.prepare("SELECT * FROM doctor_messages WHERE patientId = ?").all(req.user.id);
        res.json(msgs);
    } catch(err) {
        next(err);
    }
};

exports.getDoctorInbox = (req, res, next) => {
    try {
        const db = getDb();
        const msgs = db.prepare("SELECT * FROM doctor_messages WHERE doctorId = ?").all(req.user.id);
        res.json(msgs);
    } catch(err) {
        next(err);
    }
};

exports.replyMessage = (req, res, next) => {
    try {
        const { reply, isVerified } = req.body;
        const db = getDb();
        db.prepare(\`
            UPDATE doctor_messages 
            SET reply = ?, isVerified = ?, status = 'replied', repliedAt = CURRENT_TIMESTAMP 
            WHERE id = ? AND doctorId = ?
        \`).run(reply, isVerified ? 1 : 0, req.params.id, req.user.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.markSeen = (req, res, next) => {
    try {
        const db = getDb();
        db.prepare("UPDATE doctor_messages SET seenAt = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.listDoctors = (req, res, next) => {
    try {
        const db = getDb();
        const doctors = db.prepare("SELECT id, name, specialization FROM doctors").all();
        res.json(doctors);
    } catch(err) {
        next(err);
    }
};
`,
    'routes/doctorConnect.routes.js': `const express = require('express');
const router = express.Router();
const doctorConnectController = require('../controllers/doctorConnectController');
const { authenticate, requirePatient, requireDoctor } = require('../middleware/authMiddleware');

router.get('/doctors', authenticate, doctorConnectController.listDoctors);

router.post('/send', requirePatient, doctorConnectController.sendMessage);
router.get('/patient', requirePatient, doctorConnectController.getPatientMessages);
router.put('/:id/seen', authenticate, doctorConnectController.markSeen);

router.get('/doctor', requireDoctor, doctorConnectController.getDoctorInbox);
router.put('/:id/reply', requireDoctor, doctorConnectController.replyMessage);

module.exports = router;
`,
    'controllers/notificationController.js': `const { getDb } = require('../config/database');

exports.getNotifications = (req, res, next) => {
    try {
        const db = getDb();
        const notifications = db.prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
        res.json(notifications);
    } catch(err) {
        next(err);
    }
};

exports.markRead = (req, res, next) => {
    try {
        const db = getDb();
        db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};

exports.markAllRead = (req, res, next) => {
    try {
        const db = getDb();
        db.prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?").run(req.user.id);
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};
`,
    'routes/notification.routes.js': `const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markRead);
router.put('/read-all', notificationController.markAllRead);

module.exports = router;
`,
    'controllers/analyticsController.js': `const { getDb } = require('../config/database');

exports.getTrends = (req, res, next) => {
    try {
        res.json({
            history: [
                { date: '2024-01-01', score: 100 },
                { date: '2024-02-01', score: 85 },
                { date: '2024-03-01', score: 95 }
            ]
        });
    } catch(err) {
        next(err);
    }
};

exports.getUsage = (req, res, next) => {
    try {
        res.json({ scansThisMonth: 12, totalMedicines: 5 });
    } catch(err) {
        next(err);
    }
};

exports.getFamilyOverview = (req, res, next) => {
    try {
        res.json({ familyRiskLevel: 'moderate', alertsCount: 2 });
    } catch(err) {
        next(err);
    }
};
`,
    'routes/analytics.routes.js': `const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/trends/:familyMemberId', analyticsController.getTrends);
router.get('/usage/:userId', analyticsController.getUsage);
router.get('/family-overview/:userId', analyticsController.getFamilyOverview);

module.exports = router;
`,
    'controllers/emergencyController.js': `const { getDb } = require('../config/database');

exports.getEmergencyInfo = (req, res, next) => {
    try {
        const db = getDb();
        const info = db.prepare("SELECT * FROM emergency_info WHERE familyMemberId = ?").get(req.params.familyMemberId);
        res.json(info || {});
    } catch(err) {
        next(err);
    }
};

exports.updateEmergencyInfo = (req, res, next) => {
    try {
        const { bloodType, allergies, emergencyContacts, criticalMedications, notes } = req.body;
        const db = getDb();
        const existing = db.prepare("SELECT id FROM emergency_info WHERE familyMemberId = ?").get(req.params.familyMemberId);
        
        if (existing) {
            db.prepare("UPDATE emergency_info SET bloodType=?, allergies=?, emergencyContacts=?, criticalMedications=?, notes=? WHERE familyMemberId=?")
              .run(bloodType, allergies, emergencyContacts, criticalMedications, notes, req.params.familyMemberId);
        } else {
            db.prepare("INSERT INTO emergency_info (familyMemberId, bloodType, allergies, emergencyContacts, criticalMedications, notes) VALUES (?, ?, ?, ?, ?, ?)")
              .run(req.params.familyMemberId, bloodType, allergies, emergencyContacts, criticalMedications, notes);
        }
        res.json({ success: true });
    } catch(err) {
        next(err);
    }
};
`,
    'routes/emergency.routes.js': `const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/:familyMemberId', emergencyController.getEmergencyInfo);
router.put('/:familyMemberId', emergencyController.updateEmergencyInfo);

module.exports = router;
`,
    'services/symptomEngine.js': `const symptomMap = {
    'headache': ['Panadol', 'Disprin'],
    'fever': ['Panadol', 'Calpol', 'Brufen'],
    'stomach ache': ['Risek', 'Flagyl'],
    'acidity': ['Risek'],
    'infection': ['Augmentin', 'Amoxil', 'Septran'],
    'pain': ['Ponstan', 'Brufen']
};

exports.getRelatedMedicines = (symptom) => {
    const meds = symptomMap[symptom.toLowerCase()] || [];
    return {
        medicines: meds,
        disclaimer: 'Please consult a doctor through Doctor Connect for personalized advice.'
    };
};
`,
    'services/notificationService.js': `const { getDb } = require('../config/database');

exports.createNotification = (userId, type, title, message) => {
    const db = getDb();
    db.prepare("INSERT INTO notifications (userId, type, title, message) VALUES (?, ?, ?, ?)").run(userId, type, title, message);
};
`
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, filename), content, 'utf8');
}
console.log('All files created successfully.');
