# AI Interview Assistant - Complete Setup Guide

> 🚀 Follow this guide step-by-step to build and run the AI Interview Assistant locally on your machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Get API Keys](#get-api-keys)
3. [Set Up MongoDB Atlas](#set-up-mongodb-atlas)
4. [Configure Environment](#configure-environment)
5. [Install Dependencies](#install-dependencies)
6. [Run Locally](#run-locally)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Python** (v3.9+) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **Terminal/Command Prompt** - Basic comfort running commands
- **Web Browser** - Chrome, Firefox, Safari, or Edge

**Verify installations:**
```bash
node --version    # Should show v18 or higher
python --version  # Should show 3.9 or higher
git --version     # Should show version info
```

---

## Get API Keys

### 1️⃣ OpenAI API Key (5 minutes)

**Step 1:** Go to https://platform.openai.com/account/api-keys

**Step 2:** Sign up or log in with your account
- Create free account if needed
- You'll get $5 free credits

**Step 3:** Click "Create new secret key"
- Give it a name (e.g., "Interview Assistant")
- Copy the key immediately (you won't see it again!)

**Step 4:** Save this key safely (we'll use it later)
- Example: `sk-proj-abc123def456...`

**⚠️ Important:** 
- Never share this key
- Never commit it to Git
- Add `$5 free credits` lasts 3 months

---

## Set Up MongoDB Atlas

### 1️⃣ Create MongoDB Account (5 minutes)

**Step 1:** Go to https://www.mongodb.com/cloud/atlas

**Step 2:** Click "Sign Up for Free"
- Use your email or Google account
- Complete email verification

**Step 3:** Create your organization and project
- Organization Name: "Interview Assistant" (or anything)
- Project Name: "Dev" (or anything)
- Click "Create"

### 2️⃣ Create a Database Cluster

**Step 4:** On the "Create a Deployment" screen:
- Select **"Free"** tier (M0, 0.5GB storage - perfect for testing)
- Region: Choose closest to you
- Cluster Name: "interview-cluster"
- Click "Create Deployment"

**Step 5:** Create database credentials
- Username: `admin_user` (or any name)
- Password: Generate or create strong one
- Copy these credentials (save somewhere safe)
- Click "Create User"

**Step 6:** Set up network access
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (for local testing)
- Click "Confirm"
- ⚠️ *For production, use specific IP instead*

### 3️⃣ Get Connection String

**Step 7:** Go to "Databases" in left sidebar

**Step 8:** Click your cluster → "Connect" button

**Step 9:** Choose "Drivers" → Select "Python" and version "3.9 or later"

**Step 10:** Copy the connection string:
```
mongodb+srv://admin_user:YOUR_PASSWORD@interview-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Replace `YOUR_PASSWORD` with your actual password from Step 5**

**Save this connection string** - you'll need it in the next step.

---

## Configure Environment

### 1️⃣ Create .env.local File

In your project root (`/vercel/share/v0-project`), create a file named `.env.local`:

```env
# OpenAI API
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# MongoDB
MONGODB_URI=mongodb+srv://admin_user:YOUR_PASSWORD@interview-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2️⃣ Fill in Your Values

Replace:
- `sk-proj-YOUR-KEY-HERE` → Your OpenAI API key from Step 1
- `YOUR_PASSWORD` → Your MongoDB password
- Keep entire connection string (copy the whole thing)

**Example (DO NOT USE):**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl
MONGODB_URI=mongodb+srv://admin_user:MyP@ssw0rd123@interview-cluster.xyz123.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3️⃣ Create Backend .env

Copy the `.env.local` to `backend/.env`:

```bash
cp .env.local backend/.env
```

**Verify:** You should now have:
- `/vercel/share/v0-project/.env.local` ✅
- `/vercel/share/v0-project/backend/.env` ✅

---

## Install Dependencies

### 1️⃣ Install Frontend Dependencies

```bash
cd /vercel/share/v0-project
npm install
# or
pnpm install
# or
yarn install
```

**Wait for installation to complete** (2-3 minutes)

### 2️⃣ Install Backend Dependencies

```bash
cd backend
python -m venv venv
```

**Activate virtual environment:**

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

**Install Python packages:**
```bash
pip install -r requirements.txt
```

**Verify:** You should see `(venv)` in your terminal prompt when activated.

---

## Run Locally

### Method 1: Run Both Services (Recommended for First Time)

**Terminal 1 - Frontend:**
```bash
cd /vercel/share/v0-project
npm run dev
# or
pnpm dev
```

Wait for message: `▲ Next.js 16.x ready in 1.2s`

**Terminal 2 - Backend:**
```bash
cd /vercel/share/v0-project/backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

Wait for message: `Uvicorn running on http://0.0.0.0:8000`

### ✅ Success!

- **Frontend:** Open http://localhost:3000 in your browser
- **Backend API Docs:** Open http://localhost:8000/docs (Swagger UI)
- **Backend Health Check:** Open http://localhost:8000/api/health

### Method 2: Using Docker (Alternative)

If you prefer running everything in Docker:

```bash
cd /vercel/share/v0-project
docker-compose up
```

Then open:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

---

## Troubleshooting

### ❌ "ModuleNotFoundError: No module named 'fastapi'"

**Solution:** Make sure you activated the virtual environment:
```bash
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows
```

### ❌ "OPENAI_API_KEY not found"

**Solution:** 
1. Check `.env.local` exists in project root
2. Verify you pasted the full API key
3. Restart the backend server

### ❌ "MongoDBError: DNS lookup failed"

**Causes:**
- Internet connection issue
- MongoDB connection string incorrect
- IP whitelist not configured

**Solutions:**
1. Check internet connection: `ping 8.8.8.8`
2. Verify connection string in MongoDB Atlas (Databases → Connect)
3. Go to MongoDB Atlas → Network Access → Add IP → "Allow Access from Anywhere"

### ❌ "Port 3000 already in use"

**Solution:** Kill existing process or use different port:
```bash
npm run dev -- -p 3001
```

### ❌ "Port 8000 already in use"

**Solution:** Kill existing process or change FastAPI port in `backend/main.py`:
```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Change 8000 to 8001
```

### ❌ "CORS Error: Access denied from localhost:3000"

**Solution:** Backend CORS is likely not configured. Restart backend with:
```bash
python main.py
```

Verify output shows: `CORS middleware is configured`

---

## Next Steps

1. ✅ Open http://localhost:3000 in your browser
2. ✅ Click "Start Interview" on homepage
3. ✅ Upload a sample resume (PDF)
4. ✅ System will parse it and extract skills
5. ✅ Generate interview questions
6. ✅ Record voice answers
7. ✅ Get AI evaluation and improvement plan

---

## Project Structure

```
/vercel/share/v0-project/
├── app/                          # Next.js pages
│   ├── layout.tsx
│   ├── page.tsx                  # Home
│   ├── interview/
│   │   ├── upload-resume/
│   │   ├── session/
│   │   ├── results/
│   │   └── improvement-plan/
├── components/                   # React components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities
│   ├── api.ts                    # API client
│   └── utils.ts
├── backend/                      # FastAPI server
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── services/
├── .env.local                    # Your credentials (DO NOT COMMIT)
├── docker-compose.yml            # Docker setup
└── SETUP_GUIDE.md               # This file
```

---

## Important Security Notes

🔒 **Never do these:**
- Commit `.env.local` to Git
- Share API keys in Slack/Discord
- Push credentials to GitHub
- Use production keys for testing

✅ **Always do these:**
- Keep `.env.local` in `.gitignore` (already there)
- Regenerate keys if you accidentally shared them
- Use environment variables for all secrets
- Enable 2FA on all online accounts

---

## Support

Having issues? 

1. Check [Troubleshooting](#troubleshooting) section above
2. Verify all steps completed in [Prerequisites](#prerequisites)
3. Check your API key is valid at https://platform.openai.com/account/api-keys
4. Verify MongoDB connection at https://cloud.mongodb.com

---

**Happy interviewing! 🚀**

This setup guide will get you running locally. Next, follow the implementation phases to build features and integrate components.
