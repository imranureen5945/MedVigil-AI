# MedVigil AI REST API Reference Documentation

All endpoints require standard JSON payloads and return structured responses. Authenticated endpoints require a `Bearer <token>` header.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new patient account |
| POST | `/api/auth/login` | Patient login (email + password) |
| POST | `/api/auth/doctor-login` | Doctor login (doctorId + password) |
| GET | `/api/auth/me` | Fetch authenticated user/doctor profile |

---

## 2. Medicine Recognition & OCR Vision (`/api/scan`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan/analyze-image` | Multi-modal Gemini Vision OCR analysis of medicine packaging, blister strips, or prescriptions. |
| POST | `/api/scan/lookup` | Fast OCR text lookup & fuzzy database match |
| POST | `/api/scan/save` | Save scan record & sync to active prescription history |
| GET | `/api/scan/history/:familyMemberId` | Retrieve scan audit history for profile |

---

## 3. Prescriptions & Medication History (`/api/medications`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medications/:familyMemberId` | List active prescriptions for family member |
| POST | `/api/medications` | Add medication to profile history |
| PUT | `/api/medications/:id` | Update dosage notes or active status |
| DELETE | `/api/medications/:id` | Remove medication record |

---

## 4. Safety & Contraindications Engine (`/api/safety`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/safety/score/:familyMemberId` | Calculate 0-100 safety score & risk level |
| GET | `/api/safety/alerts/:familyMemberId` | Fetch active recalls, interactions & warnings |
| GET | `/api/safety/insights/:userId` | Dynamic AI health recommendations |
| POST | `/api/safety/check-single` | Test a single candidate drug against active profile |

---

## 5. Doctor TeleConnect (`/api/messages` & `/api/doctors`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/doctors` | List verified telehealth physicians |
| POST | `/api/messages/send` | Patient sends inquiry with attached clinical snapshot |
| GET | `/api/messages/patient` | Get consultation thread for patient |
| GET | `/api/messages/doctor` | Doctor inbox with urgency filtering |
| PUT | `/api/messages/:id/reply` | Doctor sends reply with verification status |
| PUT | `/api/messages/:id/seen` | Mark thread as seen |

---

## 6. AI Natural Language & Symptoms (`/api/ai` & `/api/symptoms`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/symptoms/analyze` | Symptom assessment in English & Roman Urdu |
| POST | `/api/ai/analyze-medicine` | AI therapeutic guidance |
| POST | `/api/ai/explain-interaction` | Natural language drug interaction explanation |

---

## 7. System Health (`/api/health`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Service uptime, status, version check |
