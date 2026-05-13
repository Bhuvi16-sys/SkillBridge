### State-of-the-Art Adaptive Learning & Professional Talent Matching Platform

SkillBridge is an advanced, enterprise-grade full-stack adaptive study intelligence and corporate recruitment platform. Designed with high-performance aesthetics, it provides students with AI-generated study paths, personalized quizzes, and portfolio indexing. Simultaneously, it empowers corporate recruiters with dynamic candidate search rosters, AI-powered resume analyzers, and real-time handshake connection requests.

## Website link
[Live Demo](https://skillbridge-uoag.onrender.com/)
## 🎥 Video Demo

[![SkillBridge AI Demo](https://img.youtube.com/vi/Q-IPCM6Kehk/maxresdefault.jpg)](https://www.youtube.com/watch?v=Q-IPCM6Kehk)

*Click the image above to watch the full walkthrough of the **SkillBridge AI** ecosystem, covering both the Student and Recruiter portals.*

---
## 📸 Platform Preview

| Feature | Description | Preview |
| :--- | :--- | :--- |
| **Student Dashboard** | Centralized hub for learning paths and progress tracking. | <img src="https://github.com/user-attachments/assets/2989d024-5e55-48d6-8aa9-6863934a0c3e" width="400" /> |
| **Analytics & Readiness** | Visual insights into skill gaps and hackathon readiness. | <img src="https://github.com/user-attachments/assets/139da773-20c8-4501-813c-7b0c03f2453b" width="400" /> |
| **Recruiter Discovery Pool** | A dynamic talent roster for corporate partner matching. | <img src="https://github.com/user-attachments/assets/c099257d-23d3-4859-a2c0-17712864509a" width="400" /> |
| **Resume Intelligence** | AI-powered parsing to highlight candidate strengths. | <img src="https://github.com/user-attachments/assets/adabcc4d-b586-47dd-b99b-a205505c2a1c" width="400" /> |
| **Connection Requests** | Real-time "handshake" networking between students and HR. | <img src="https://github.com/user-attachments/assets/47b3ca22-6f88-447b-a2e5-117d671f987f" width="400" /> |
| **Platform Modals** | High-performance UI components for seamless interaction. | <img src="https://github.com/user-attachments/assets/facf916f-2678-4826-a46f-c23a8aaf8975" width="400" /> |

The platform helps students:
- Identify weak topics
- Improve skills with AI-generated learning paths
- Track progress through analytics dashboards
- Build stronger resumes

At the same time, companies can:
- Discover job-ready students
- Analyze resumes intelligently
- Filter candidates based on skills
- Connect with suitable talent directly

SkillBridge combines:
- AI learning assistance
- Smart analytics
- Resume intelligence
- Recruiter-student networking

into one integrated ecosystem.
Problem Statement

## Problems Faced by Students
- Lack of personalized learning guidance
- Difficulty identifying skill gaps
- Limited industry exposure
- Weak resume visibility
- No centralized growth tracking

## Problems Faced by Recruiters
- Difficulty finding skilled candidates
- Time-consuming resume screening
- Lack of practical skill insights
- Poor student-company interaction systems

## Our Solution

SkillBridge AI solves these challenges by providing:
- AI-generated adaptive study paths
- Skill-gap analysis dashboards
- AI resume parsing system
- Smart recruiter-candidate matching
- Real-time recruiter-student interaction

---

# ✨Core  Features

---

## 🎯 Student Features

### 📚 AI Study Planner
- Personalized study recommendations
- AI-generated learning roadmap
- Adaptive topic suggestions

### 🧠 AI Quiz Generator
- Dynamic quiz generation
- Topic-based assessments
- Weak-area detection

### 📊 Performance Dashboard
- Weekly progress tracking
- Readiness score visualization
- Topic completion monitoring
- Achievement analytics

### 📄 Resume Intelligence
- Resume upload system
- AI-based resume parsing
- Skill extraction
- Resume visualization

### 🔔 Notification System
- Real-time recruiter invitations
- Connection request updates
- Instant notification badges

---

## 🏢 Recruiter Features

### 🔍 Student Discovery System
- Search students by skills
- Readiness score filtering
- Achievement-based ranking

### 🤝 Recruiter Handshakes
- Send direct invitations
- Personalized recruiter messages
- Real-time student interaction

### 📑 Resume Viewer
- Resume preview modal
- Candidate skill summary
- PDF download support

---
---

## Architecture 
<img width="1536" height="1024" alt="WhatsApp Image 2026-05-13 at 9 07 49 PM" src="https://github.com/user-attachments/assets/1cf65f71-bbb8-4f4b-8537-151d96f8483f" />

## Repository Structure

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

## Main Technical Features

### 1. Dual-Role Authentication & Security Guards
* **Smart Signup Router:** Interactive signup selector lets users enroll as a **Student** or **Corporate Recruiter**. During recruiter registration, it captures enterprise details like Company Name.
* **Layout Security Guards:** Role-based redirection is built directly into parent Next.js layouts (`/dashboard/layout.tsx` and `/company-dashboard/layout.tsx`). If a recruiter lands on a student page, they are instantly redirected back to their corporate dashboard, and vice-versa, with zero content flickering.

### 2. Recruiter Student Discovery & Handshakes
* **High-Readiness Rosters:** Renders student scholars ordered dynamically by their Job Readiness indices and Achievements scores in Firestore.
* **Fuzzy Filtering:** Text-search queries filter students on-the-fly client-side by full name or specific competencies.
* **Integrated Handshake Modals:** Recruiters can send personalized connection requests. This writes a pending invitation document in the main `connections` collection.
* **Real-time Handshake Notifications:** Students instantly receive a visual notification badge in their header. Under `/dashboard/notifications`, they can view recruiter messages and click **Accept Invitation** or **Decline**, which syncs back to the database in real-time.

### 3. Active Resume Metrics Syncer & AI Parser
* **Student Upload Portal:** On their profile, students can select or drop `.pdf`, `.doc`, or `.docx` resume files.
* **AI Parser Simulation:** Shows a gorgeous, step-by-step progress animation simulating semantic parsing on our AI engine. The file metadata is persisted directly to their Firestore profile.
* **Recruiter Resume Viewer:** Recruiters can click **View Synced Resume** on any student card to open a custom visualizer modal summarizing the candidate's education, matched skills, and an active PDF download link.

### 4. 100% Mobile Responsive Fluid Layouts
* **Slide-Out Sidebars:** Sidebars automatically compress into hidden layouts and slide smoothly into view with custom gestures or hamburger taps on mobile viewports.
* **Backdrop Dimming:** Opening menus on tablets or mobile phones displays a blurred backdrop shadow (`backdrop-blur-sm bg-slate-950/60`). Tapping anywhere outside the menu slides it back out of view.
* **Fluid Padding grids:** Grid content areas scale dynamically from phone screens (`p-4`) up to widescreen monitors (`p-8`).

---



## Installation & Local Setup

### Prerequisites & Secrets Configuration

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

### Running the Full-Stack Workspace

Launch both layers in separate terminal instances:

#### 1. Start the Express Gateway (Backend)
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server in hot-reload watch mode
npm run dev
```
*The API gateway will listen on: **`http://localhost:5000`***

#### 2. Start the React/Next.js Client (Frontend)
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

## Compilation, Quality, & Type-Safety

To run static builds and confirm strict compilation with zero TypeScript errors:
```bash
cd frontend
npx tsc --noEmit
```
Both layers are guaranteed to compile with **`exit-code 0`**!

SkillBridge: Because finding the right talent shouldn't be a guessing game, and building your career shouldn't be a solo journey.
