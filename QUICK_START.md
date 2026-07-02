# ⚡ Quick Start - AI Interview Assistant

> Get up and running in 10 minutes

## Prerequisites Check
```bash
node --version     # Should be v18+
python --version   # Should be 3.9+
git --version      # Should work
```

## 1️⃣ Get API Keys (5 minutes)

### OpenAI API Key
1. Go to https://platform.openai.com/account/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy it (example: `sk-proj-abc123...`)

### MongoDB Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click "Create Free Tier Cluster"
4. Click "Connect" on your cluster
5. Choose "Drivers"
6. Copy the connection string
7. Replace `<username>` and `<password>` with your credentials

## 2️⃣ Configure Project (2 minutes)

```bash
cd /vercel/share/v0-project

# Create .env.local with your credentials
cat > .env.local << 'EOF'
OPENAI_API_KEY=sk-proj-your-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# Copy to backend
cp .env.local backend/.env
```

## 3️⃣ Install Dependencies (2 minutes)

```bash
# Frontend
pnpm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

## 4️⃣ Start Services (1 minute)

**Option A: Automatic (Recommended)**
```bash
./start.sh
```

**Option B: Docker**
```bash
docker-compose up
```

**Option C: Manual**
```bash
# Terminal 1
pnpm dev

# Terminal 2
cd backend
source venv/bin/activate
python main.py
```

## 5️⃣ Test It!

1. Open http://localhost:3000 in browser
2. Click "Start Your Interview Now"
3. Upload a sample resume (PDF)
4. Follow the interview flow

## API Endpoints (For Testing)

```bash
# Health check
curl http://localhost:8000/api/health

# Swagger UI (Interactive API testing)
http://localhost:8000/docs

# Backend API base
http://localhost:8000
```

## Common Issues

### "Module not found" (Backend)
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
```

### "Port already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### "MongoDB connection failed"
- Check internet connection
- Verify MongoDB connection string
- Go to MongoDB Atlas → Network Access → Add IP

### "OpenAI API Error"
- Verify API key is correct
- Check API key has $5 free credits remaining

## Project Structure (Important Files)

```
/vercel/share/v0-project/
├── app/                           # Pages
│   ├── page.tsx                  # Homepage
│   └── interview/
│       ├── upload-resume/page.tsx
│       ├── session/page.tsx
│       └── results/page.tsx
├── components/                    # React components
├── backend/                       # FastAPI server
│   ├── main.py                   # Start here
│   ├── routes/                   # API endpoints
│   └── services/                 # Core logic
├── SETUP_GUIDE.md                # Detailed setup
├── README.md                     # Full documentation
├── ARCHITECTURE.md               # System design
└── IMPLEMENTATION_SUMMARY.md     # What was built
```

## Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | User interface |
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Health Check | http://localhost:8000/api/health | Status |

## Environment Variables Explained

| Variable | Example | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | `sk-proj-...` | GPT-4 API access |
| `MONGODB_URI` | `mongodb+srv://...` | Database connection |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL |

## Interview Flow (Step-by-Step)

```
1. Upload Resume (PDF)
   ↓
2. System Extracts Skills
   ↓
3. Click "Start Interview"
   ↓
4. Answer 5 Questions (Record voice)
   ↓
5. Get Scores + Feedback
   ↓
6. View Results & Improvement Plan
```

## Frontend Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint
```

## Backend Commands

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Start server
python main.py

# Run specific port
python -m uvicorn main:app --port 8001

# With auto-reload
python -m uvicorn main:app --reload
```

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild images
docker-compose build
```

## Troubleshooting Flow

```
Issue? 
  ├─ Check error message
  ├─ Look in SETUP_GUIDE.md Troubleshooting section
  ├─ Verify:
  │  ├─ .env.local exists with correct values
  │  ├─ Backend virtual environment activated
  │  ├─ MongoDB connection works
  │  └─ OpenAI API key is valid
  ├─ Try restarting services
  └─ Check console logs
```

## Next Steps

### Learn the System
1. Read `ARCHITECTURE.md` - Understand how it works
2. Read `README.md` - Full feature guide
3. Check `IMPLEMENTATION_SUMMARY.md` - What was built

### Extend It
- Add user authentication (see README)
- Deploy to production (see README)
- Add more features (see ARCHITECTURE.md)

### Deploy
```bash
# Frontend to Vercel
vercel deploy

# Backend to Railway/Render
# (See README.md Deployment section)
```

## 🎉 You're Ready!

Start with: `./start.sh`

Or follow manual steps above.

---

**Having issues?** See `SETUP_GUIDE.md` for detailed help.

**Want full documentation?** Read `README.md`.

**Need technical details?** Check `ARCHITECTURE.md`.
