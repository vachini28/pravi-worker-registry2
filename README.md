# Pravi — Domestic Worker Registry System

> A full-stack governance technology prototype for registering, verifying, and protecting domestic and migrant workers in India. Built for the Pravi Research AI Builder interview.

---

## What is this?

Millions of domestic and migrant workers in India work in informal sectors with no official registration, no legal identity, and no employment protection. Employers cannot verify workers. The government has no reliable workforce data.

**Pravi solves this** with a secure digital platform that:
- Registers workers with biometric identity verification
- Authenticates using phone OTP only — no email required
- Detects fraud using AI (face deduplication, GPS velocity, risk scoring)
- Gives workers a self-service dashboard with an AI assistant powered by Gemini

---

## Live Demo

```
1. Run:  python app.py
2. Open: http://localhost:5000
```

| Role   | Username | Password   | Gets access to                          |
|--------|----------|------------|-----------------------------------------|
| Admin  | admin    | admin123   | Full portal — all sections              |
| Worker | worker   | worker123  | Personal dashboard — profile, ID, AI assistant |

---

## Tech Stack

| Layer          | Technology                  | Why                                      |
|----------------|-----------------------------|------------------------------------------|
| Frontend       | HTML5 + CSS3 + Vanilla JS   | Single file, no build tools, works by double-click |
| Backend        | Python 3 + Flask            | Lightweight REST API, easy to read and explain |
| Session store  | Python dict + time.time()   | In-memory OTP storage (Redis in production) |
| AI Assistant   | Google Gemini API           | Free tier, LLM API integration demo      |
| Fraud detection| Haversine + cosine similarity| GPS velocity check + biometric dedup     |

---

## File Structure

```
pravi/
├── app.py                  ← Entire Python Flask backend
├── README.md               ← This file
├── public/
│   └── index.html          ← Entire frontend (HTML + CSS + JS)
└── src/
    ├── styles.css          ← CSS variables and component styles
    ├── main.js             ← Entry point, wires all components
    ├── components/
    │   ├── auth.js         ← OTP + MFA flow
    │   ├── dashboard.js    ← Stats, charts, recent workers
    │   ├── fraud.js        ← Fraud alerts panel
    │   ├── register.js     ← 5-step registration wizard
    │   ├── security.js     ← Security controls panel
    │   └── worker.js       ← Worker records table
    ├── data/
    │   └── workers.js      ← Synthetic worker dataset (10 profiles)
    └── utils/
        ├── helpers.js      ← Counter animation, table render
        └── nav.js          ← Section routing
```

---

## API Endpoints

| Method | Endpoint                        | What it does                                          |
|--------|---------------------------------|-------------------------------------------------------|
| POST   | /api/auth/send-otp              | Generates 6-digit OTP, stores with 5-min TTL, prints to terminal |
| POST   | /api/auth/verify-otp            | Validates OTP, issues 30-min session token            |
| POST   | /api/auth/verify-mfa            | Confirms 2nd factor, marks session fully authenticated |
| GET    | /api/workers                    | All workers — supports ?search= and ?status= filters  |
| GET    | /api/workers/stats              | Dashboard stats (total workers, employers, fraud, KYC) |
| GET    | /api/workers/:id                | Single worker record by ID                            |
| POST   | /api/workers/register           | Save new worker, calculate risk score, return worker ID |
| GET    | /api/fraud/alerts               | All unresolved fraud flags                            |
| POST   | /api/fraud/check-velocity       | Haversine GPS check — returns distance, speed, verdict |
| POST   | /api/ai/ask                     | Worker question → Gemini API → answer                 |

---

## How to Run

### Step 1 — Install dependencies
```bash
pip install flask flask-cors
```

### Step 2 — Add your Gemini API key
Open `app.py` and find:
```python
api_key = 'YOUR_GEMINI_KEY_HERE'
```
Replace with your key from [aistudio.google.com](https://aistudio.google.com) (free, no credit card).

### Step 3 — Start the backend
```bash
cd "D:\VACHU_IMP STUFF\NIRMA\SEM 2\pravi"
python app.py
```

You will see:
```
✅ ShramSetu backend running!
🌐 Open this in Chrome: http://localhost:5000
```

### Step 4 — Open in Chrome
Go to `http://localhost:5000`

---

## Authentication Flow

The system uses **phone OTP only** — no email, no password.

```
Worker enters phone number
        ↓
Flask generates 6-digit OTP  →  random.randint(100000, 999999)
        ↓
OTP stored in Python dict with 5-minute expiry timestamp
        ↓
OTP printed to terminal (production: sent via MSG91/Twilio in worker's language)
        ↓
Worker enters OTP → backend validates → OTP deleted (one-time use) → token issued
        ↓
Worker picks 2nd factor: Face scan / PIN / Aadhaar OTP / Officer verification
        ↓
Session fully authenticated — 30 minute expiry
```

### Why no email?
> 65% of India's informal workers have no email account. Phone-first authentication is the only viable path at 200 million worker scale.

### Security controls active

| Control                  | Implementation                                          |
|--------------------------|---------------------------------------------------------|
| OTP rate limiting        | Max 3 OTPs per hour per phone number                    |
| Brute force protection   | Account locked after 5 wrong OTP attempts               |
| One-time OTP use         | OTP deleted from store immediately after verification   |
| Session expiry           | 30-minute token expiry                                  |
| MFA — 4 methods          | Face scan / PIN / Aadhaar OTP / Officer verification    |
| CORS                     | flask-cors enabled for frontend-backend communication   |
| RBAC                     | Admin vs worker role enforced — different views         |
| DPDP Act 2023            | Minimal data, purpose limitation, consent management    |

### Production upgrades planned

| Current (demo)           | Production upgrade                                      |
|--------------------------|---------------------------------------------------------|
| Python dict for OTP      | Redis cluster — persists across restarts, scales across instances |
| Simple tokens            | PyJWT with cryptographic signing                        |
| In-memory workers list   | PostgreSQL with AES-256 encrypted PII columns           |
| Terminal OTP print       | MSG91 / Twilio SMS in worker's regional language        |

---

## AI Fraud Detection

Three independent layers run automatically:

### Layer 1 — Biometric Deduplication

Every worker's face is converted to a **128-dimensional embedding** using Facenet (via DeepFace). On registration, the new embedding is compared against all existing workers using **cosine similarity**.

```python
similarity = dot(emb1, emb2) / (norm(emb1) * norm(emb2))
# Score >= 0.80 → same person → flagged as duplicate
```

| Score     | Meaning                          | Action               |
|-----------|----------------------------------|----------------------|
| 0.0 – 0.5 | Different people                 | Registration proceeds |
| 0.5 – 0.7 | Possibly similar                 | Flagged for review   |
| 0.7 – 0.8 | Likely same person               | Risk score increased |
| 0.8 – 1.0 | Almost certainly same person     | Both accounts suspended |

### Layer 2 — GPS Velocity Check (Haversine Formula)

Every login records GPS location. The system checks if travel between the last login and current login was physically possible.

```python
# Haversine formula — exact distance on curved earth
dist_km  = haversine(lat1, lon1, lat2, lon2)
speed    = dist_km / hours_gap
is_fraud = speed > 150  # 150 km/h generous upper bound

# Example: Surat → Ahmedabad = 280 km in 3 hrs = 93 km/h → OK
# Example: Surat → Delhi     = 1100 km in 2 hrs = 550 km/h → FRAUD
```

### Layer 3 — Risk Scoring Engine

Six weighted signals combine into a single fraud risk score (0.0 to 1.0):

| Signal                | Weight | Trigger                                      |
|-----------------------|--------|----------------------------------------------|
| No document uploaded  | 0.25   | Worker has no government ID                  |
| Biometric flag        | 0.30   | Face similarity >= 0.70                      |
| New device            | 0.10   | Device never seen before                     |
| Unverified employer   | 0.15   | Linked employer not yet verified             |
| Cluster address       | 0.10   | Same address as 10+ other workers            |
| Fast registration     | 0.10   | All 5 steps done in under 90 seconds         |

| Score      | Risk level | Action                           |
|------------|------------|----------------------------------|
| 0.0 – 0.4  | Low (green)    | Auto-verified                |
| 0.4 – 0.6  | Medium (amber) | Sent for manual review       |
| 0.6 – 0.8  | High (orange)  | Account held, verification required |
| 0.8 – 1.0  | Critical (red) | Auto-suspended, fraud investigation |

---

## Gemini AI Assistant

Workers can ask questions in natural language. The AI answers using Google Gemini API with the worker's profile context injected into the prompt.

### Technical flow

```
Worker types question
        ↓
Frontend sends question + worker context (name, sector, district, status)
        ↓
Flask builds structured prompt with system instructions + context
        ↓
Flask calls Gemini API → generativelanguage.googleapis.com
        ↓
Gemini returns 2-3 sentence answer in simple language
        ↓
Answer displayed in worker's chat box
```

### Prompt engineering

```python
system = """You are a helpful assistant for the Pravi Worker Registry Portal.
You help domestic and migrant workers understand their rights and registration in India.
Keep answers short, clear, and simple.
You are talking to a worker who may have low literacy. Be warm and supportive."""

user = f"Worker context: {context}\nWorker question: {question}\nAnswer in 2-3 sentences."
```

### Suggested questions shown to worker
- What are my rights as a worker?
- How do I update my details?
- What is minimum wage in Gujarat?
- My employer is not paying me

---

## Worker vs Admin Views

### Admin sees
- Dashboard with animated live stats from Flask backend
- Register Worker — 5-step wizard (phone → OTP → details → documents → biometric)
- Worker Records — searchable table with AI risk scores
- Fraud Alerts — 5 live alerts fetched from Flask + live GPS velocity tester
- Security Controls — all active controls and production roadmap
- Auth / MFA Flow — interactive demo of the full auth flow

### Worker sees
- Personal profile card — name, worker ID, sector, origin, registration date
- KYC verification progress bar — showing all steps complete
- Download ID card — generates PDF with QR code
- Employment history — past and current employers
- Gemini AI assistant — ask questions about rights and wages
- Grievance form — raise complaints about employers or account issues

---

## User Flows

### Worker Registration (5 steps)
```
Step 1 — Phone    → Enter number, select language (Hindi/Gujarati/Bengali/Tamil/Telugu/Odia)
Step 2 — OTP      → Enter 6-digit code from terminal (production: from SMS)
Step 3 — Details  → Name, DOB, state of origin, sector
Step 4 — Documents → Upload Aadhaar/Voter ID (or choose officer verification)
Step 5 — Biometric → Face capture for deduplication
         ↓
Success → Worker ID generated (e.g. SRT-2026-48291) + QR code sent via SMS
```

### Fraud Detection Demo
```
Admin → Fraud Alerts → click "Run: Surat → Ahmedabad fraud check"
        ↓
Frontend sends GPS coords to Flask /api/fraud/check-velocity
        ↓
Flask: Haversine(21.1702,72.8311, 23.0225,72.5714) = 280 km / 3 hrs = 93 km/h
        ↓
Result shown on screen + printed in terminal
```

---

## Data — What is Real vs Simulated

| What you see          | In prototype                        | In production                         |
|-----------------------|-------------------------------------|---------------------------------------|
| 1,84,203 workers      | Hardcoded in stats route            | COUNT(*) query on PostgreSQL          |
| Worker names          | 10 synthetic profiles in list       | Real registered workers               |
| Fraud alerts          | 4 hardcoded alerts                  | Auto-generated by detection engine    |
| OTP delivery          | Printed in VS Code terminal         | SMS via MSG91/Twilio                  |
| Face capture          | Simulated click                     | Browser MediaDevices API + DeepFace   |
| Risk scores           | Static values in data list          | Calculated on registration            |

### Production database schema
```sql
workers     — worker_id, name_encrypted, phone_encrypted, face_embedding, risk_score, status
employers   — employer_id, business_name, license_number, license_expiry, verified
fraud_flags — id, worker_id, flag_type, severity, details (JSONB), resolved
audit_log   — id, actor_id, action, target_id, prev_hash, row_hash  ← hash-chained, tamper-evident
```

---

## JD Alignment

How this project maps to every requirement in the Pravi AI Builder job description:

| JD Requirement                             | How this project demonstrates it                              |
|--------------------------------------------|---------------------------------------------------------------|
| Systems thinking and problem decomposition | Auth, identity, fraud, AI split into separate modules and API routes |
| Population-scale product design            | Designed for 200M+ workers, stateless auth, horizontal scaling plan |
| Define clear problem statements            | 3 specific governance pain points clearly framed              |
| Technical fluency — APIs                   | 10 REST endpoints + Gemini API + fetch() on frontend          |
| Technical fluency — databases              | PostgreSQL schema designed, Redis plan for OTP               |
| LLM API usage                              | Google Gemini API live in worker dashboard                    |
| Prompt engineering                         | System prompt with role constraints + worker context injection |
| Agent orchestration                        | Multi-step: user input → context build → API call → render    |
| Understanding LLM limitations              | Rate limiting (429) handled, fallback message on API failure  |
| Bias for action — ships things             | Full working prototype built and running in 1 day             |
| Product thinking + user empathy            | Separate worker vs admin views, no-email auth, multilingual OTP |
| Governance technology                      | DPDP Act compliance, RBAC, audit log, district-scoped access  |

---

## Key Interview Answers

**"Why this problem?"**
> Domestic and migrant workers are one of India's most vulnerable populations — 50 million+ people with no legal identity and no employment protection. This is exactly the kind of population-scale governance problem that Pravi works on.

**"How does OTP work without email?"**
> random.randint generates a 6-digit OTP, stored in a Python dict with a 5-minute timestamp. Rate-limited to 3 per hour per phone number. Deleted immediately after use — one-time only. In production this goes via MSG91 SMS in the worker's regional language.

**"What AI have you used?"**
> Two components. First, Google Gemini API for the worker AI assistant — structured prompt with worker context injection, demonstrating prompt engineering and LLM API integration. Second, fraud detection modules — cosine similarity on Facenet face embeddings for biometric deduplication, Haversine formula for GPS velocity fraud detection, and a 6-signal weighted risk scoring engine.

**"Can this scale to 200 million workers?"**
> Auth service is stateless — JWT tokens scale horizontally. OTP dict → Redis cluster in production. PostgreSQL with read replicas for worker records. Face deduplication runs asynchronously so it doesn't block registration. Flask behind a load balancer with Docker containers.

**"What would you build next?"**
> Real SMS via MSG91 (backend already structured for it), actual face capture using browser MediaDevices API with DeepFace on backend (UI already built), and replacing in-memory storage with PostgreSQL + Redis.

---

## Built with

- Python 3 + Flask + flask-cors
- Vanilla HTML/CSS/JavaScript
- Google Gemini API
- Haversine formula (pure Python math)
- DeepFace + Facenet (production design)

---

*Built for Pravi Research · AI Builder Interview · March 2026*
#   p r a v i - w o r k e r - r e g i s t r y 2  
 