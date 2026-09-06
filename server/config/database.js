const initSqlJs = require('sql.js');
const path = require('path');
const env = require('./env');
const seed = require('../data/seed');
const seedVaultData = require('../data/vaultSeed');
const seedDoctors = require('../data/doctorSeed');
const fs = require('fs');

let db;
let dbPath;

async function initDb() {
    const SQL = await initSqlJs();
    dbPath = path.resolve(__dirname, '..', env.dbPath);
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            passwordHash TEXT,
            role TEXT DEFAULT 'patient',
            language TEXT DEFAULT 'en',
            isFirstLogin INTEGER DEFAULT 1,
            activeMemberId INTEGER,
            createdAt TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            doctorId TEXT UNIQUE,
            passwordHash TEXT,
            specialization TEXT,
            title TEXT,
            qualification TEXT,
            photo TEXT,
            intro TEXT,
            availability TEXT DEFAULT 'Available',
            experience TEXT,
            email TEXT,
            hospital TEXT
        );

        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT,
            age INTEGER,
            relation TEXT,
            avatar TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brandName TEXT,
            genericName TEXT,
            manufacturer TEXT,
            drapRegNumber TEXT,
            usage_ TEXT,
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
            scanDate TEXT DEFAULT (datetime('now')),
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
            createdAt TEXT DEFAULT (datetime('now')),
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
            createdAt TEXT DEFAULT (datetime('now')),
            repliedAt TEXT,
            seenAt TEXT,
            FOREIGN KEY (patientId) REFERENCES users(id),
            FOREIGN KEY (doctorId) REFERENCES doctors(id)
        );

        CREATE TABLE IF NOT EXISTS medicine_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            medicineId INTEGER,
            startDate TEXT DEFAULT (datetime('now')),
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
            createdAt TEXT DEFAULT (datetime('now')),
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

        CREATE TABLE IF NOT EXISTS allergies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            allergen TEXT,
            severity TEXT DEFAULT 'moderate',
            notes TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );

        CREATE TABLE IF NOT EXISTS medical_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            familyMemberId INTEGER,
            conditionName TEXT,
            severity TEXT DEFAULT 'moderate',
            diagnosedDate TEXT,
            notes TEXT,
            isActive INTEGER DEFAULT 1,
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            action TEXT,
            resource TEXT,
            resourceId TEXT,
            details TEXT,
            ipAddress TEXT,
            createdAt TEXT DEFAULT (datetime('now'))
        );

        -- Self-Medication Risk Assessment history (who was assessed, the
        -- reported symptoms, the final risk level and the verified alerts)
        CREATE TABLE IF NOT EXISTS triage_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            familyMemberId INTEGER,
            symptoms TEXT,
            normalizedSymptoms TEXT,
            answers TEXT,
            durationSummary TEXT,
            riskLevel TEXT,
            safetyOverride INTEGER DEFAULT 0,
            redFlags TEXT,
            safetyAlerts TEXT,
            plannedMedicine TEXT,
            amrAlert INTEGER DEFAULT 0,
            doctorConnectRecommended INTEGER DEFAULT 0,
            aiUsed INTEGER DEFAULT 0,
            summary TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );

        -- Family Safety Vault reference data: cross-reactive allergen families
        -- (e.g. a recorded Penicillin allergy must flag Amoxicillin/Augmentin)
        CREATE TABLE IF NOT EXISTS allergen_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            groupName TEXT NOT NULL,
            memberName TEXT NOT NULL,
            UNIQUE(groupName, memberName)
        );

        -- Family Safety Vault: condition -> medicine caution rules
        -- (conditionKey covers chronic conditions plus special statuses like pregnancy/elderly/child)
        CREATE TABLE IF NOT EXISTS condition_warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conditionKey TEXT NOT NULL,
            matchType TEXT NOT NULL,
            pattern TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'caution',
            message TEXT NOT NULL,
            UNIQUE(conditionKey, matchType, pattern)
        );

        -- Family Safety Vault audit trail for safety-critical medication checks
        CREATE TABLE IF NOT EXISTS safety_check_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            familyMemberId INTEGER,
            medicineName TEXT,
            medicineId INTEGER,
            overallRisk TEXT,
            rulesTriggered TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (familyMemberId) REFERENCES family_members(id)
        );
    `);

    // ---- Family Safety Vault schema upgrades (existing databases) ----
    // SQLite has no "ADD COLUMN IF NOT EXISTS", so check PRAGMA table_info first.
    ensureColumns('family_members', {
        dateOfBirth: 'TEXT',
        sex: 'TEXT',
        pregnancyStatus: "TEXT DEFAULT 'unknown'",
        breastfeedingStatus: "TEXT DEFAULT 'unknown'",
        emergencyContactName: 'TEXT',
        emergencyContactPhone: 'TEXT',
        emergencyNotes: 'TEXT',
        updatedAt: 'TEXT'
    });
    ensureColumns('medicine_history', {
        medicineName: 'TEXT',
        activeIngredient: 'TEXT',
        strength: 'TEXT',
        frequency: 'TEXT',
        reason: 'TEXT'
    });
    ensureColumns('allergies', {
        allergyType: "TEXT DEFAULT 'medicine'"
    });
    // Doctor registration (clinical portal) stores contact + practice details.
    ensureColumns('doctors', {
        email: 'TEXT',
        hospital: 'TEXT',
        title: 'TEXT',
        qualification: 'TEXT',
        photo: 'TEXT',
        intro: 'TEXT',
        availability: "TEXT DEFAULT 'Available'",
        experience: 'TEXT'
    });

    // Databases created before the UNIQUE constraint existed may contain
    // duplicated warning rules (one set per restart). Deduplicate and enforce
    // uniqueness so vault seeding stays idempotent.
    db.run(`
        DELETE FROM condition_warnings
        WHERE id NOT IN (
            SELECT MIN(id) FROM condition_warnings
            GROUP BY conditionKey, matchType, pattern
        )
    `);
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_condition_warnings_unique
            ON condition_warnings(conditionKey, matchType, pattern)`);

    // Vault reference data (allergen groups + condition warnings) is seeded
    // idempotently on every startup so existing databases are upgraded too.
    seedVaultData(db);

    // Medicine directory dedup + unique index so INSERT OR IGNORE in seed()
    // is genuinely idempotent (legacy databases have no UNIQUE constraint).
    db.run(`DELETE FROM medicines WHERE id NOT IN (
            SELECT MIN(id) FROM medicines GROUP BY COALESCE(drapRegNumber, brandName)
        )`);
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_medicines_drap_unique
            ON medicines(drapRegNumber)`);

    // Interaction rules: same idempotency treatment as the directory.
    db.run(`DELETE FROM medicine_interactions WHERE id NOT IN (
            SELECT MIN(id) FROM medicine_interactions
            GROUP BY LOWER(COALESCE(genericName1,'')), LOWER(COALESCE(genericName2,''))
        )`);
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_medicine_interactions_unique
            ON medicine_interactions(genericName1, genericName2)`);

    // Seed the medicine directory + interaction rules only when the directory
    // is empty or smaller than the current reference set. Checking medicines
    // (not users) keeps user accounts independent of reference-data seeding.
    const medResult = db.exec("SELECT COUNT(*) as count FROM medicines");
    const medCount = medResult.length > 0 ? medResult[0].values[0][0] : 0;
    if (medCount === 0) {
        seed(db);
    } else if (medCount < 250) {
        // Legacy database created before the directory expansion: top it up.
        // INSERT OR IGNORE + the unique index keeps existing rows intact.
        seed(db);
        console.log(`Medicine directory topped up from ${medCount} entries`);
    }

    // Seed the verified hackathon demo doctors (idempotent).
    seedDoctors(db);

    saveDb();
    console.log('Database initialized successfully');
}

// Adds missing columns to an existing table (safe to call repeatedly)
function ensureColumns(table, columns) {
    const result = db.exec(`PRAGMA table_info(${table})`);
    const existing = new Set();
    if (result.length > 0) {
        for (const row of result[0].values) {
            existing.add(row[1]);
        }
    }
    for (const [name, definition] of Object.entries(columns)) {
        if (!existing.has(name)) {
            db.run(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
        }
    }
}

function saveDb() {
    if (db && dbPath) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}

// Helper functions to make sql.js work like better-sqlite3
function prepareAndGet(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    if (stmt.step()) {
        const cols = stmt.getColumnNames();
        const values = stmt.get();
        stmt.free();
        const row = {};
        cols.forEach((col, i) => row[col] = values[i]);
        return row;
    }
    stmt.free();
    return null;
}

function prepareAndAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const rows = [];
    const cols = stmt.getColumnNames();
    while (stmt.step()) {
        const values = stmt.get();
        const row = {};
        cols.forEach((col, i) => row[col] = values[i]);
        rows.push(row);
    }
    stmt.free();
    return rows;
}

function runQuery(sql, params = []) {
    db.run(sql, params);
    // IMPORTANT: Capture last_insert_rowid and changes BEFORE saveDb().
    // saveDb() calls db.export() which resets the WASM last_insert_rowid tracker,
    // causing all subsequent SELECT last_insert_rowid() calls to return 0.
    // This was the root cause of registration failures (User.create returned null).
    const changes = db.getRowsModified();
    const lastInsertRowid = prepareAndGet("SELECT last_insert_rowid() as id")?.id || 0;
    saveDb();
    return { changes, lastInsertRowid };
}

module.exports = { getDb, initDb, saveDb, prepareAndGet, prepareAndAll, runQuery };
