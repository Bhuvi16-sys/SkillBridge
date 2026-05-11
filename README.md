# SkillBridge AI 🎓✨
### Adaptive Learning & Performance Intelligence Platform

SkillBridge AI is a state-of-the-art, full-stack adaptive learning intelligence platform. It features deep integration with Gemini models for personalized AI curriculum generation, client-side caching via `UserContext`, dynamic checklist mappings, and backend-driven statistics synchronizations powered by an Express Gateway and Firebase Firestore.

---

## 📂 Repository Structure

The codebase is organized as a clean, decoupled full-stack workspace:

```text
SkillBridge/
├── backend/                  # Express Gateway & Node.js API Service
│   ├── .env                  # Port, database keys, and Gemini secrets
│   ├── package.json          # Express, Firebase Client, Gemini AI SDK deps
│   └── server.js             # Core API endpoints & Firebase handlers
├── frontend/                 # Adaptive React Dashboard (Next.js 14)
│   ├── app/                  # Main views (Dashboard, Planner, Quiz, Profile)
│   ├── components/           # Sidebar, Navbar, and Glassmorphism Widgets
│   ├── context/              # AuthContext, DashboardContext, and UserContext
│   ├── hooks/                # useDashboardData hook
│   ├── types/                # Strict TypeScript declaration contracts
│   └── next.config.mjs       # Next.js API Transparent Proxies & rewrites
└── README.md                 # Project documentation
```

---

## ⚡ Main Technical Features

### 1. Decoupled Express API Gateway 📡
The backend Node.js server serves as a centralized gateway for AI processing and database reads/writes, exposing the following core endpoints:
*   `GET /health`: Server health telemetry check.
*   `GET /api/user/stats` (alias of `/api/getUserStats`): Fetches authenticated user profiles, automatically bootstrapping defaults on-the-fly for fresh log-ins.
*   `POST /api/user/stats/update` (alias of `/api/updateUserStats`): Dynamically logs hours, increases mastery index by **+3% per study hour**, and writes changes directly to Firestore.
*   `POST /api/chat`: Coordinates complex multi-agent actions (Chat, Simplify, Solve, DP Study Planner).
*   `POST /api/gemini/suggestions`: Handles fallback loops across multiple models (`gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ `gemini-1.5-flash`).

### 2. Live State Synchronizer (`UserContext`) 🔄
A dedicated Next.js client context provider `UserContext.tsx` listens to active Firebase Auth states, fetches statistics, and caches `studyHours`, `masteryIndex`, `dailyTasks`, and `assessments` in global state. It exports a `refreshData()` sync hook that updates the layout, mastery bar, and objectives in **real-time** on form submissions without requiring browser reloads!

### 3. High-Fidelity UX & Shimmering Skeletons 🎨
Employs modern CSS animations and shimmering pulsing skeletons inside all glassmorphism KPI card grids and checklist modules. This protects the visual state during API network roundtrips, delivering an extremely premium, state-of-the-art user experience.

---

## 🛠️ Installation & Setup

Follow these simple instructions to launch the platform locally:

### 📥 Prerequisite: Environment Secrets Configuration

1. Create a `.env` file under the `/backend` folder with your credentials:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### 🚀 Launching the Platform

You can start both applications concurrently in separate terminals:

#### 1. Start the Express Backend Server 📡
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Run the server in watch mode (auto hot-reloads on save!)
npm run dev
```
*The API gateway will launch on: **`http://localhost:5000`***

#### 2. Start the Next.js Frontend App 🎨
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```
*The adaptive student dashboard will launch on: **`http://localhost:3000`***

---

## 🛡️ Production Verification & Type-Safety

To perform static builds and verify TypeScript strict contract type-safety, run:
```bash
cd frontend
npx tsc --noEmit
```
Both layers are guaranteed to compile with **`exit-code 0`**!
