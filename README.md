# 🏛️ JanHisab (जन हिसाब)
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

## 📌 About JanHisab

**JanHisab** (*Jan* = People, *Hisab* = Accountability/Audit) is a full-stack, real-time civic-tech ecosystem built for Indian democracy. It bridges the gap between citizens, elected representatives (MPs, MLAs, Councillors), and public administrative institutions. 

By unifying crowd-sourced grievance reporting, verified electoral promise tracking, instant RTI drafting, interactive GIS constituency heatmaps, and gamified civic participation, JanHisab transforms passive voters into active custodians of democracy.

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
git clone https://github.com/your-username/janhisab-platform.git
cd janhisab-platform
