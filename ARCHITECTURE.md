# 🏗️ AI Interview Assistant - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER (Client)                              │
│                        http://localhost:3000                                │
└────────────────────────┬────────────────────────────────────────────────────┘
                         │ HTTP/REST API Calls
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 16 FRONTEND                                 │
│                      (Port 3000 - Vercel)                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Pages:                                                               │   │
│  │  • / (Home/Landing)                                               │   │
│  │  • /interview/upload-resume (Resume Upload)                       │   │
│  │  • /interview/session (Interview Q&A)                            │   │
│  │  • /interview/results (Results Dashboard)                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Components:                                                          │   │
│  │  • ResumeUpload (Drag-drop file upload)                           │   │
│  │  • InterviewSession (Question display + recording)                │   │
│  │  • VoiceRecorder (Web Audio API)                                  │   │
│  │  • ResultsDisplay (Scores + Recommendations)                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ State Management:                                                    │   │
│  │  • Zustand Store (lib/store.ts)                                   │   │
│  │    - Resume data, interview session, results                      │   │
│  │  • Axios Client (lib/api.ts)                                      │   │
│  │    - Wrapped API calls with error handling                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                         │ 
                         │ REST API (JSON)
                         ├─ POST /api/resume/upload
                         ├─ POST /api/interview/start
                         ├─ POST /api/interview/{id}/submit-answer
                         └─ POST /api/interview/{id}/improvement-plan
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND SERVER                                │
│                    (Port 8000 - uvicorn/gunicorn)                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Routes (routes/):                                                    │   │
│  │  • health.py          GET  /api/health                              │   │
│  │  • resume.py          POST /api/resume/upload                       │   │
│  │  • interview.py       POST /api/interview/start                     │   │
│  │                       POST /api/interview/{id}/submit-answer        │   │
│  │                       POST /api/interview/{id}/complete             │   │
│  │                       GET  /api/interview/{id}/results              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Services (services/):                                                │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ resume_parser.py (PDF Extraction)                             │ │   │
│  │  │  • Extract text from PDF (pdfplumber + PyPDF2)               │ │   │
│  │  │  • Parse skills (regex + keyword matching)                  │ │   │
│  │  │  • Extract contact info (email, phone, LinkedIn)            │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ openai_service.py (AI Integration)                            │ │   │
│  │  │  • extract_skills() - Use GPT to identify skills            │ │   │
│  │  │  • generate_questions() - Create interview questions        │ │   │
│  │  │  • evaluate_answer() - Score and feedback                  │ │   │
│  │  │  • generate_improvement_plan() - Recommendations           │ │   │
│  │  │                                                             │ │   │
│  │  │  Uses: gpt-4-turbo-preview                                 │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ database.py (MongoDB Operations)                              │ │   │
│  │  │  • save_resume() - Store uploaded resume data               │ │   │
│  │  │  • create_interview() - Start new interview session         │ │   │
│  │  │  • save_answer() - Store answers + evaluations             │ │   │
│  │  │  • save_results() - Store final results                    │ │   │
│  │  │  • save_improvement_plan() - Store recommendations         │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Data Models (models/schemas.py - Pydantic):                          │   │
│  │  • ResumeResponse, SkillExtracted                                   │   │
│  │  • InterviewSession, InterviewQuestion                             │   │
│  │  • AnswerEvaluation, InterviewResults                              │   │
│  │  • ImprovementPlan                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Configuration (config/settings.py):                                  │   │
│  │  • OPENAI_API_KEY (from env)                                       │   │
│  │  • MONGODB_URI (from env)                                          │   │
│  │  • CORS allowed origins                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                              │
         │ PyMongo Driver               │ OpenAI API Calls
         │ (Connection String)          │ (HTTP/HTTPS)
         │                              │
         ▼                              ▼
┌─────────────────────────────┐  ┌──────────────────────────┐
│   MONGODB ATLAS             │  │  OPENAI API              │
│   (Cloud Database)          │  │  (GPT-4 + Embeddings)    │
│                             │  │                          │
│ Collections:                │  │ Used for:                │
│  • resumes                  │  │  • Question generation   │
│  • interviews               │  │  • Skill extraction      │
│  • questions                │  │  • Answer evaluation     │
│  • answers                  │  │  • Plan generation       │
│  • results                  │  │                          │
│  • improvement_plans        │  │ Rate Limited:            │
│                             │  │  • Track usage           │
│ Data:                       │  │  • Handle errors         │
│  • PDFs text                │  │                          │
│  • Questions & Answers      │  │ Cost:                    │
│  • Scores & Feedback        │  │  • Pay per token used    │
│  • User Progress            │  │                          │
└─────────────────────────────┘  └──────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Resume Upload Flow

```
┌─────────────┐
│   User      │
│ (Frontend)  │
└──────┬──────┘
       │ 1. Select PDF file
       │
       ▼
┌──────────────────────┐
│ ResumeUpload.tsx     │ 2. Validate file (PDF, <5MB)
│ (React Component)    │
└──────────┬───────────┘
           │ 3. Upload to /api/resume/upload
           │
           ▼
┌─────────────────────────────────┐
│ resume.py (Route Handler)       │ 4. Receive multipart form data
└──────────┬──────────────────────┘
           │ 5. Pass to resume_parser.py
           │
           ▼
┌──────────────────────────────────┐
│ resume_parser.py                 │ 6. Extract PDF text
│ • pdfplumber (primary)           │ 7. Extract skills (regex)
│ • PyPDF2 (fallback)              │ 8. Extract contact info
└──────────┬───────────────────────┘
           │ 9. Return parsed data
           │
           ▼
┌──────────────────────────────────┐
│ openai_service.py                │ 10. Call GPT-4 with resume text
│ extract_skills()                 │ 11. Get structured skill list
└──────────┬───────────────────────┘
           │ 12. Return AI-extracted skills
           │
           ▼
┌──────────────────────────────────┐
│ database.py                      │ 13. Combine regex + AI skills
│ save_resume()                    │ 14. Store resume + skills in MongoDB
└──────────┬───────────────────────┘
           │ 15. Return resume_id
           │
           ▼
┌─────────────────────────────────┐
│ ResumeUpload.tsx                │ 16. Display success + extracted skills
│ (Update React State)            │ 17. Show "Start Interview" button
└─────────────────────────────────┘
```

### 2. Interview Session Flow

```
┌──────────────────────┐
│ User Answers 5 Qs    │
│ (InterviewSession)   │
└──────────┬───────────┘
           │
           ├─── Q1 ─── Record Voice ─── Transcribe ─── Submit
           │                                               │
           │                                               ▼
           │                                    ┌──────────────────────────┐
           │                                    │ interview.py             │
           │                                    │ /submit-answer endpoint  │
           │                                    └──────────┬───────────────┘
           │                                               │
           │                                               ▼
           │                                    ┌──────────────────────────┐
           │                                    │ openai_service.py        │
           │                                    │ evaluate_answer()        │
           │                                    │ • Score (0-100)          │
           │                                    │ • Feedback               │
           │                                    │ • Strengths              │
           │                                    │ • Weaknesses             │
           │                                    │ • Suggestions            │
           │                                    └──────────┬───────────────┘
           │                                               │
           │                                               ▼
           │                                    ┌──────────────────────────┐
           │                                    │ database.py              │
           │                                    │ save_answer()            │
           │                                    │ (Store in MongoDB)       │
           │                                    └──────────┬───────────────┘
           │                                               │
           │                                               ▼
           │                                    ┌──────────────────────────┐
           │                                    │ Return evaluation + score│
           │                                    └──────────┬───────────────┘
           │                                               │
           │◄──────────────────────────────────────────────┘
           │
           ├─── Q2 ─── (repeat flow)
           │
           ├─── Q3 ─── (repeat flow)
           │
           ├─── Q4 ─── (repeat flow)
           │
           └─── Q5 ─── (repeat flow)
                       │
                       ▼
                ┌──────────────────────┐
                │ Interview Complete   │
                │ Call /complete       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │ Calculate:                   │
                │ • Overall score (average)    │
                │ • Identify weak areas (<60)  │
                │ • Save results to MongoDB    │
                └──────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────────────┐
                │ Redirect to /results page    │
                └──────────────────────────────┘
```

### 3. Results & Improvement Plan Flow

```
┌─────────────────────────────┐
│ User views /interview/results│
└──────────┬──────────────────┘
           │ 1. Get interview_id from URL
           │
           ▼
┌─────────────────────────────┐
│ ResultsDisplay.tsx          │ 2. Call API: /api/interview/{id}/results
│ (React Component)           │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ interview.py                 │ 3. Fetch results from MongoDB
│ GET /results endpoint        │
└──────────┬───────────────────┘
           │ 4. Return: score, answers breakdown, weak areas
           │
           ▼
┌──────────────────────────────┐
│ ResultsDisplay.tsx           │ 5. Render scores + question breakdown
│ (Initial Display)            │
└──────────┬───────────────────┘
           │ 6. Call API: /api/interview/{id}/improvement-plan
           │
           ▼
┌──────────────────────────────┐
│ interview.py                 │ 7. Fetch results + recent answers
│ POST /improvement-plan       │
└──────────┬───────────────────┘
           │ 8. Extract weak areas
           │
           ▼
┌──────────────────────────────┐
│ openai_service.py            │ 9. Call GPT-4 with weak areas + samples
│ generate_improvement_plan()  │ 10. Generate:
│                              │     • Recommendations
│                              │     • Learning resources
│                              │     • Timeline
│                              │     • Next steps
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ database.py                  │ 11. Store improvement plan
│ save_improvement_plan()      │
└──────────┬───────────────────┘
           │ 12. Return plan data
           │
           ▼
┌──────────────────────────────┐
│ ResultsDisplay.tsx           │ 13. Render:
│ (Final Display)              │     • Overall score gauge
│                              │     • Question breakdown
│                              │     • Weak areas list
│                              │     • Improvement recommendations
└──────────────────────────────┘
```

---

## Technology Stack Details

### Frontend Stack
```
Next.js 16
├── React 19 (UI Components)
├── TypeScript (Type Safety)
├── Tailwind CSS v4 (Styling)
├── Zustand (State Management)
├── Axios (HTTP Client)
├── React Hook Form (Forms)
├── Lucide Icons (Icons)
└── Web Audio API (Voice Recording)
```

### Backend Stack
```
FastAPI
├── Python 3.11 (Runtime)
├── Pydantic (Data Validation)
├── Uvicorn (ASGI Server)
├── PyMongo (Database Driver)
│   ├── pdfplumber (PDF Extraction)
│   └── PyPDF2 (PDF Fallback)
├── OpenAI Python SDK (GPT Integration)
├── Python Multipart (File Upload)
└── Python JOSE (JWT/Security)
```

### Infrastructure
```
Development
├── Docker (Containerization)
├── Docker Compose (Multi-container)
├── Venv (Python Virtual Env)
└── pnpm (Node Package Manager)

Production (Can Deploy To)
├── Vercel (Frontend)
├── Railway/Render/Cloud Run (Backend)
├── MongoDB Atlas (Database)
└── OpenAI API (AI Service)
```

---

## Deployment Architecture

### Local Development
```
Docker Container 1: Next.js Frontend (Port 3000)
Docker Container 2: FastAPI Backend (Port 8000)
Docker Container 3: MongoDB (Port 27017)
        ↓
All communicate over docker network
```

### Production
```
Vercel Edge → Next.js Frontend (Global CDN)
        ↓
        └─→ FastAPI on Cloud Run/Railway (Auto-scaling)
                ↓
                └─→ MongoDB Atlas (Managed Database)
                        ↓
                        └─→ OpenAI API (Cloud)
```

---

## Security Architecture

```
Frontend (Port 3000)
├── Environment: NEXT_PUBLIC_API_URL (Backend URL)
├── No API keys stored (client-side safe)
└── All requests go through backend

Backend (Port 8000)
├── Environment: OPENAI_API_KEY (Server-side only)
├── Environment: MONGODB_URI (Server-side only)
├── CORS configured for frontend origin
├── Input validation on all endpoints
├── Error handling (no stack traces exposed)
└── File size limits (5MB max)

Database (MongoDB Atlas)
├── Credentials in env variables
├── IP whitelist (specific IPs in production)
├── Connection string encryption
└── Automatic backups

External APIs (OpenAI)
├── API key in env variables
├── Rate limiting handled
├── Error handling for API failures
└── Billing alerts configured
```

---

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer
├── Backend Instance 1 (Port 8000)
├── Backend Instance 2 (Port 8000)
└── Backend Instance 3 (Port 8000)
        ↓
    MongoDB Replica Set
    (Auto-failover)
```

### Bottlenecks & Solutions
```
Problem: OpenAI API Rate Limits
Solution: Queue system (Redis/Bull)
        → Process interviews asynchronously

Problem: PDF Parsing Slow for Large Files
Solution: Async processing, file size validation
        → Currently limited to 5MB

Problem: Concurrent Interviews
Solution: MongoDB connection pooling
        → FastAPI handles with uvicorn workers

Problem: Network Latency
Solution: Frontend caching with SWR
        → Results cached locally
```

---

## Monitoring & Observability

```
Frontend Metrics
├── Page Load Time (Core Web Vitals)
├── Button Click Events
├── Recording Duration
├── API Call Success Rate
└── Error Messages (Client-side)

Backend Metrics
├── API Response Time
├── Database Query Time
├── OpenAI API Latency
├── Error Rate
└── Concurrent Requests

Database Metrics
├── Query Performance
├── Storage Usage
├── Connection Count
├── Backup Status
└── Replication Lag

Application Health
├── Service Status (Health Check)
├── Dependency Status
├── Error Logs
└── Performance Logs
```

---

This architecture is **production-ready**, **scalable**, **secure**, and **maintainable**.
