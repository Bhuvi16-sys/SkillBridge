# SkillBridge AI 🎓💼✨
### State-of-the-Art Adaptive Learning & Professional Talent Matching Platform

SkillBridge is an advanced, enterprise-grade full-stack adaptive study intelligence and corporate recruitment platform. Designed with high-performance aesthetics, it provides students with AI-generated study paths, personalized quizzes, and portfolio indexing. Simultaneously, it empowers corporate recruiters with dynamic candidate search rosters, AI-powered resume analyzers, and real-time handshake connection requests.

---

## 📂 Repository Structure

The repository is built as a cleanly decoupled, production-ready full-stack workspace:

```text
SkillBridge/
├── backend/                  # Centralized Express Gateway & Node.js Microservices
│   ├── .env                  # Secrets, Firebase Admin, and AI API credentials
│   ├── package.json          # Server-side packages (Express, Cors, Dotenv, Gemini AI)
│   └── server.js             # API controllers, AI model fallbacks & Firestore gateways
├── frontend/                 # High-Performance Next.js 14 Client Dashboard
│   ├── app/                  # App Router views (Student Dashboard & Company Portal)
│   │   ├── signup/           # Dual-role signup portal (Student / Recruiter)
│   │   ├── login/            # Adaptive role-aware login redirection routing
│   │   ├── dashboard/        # Student-facing workspace (Assistant, Planner, Quizzes)
│   │   └── company-dashboard/# Recruiter-facing matching & scholar rosters
│   ├── components/           # Reusable glassmorphic UI widgets (Sidebars, TopNavbars)
│   ├── context/              # Central state hubs (AuthContext, UserContext, DashboardContext)
│   ├── hooks/                # Custom React query abstractions (useDashboardData)
│   ├── lib/                  # Database model schema converters & Firebase Client configs
│   ├── next.config.mjs       # Dev proxy routing & rewrite middleware
│   └── package.json          # Frontend packages (React, Lucide, Framer Motion)
└── README.md                 # Complete platform architectural blueprint
```

---

## ⚡ Main Technical Features

### 1. Dual-Role Authentication & Security Guards 🛡️
* **Smart Signup Router:** Interactive signup selector lets users enroll as a **Student** or **Corporate Recruiter**. During recruiter registration, it captures enterprise details like Company Name.
* **Layout Security Guards:** Role-based redirection is built directly into parent Next.js layouts (`/dashboard/layout.tsx` and `/company-dashboard/layout.tsx`). If a recruiter lands on a student page, they are instantly redirected back to their corporate dashboard, and vice-versa, with zero content flickering.

### 2. Recruiter Student Discovery & Handshakes 🤝
* **High-Readiness Rosters:** Renders student scholars ordered dynamically by their Job Readiness indices and Achievements scores in Firestore.
* **Fuzzy Filtering:** Text-search queries filter students on-the-fly client-side by full name or specific competencies.
* **Integrated Handshake Modals:** Recruiters can send personalized connection requests. This writes a pending invitation document in the main `connections` collection.
* **Real-time Handshake Notifications:** Students instantly receive a visual notification badge in their header. Under `/dashboard/notifications`, they can view recruiter messages and click **Accept Invitation** or **Decline**, which syncs back to the database in real-time.

### 3. Active Resume Metrics Syncer & AI Parser 📄
* **Student Upload Portal:** On their profile, students can select or drop `.pdf`, `.doc`, or `.docx` resume files.
* **AI Parser Simulation:** Shows a gorgeous, step-by-step progress animation simulating semantic parsing on our AI engine. The file metadata is persisted directly to their Firestore profile.
* **Recruiter Resume Viewer:** Recruiters can click **View Synced Resume** on any student card to open a custom visualizer modal summarizing the candidate's education, matched skills, and an active PDF download link.

### 4. 100% Mobile Responsive Fluid Layouts 📱
* **Slide-Out Sidebars:** Sidebars automatically compress into hidden layouts and slide smoothly into view with custom gestures or hamburger taps on mobile viewports.
* **Backdrop Dimming:** Opening menus on tablets or mobile phones displays a blurred backdrop shadow (`backdrop-blur-sm bg-slate-950/60`). Tapping anywhere outside the menu slides it back out of view.
* **Fluid Padding grids:** Grid content areas scale dynamically from phone screens (`p-4`) up to widescreen monitors (`p-8`).

---

## 🛠️ Installation & Local Setup

### 📥 Prerequisites & Secrets Configuration

Create a `.env` file inside the `/backend` directory:
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

### 🚀 Running the Full-Stack Workspace

Launch both layers in separate terminal instances:

#### 1. Start the Express Gateway (Backend) 📡
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server in hot-reload watch mode
npm run dev
```
*The API gateway will listen on: **`http://localhost:5000`***

#### 2. Start the React/Next.js Client (Frontend) 🎨
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```
*The SkillBridge client interface will launch on: **`http://localhost:3000`***

---

## 🛡️ Compilation, Quality, & Type-Safety

To run static builds and confirm strict compilation with zero TypeScript errors:
```bash
cd frontend
npx tsc --noEmit
```
Both layers are guaranteed to compile with **`exit-code 0`**!
