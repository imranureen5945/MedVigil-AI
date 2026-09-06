# MedVigil AI — Intelligent Pharmacovigilance & Family Medicine Safety System

MedVigil AI is a production-grade full-stack healthcare platform designed to prevent drug interactions, detect DRAP (Drug Regulatory Authority of Pakistan) product recalls, eliminate duplicate medication therapies, and recognize pharmaceutical packaging via Gemini Multi-Modal Vision and OCR.

---

## 🌟 Key Features

1. **Gemini Vision OCR & Medicine Recognition Pipeline**:
   - Multi-modal visual recognition of medicine boxes, blister strips, bottles, and doctor prescriptions.
   - Handles blurry, rotated, handwritten, and multilingual packaging.
   - Extracts Brand Name, Generic Formulation, Strength, Batch #, Expiry Date, Manufacturer, and Verbatim OCR text.
   - 3-tier Confidence Scoring (High 90–100%, Medium 70–89%, Low <70%) with manual verification safeguards.

2. **Automated Safety & Contraindication Engine**:
   - Evaluates active prescriptions against known drug-drug interactions.
   - Detects therapeutic duplication (e.g. Paracetamol overlap across brands).
   - Flags DRAP national product recalls and quality notices in real time.
   - Cross-references patient allergies and medical conditions (Hypertension, Diabetes, Asthma, Renal/Hepatic impairment).

3. **National Drug Directory & DRAP Database**:
   - Database of 150+ Pakistani pharmaceutical brands and generic formulations.
   - Immediate search, comparison, and contraindication inspection.

4. **Doctor TeleConnect & Verified Clinical Inbox**:
   - Direct patient-to-doctor clinical consultation messaging.
   - Auto-attaches patient safety snapshots (active meds, safety score, alerts).
   - Doctor verification badge for confirmed clinical recommendations.

5. **Antimicrobial Resistance (AMR) Stewardship**:
   - WHO & DRAP AWaRe classification guidance (Access, Watch, Reserve).
   - Active monitoring against multiple concurrent antibiotic therapy.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Axios, i18next (English & Urdu).
- **Backend**: Express.js, sql.js (WASM SQLite with disk persistence), `@google/generative-ai` (Gemini 1.5 Flash), JWT Authentication, bcryptjs, Helmet, Express Rate Limit.
- **Security**: Strict input sanitization, salted bcrypt password hashing, role-based authorization (patient vs doctor), zero client-side API key leakage.

---

## 🚀 Quick Start & Local Setup

### 1. Backend Setup
```bash
cd server
npm install
npm test          # Run 100% automated test suite
npm start         # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
npm run build     # Production bundle build
```

---

## 🔑 Environment Variables

Create `.env` in `server/` (or copy `.env.example`):
```env
PORT=5000
JWT_SECRET=your-secure-jwt-secret
DB_PATH=./data/medvigil.db
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🧪 Demo Credentials

- **Patient Demo**: `demo@medvigil.pk` / `patient123`
- **Doctor 1**: `DR-FM-001` / `doctor123` (Dr. Faisal Maqsood — Family Medicine & Drug Safety)
- **Doctor 2**: `DR-AT-002` / `doctor123` (Dr. Aneeqa Talib — Internal Medicine & Pharmacotherapy)
