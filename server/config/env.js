require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const jwtSecret = process.env.JWT_SECRET || (
    isProduction
        ? undefined
        : 'dev-only-insecure-secret-replace-in-production'
);

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production');
}

if (!isProduction && !process.env.JWT_SECRET) {
    console.warn('[SECURITY WARNING] JWT_SECRET is not set. Using an insecure development fallback. Set JWT_SECRET in your .env file before deploying.');
}

module.exports = {
    port: process.env.PORT || 5000,
    jwtSecret,
    dbPath: process.env.DB_PATH || './data/medvigil.db',
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
    medicineApiKey: process.env.MEDICINE_API_KEY,
    openFdaBaseUrl: process.env.OPENFDA_BASE_URL
};
