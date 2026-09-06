const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { initDb } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const sanitizer = require('./middleware/sanitizer');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizer);
app.use(morgan('dev'));
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'MedVigil AI Backend',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount modular API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/family', require('./routes/patient.routes'));
app.use('/api/family', require('./routes/familyVault.routes'));
app.use('/api/medication-safety', require('./routes/medicationSafety.routes'));
app.use('/api/medicines', require('./routes/medicine.routes'));
app.use('/api/medications', require('./routes/medicineHistory.routes'));
app.use('/api/allergies', require('./routes/allergy.routes'));
app.use('/api/conditions', require('./routes/condition.routes'));
app.use('/api/scan', require('./routes/scan.routes'));
app.use('/api/safety', require('./routes/safety.routes'));
app.use('/api/messages', require('./routes/doctorConnect.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/emergency', require('./routes/emergency.routes'));
app.use('/api/symptoms', require('./routes/symptom.routes'));
app.use('/api/triage', require('./routes/triage.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/audit', require('./routes/audit.routes'));
app.use('/api/prescription', require('./routes/prescription.routes'));

// Global error handler
app.use(errorHandler);

async function start() {
    await initDb();
    app.listen(env.port, () => {
        console.log(`[MedVigil AI] Backend server running on port ${env.port}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
