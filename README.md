<div align="center">

# 🏛️ JanAudit (जन ऑडिट)
### **India's Citizen-Led Public Accountability & Civic-Tech Platform**

*Empowering 1.4 Billion Citizens with Radical Governance Transparency, Real-Time Civic Audits, and Direct Democratic Accountability.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-v6.1.0-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Role-Based Access](#-role-based-access--demo-credentials) • [API Overview](#-api-endpoints) • [Contributing](#-contributing)

---

</div>

## 📌 About JanAudit

**JanAudit** (*Jan* = People, *Audit* = Accountability/Verification) is a full-stack, real-time civic-tech ecosystem built for Indian democracy. It bridges the gap between citizens, elected representatives (MPs, MLAs, Councillors), and public administrative institutions. 

By unifying crowd-sourced grievance reporting, verified electoral promise tracking, instant RTI drafting, interactive GIS constituency heatmaps, and gamified civic participation, JanAudit transforms passive voters into active custodians of democracy.

---

## ✨ Key Features

### 📢 1. Voice Wall & Geo-Tagged Grievances
- **Real-Time Civic Feed**: Citizens report local governance issues (roads, water, electricity, corruption, sanitation) with geotagging and multimedia evidence.
- **Anonymous Whistleblower Mode**: Cryptographic pseudonymity for whistleblowers exposing corruption or administrative negligence.
- **Citizen Upvoting & Priority Scoring**: High-engagement civic issues bubble to the top and trigger automatic escalation alerts.
- **Image Optimization**: Automated server-side compression and thumbnailing powered by `Sharp`.

### 🏛️ 2. Politician Report Cards & Neta Scorecards
- **Holistic Public Records**: Profiles of MPs, MLAs, and municipal corporators including declared assets, educational background, and criminal cases (ADR/MyNeta data format).
- **Attendance & Fund Utilization**: Track parliamentary/assembly attendance and MPLADS/MLALADS development fund allocation.
- **Citizen Trust & Performance Ratings**: 5-star metric reviews (Honesty, Accessibility, Development, Problem Solving).

### 📜 3. Election Manifesto & Promise Tracker
- **Promise Lifecycle Monitoring**: Categorized into `Fulfilled`, `In Progress`, `Broken`, and `Stalled`.
- **Evidence-Backed Verification**: Community-submitted proof links, official government gazette references, and RTI confirmations before marking promises complete.

### ⚡ 4. Instant RTI Factory (Right to Information)
- **Automated RTI Drafting**: Guided form wizard generating legally compliant RTI applications under Section 6(1) and First Appeals under Section 19(1).
- **Public Information Officer (PIO) Directory**: Pre-mapped departments (PWD, Jal Board, Municipal Corporations, Discoms, Police).
- **Status & Timeline Tracking**: 30-day statutory response countdowns and alert triggers for non-compliance.

### 🗺️ 5. Interactive Constituency GIS Heatmap
- **Visual Spatial Intelligence**: Leaflet-powered interactive maps highlighting issue density, infrastructure roadblocks, and budget expenditure across Lok Sabha & Vidhan Sabha constituencies.
- **Ward-Level Granularity**: Filter by state, district, pin code, or civic category.

### ✍️ 6. Petitions & Digital Mass Mobilization
- **Citizen-Driven Petitions**: Create and sign civic campaigns with threshold milestones.
- **Nodal Officer Escalation**: Automatic email dispatch to competent administrative officers when signature quotas are achieved.

### 🎯 7. Civic Bounty Board & Gamified Karma
- **Crowdsourced Fact-Finding**: Verified bounties for on-ground photo audits (e.g., verifying if a road repair was actually completed).
- **Civic Karma & Badge System**: Earn reputation tiers (`Active Citizen`, `Local Investigator`, `Democracy Guardian`) and unlock community moderation powers.

### 🃏 8. Neta Cards & Satirical Meme Studio
- **Shareable Top Trumps Style Stat Cards**: Generate viral visual summary cards of elected representatives' performance.
- **Meme Creator**: Create satirical civic commentary with built-in attribution and anti-misinformation watermarks.

### 🎵 9. Andolan Live & Protest Jukebox
- **Digital Satyagraha Rooms**: Real-time virtual protest spaces with synchronized live chat (Socket.IO).
- **Protest Jukebox**: Curated anthems of resilience and social change to inspire non-violent civic movements.

---

## 👥 Role-Based Portals

| Role | Capabilities |
|---|---|
| **👤 Citizen** | Post grievances, track RTIs, sign petitions, claim bounties, rate representatives, earn Karma badges. |
| **🏛️ Representative** | Claim official verified profile, publish progress evidence, respond directly to constituency grievances. |
| **🛡️ Moderator** | Review flagged content, verify citizen evidence, enforce community guidelines, prevent hate speech. |
| **👑 Super Admin** | Platform-wide analytics, emergency ticker announcements, institutional directory management, CMS configuration. |

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, CSS Custom Properties, PostCSS
- **Routing**: React Router v7
- **State & Real-time**: React Context API, Socket.IO Client
- **Maps & Charts**: Leaflet, React-Leaflet, Chart.js, React-ChartJS-2
- **Animations & UI**: Framer Motion, Lucide Icons, Canvas-Confetti, Lottie React

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ORM *(with automated In-Memory MongoDB fallback for zero-config local development)*
- **Real-Time Communication**: Socket.IO WebSockets
- **Authentication**: JWT (JSON Web Tokens) with HTTP headers + Bcrypt password hashing
- **Security & Utilities**: Helmet, Express Rate Limit, CORS, Morgan, Multer, Sharp

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas *(Optional: In-memory MongoDB server runs automatically if local database is absent)*

### 1. Clone the Repository
```bash
git clone https://github.com/ayushsood965-sys/janaudit.git
cd janaudit
```

### 2. Install Dependencies
Install all root, backend, and frontend dependencies with one command:
```bash
npm run install:all
```
*Or manually:*
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Configure Environment Variables

**Backend (`server/.env`)**:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/janaudit
JWT_SECRET=your_secure_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Seed the Database with Realistic Demo Data
Populate politicians, institutions, promises, RTI templates, petitions, and demo accounts:
```bash
npm run seed
```

### 5. Start the Development Servers
Run both backend API (`port 5001`) and frontend Vite dev server (`port 5173`) concurrently:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔐 Role-Based Access & Demo Credentials

Use any of these pre-seeded accounts to explore different access levels (Password for all accounts is: `password123`):

| Role | Email | Password | Console URL |
|---|---|---|---|
| **Super Admin** | `admin@janaudit.org` | `password123` | `/dashboard` or `/admin/cms` |
| **Elected Representative** | `mla.rajesh@delhiassembly.gov.in` | `password123` | `/dashboard` |
| **Community Moderator** | `moderator@janaudit.org` | `password123` | `/dashboard` |
| **Citizen (Whistleblower)** | `priya.sharma@example.com` | `password123` | `/dashboard` |

---

## 📁 Directory Structure

```plaintext
janaudit/
├── package.json               # Root workspace scripts (concurrently dev runner)
├── server/                    # Node.js + Express + Socket.IO Backend
│   ├── config/                # Database & server configuration
│   ├── middleware/            # JWT auth, RBAC authorization, upload middlewares
│   ├── models/                # Mongoose schemas (User, Politician, Post, Promise, RTI, etc.)
│   ├── routes/                # REST API routes for all modules
│   ├── seed/                  # Database seeder with realistic civic records
│   ├── services/              # AI helpers, image processors, notification dispatchers
│   ├── uploads/               # Processed media assets & user uploads
│   └── index.js               # Express application & Socket.IO server entrypoint
│
└── client/                    # React 18 + Vite + Tailwind CSS Frontend
    ├── public/                # Static assets, logos, lottie animations
    ├── src/
    │   ├── components/        # Reusable UI components (Navbar, Modals, Cards, Charts)
    │   ├── context/           # AuthContext, SocketContext
    │   ├── pages/             # Route views (VoiceWall, Politicians, RTIs, Maps, etc.)
    │   │   └── dashboard/     # Role-specific consoles (Citizen, Rep, Mod, SuperAdmin)
    │   ├── services/          # Axios API clients & WebSocket subscribers
    │   ├── App.jsx            # Dynamic routing & root layout wrapper
    │   ├── index.css          # Tailwind design tokens & custom utility classes
    │   └── main.jsx           # React DOM root mounting
```

---

## 🔌 API Endpoints

### 🔑 Authentication & Users
- `POST /api/auth/register` — Register a citizen account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Fetch current user profile & permissions

### 📢 Voice Wall & Posts
- `GET /api/posts` — Fetch paginated civic posts (filters: category, location, status)
- `POST /api/posts` — Create a new geo-tagged grievance / whistleblower post
- `PUT /api/posts/:id/upvote` — Upvote or downvote an issue
- `POST /api/posts/:id/comments` — Add citizen commentary or officer update

### 🏛️ Politicians & Promises
- `GET /api/politicians` — List representatives with performance filters
- `GET /api/politicians/:id` — Detailed report card, attendance & asset records
- `GET /api/promises` — List tracked election promises with verification status
- `POST /api/promises/:id/verify` — Submit verification proof for a promise

### ⚡ RTI & Petitions
- `POST /api/rti/generate` — Generate structured RTI application / appeal
- `GET /api/rti/templates` — List standard RTI departmental templates
- `GET /api/petitions` — List ongoing civic petitions & signature status
- `POST /api/petitions/:id/sign` — Digitally sign a petition

---

## 🛡️ Security & Privacy
- **Zero Raw Phone Storage**: Phones hashed with SHA-256 for non-reversible citizen uniqueness verification.
- **Strict Rate Limiting**: Protection against spam grievance filings and DDoS attacks using `express-rate-limit`.
- **Sanitized Uploads**: Image sanitization and re-encoding via `sharp` to strip malicious EXIF metadata.
- **Role-Based Middlewares**: Granular endpoint protection ensuring only authorized roles perform privileged actions.

---

## 🤝 Contributing

Contributions to JanAudit are wholeheartedly welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/CivicInnovation`)
3. Commit your changes (`git commit -m "feat: Add constituency budget visualizer"`)
4. Push to the branch (`git push origin feature/CivicInnovation`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ for Indian Democracy and Accountable Governance.</b>
</div>
