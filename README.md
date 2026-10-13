# 🏎️ PADDOCK TELEMETRY — F1 Command Center & Telemetry Reconnaissance

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase PKCE](https://img.shields.io/badge/Supabase-Auth%20PKCE-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![FastF1 Telemetry](https://img.shields.io/badge/FastF1-Python%20Engine-FF1801?style=for-the-badge&logo=formula1)](https://github.com/theOdev/FastF1)
[![Circuits Supported](https://img.shields.io/badge/F1%20Circuits-78%20Tracks-E10600?style=for-the-badge&logo=formula1)](https://www.formula1.com/)

**Paddock Telemetry** is a state-of-the-art Formula 1 telemetry, pit-wall reconnaissance, and race replay command center. Built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase PKCE Auth**, and **FastF1 Python telemetry data integration**, Paddock delivers real-time driver tracking, 60fps vector track canvas rendering, teammate head-to-head battle metrics, and comprehensive corner telemetry for **78 F1 circuits**.

---

## 📘 Comprehensive Engineering Documentation Suite

Paddock Telemetry provides an enterprise-grade, modular software engineering documentation suite:

| Specification Document | Focus Area | Description |
| :--- | :--- | :--- |
| **[01_PRD.md](./docs/01_PRD.md)** | Product Requirements | Product vision, target personas, problem statement, and roadmap |
| **[02_SRS.md](./docs/02_SRS.md)** | Software Requirements | Functional & non-functional system requirements and SLAs |
| **[03_USER_STORIES.md](./docs/03_USER_STORIES.md)** | User Stories & BDD | Agile epics, user stories, and Gherkin acceptance criteria |
| **[04_SYSTEM_ARCHITECTURE.md](./docs/04_SYSTEM_ARCHITECTURE.md)** | System Architecture | Next.js 16 + FastF1 + Supabase diagrams, coordinate pipelines |
| **[05_DATABASE_DESIGN.md](./docs/05_DATABASE_DESIGN.md)** | Database Design | PostgreSQL schema, ERD diagrams, triggers, and RLS policies |
| **[06_API_SPECIFICATION.md](./docs/06_API_SPECIFICATION.md)** | API Specification | Complete endpoints reference, caching proxies, and status codes |
| **[07_UI_UX_SPECIFICATION.md](./docs/07_UI_UX_SPECIFICATION.md)** | UI/UX Specification | Dark pit-wall design tokens, tire palettes, 60fps canvas rules |
| **[08_SECURITY.md](./docs/08_SECURITY.md)** | Security Architecture | PKCE auth, hardened CSP without unsafe-eval, rate limiting |
| **[09_TESTING_STRATEGY.md](./docs/09_TESTING_STRATEGY.md)** | QA & Benchmarks | 1,000-user load test results, canvas benchmarks, build audits |
| **[10_DEPLOYMENT.md](./docs/10_DEPLOYMENT.md)** | Deployment & Ops | Environment matrix, Vercel/Docker deployment, and smoke tests |

---

## ⚡ Key Systems & Core Features

### 🗺️ 1. 78 F1 Circuit Satellite Canvas & Corner Reconnaissance (`/gallery`)
- **Complete Track Coverage**: Supports all 24 official modern Championship Grand Prix venues and 54 historic heritage & future circuits (Nürburgring Nordschleife, Brands Hatch, Kyalami, Sepang, Indianapolis, Madrid 2026) spanning **4,348 calibrated corners**.
- **Calibrated Apex Telemetry Specs**: Displays verified telemetry metrics per corner — entry, apex, and exit speeds (km/h), typical gear distribution, braking G-force, DRS zones, and overtaking strategy ratings.
- **Intelligent Auto-Settle Layout Transform**: Automatically tilts vertically-oriented circuits 90° clockwise so narrow tracks settle comfortably in widescreen viewports.
- **5-Pass Iterative Collision Relaxation**: Dynamically spaces corner badges in tight chicanes with a 38px clearance threshold, preventing badge overlap and eliminating hover jitter.
- **Intelligent Apex Matcher**: Dynamically maps corner selections to verified high-resolution apex photography and fallback team wallpapers.

### ⏱️ 2. 60fps Interactive Race Replay Engine (`/replay`)
- **GPU-Accelerated Canvas Engine**: 60fps telemetry playback engine displaying car positions, gaps, and telemetry graphs.
- **Playback Controls**: Variable rates (1x, 2x, 5x, 10x), scrubber timeline, frame stepping, and lap-by-lap playback.
- **Telemetry Gauges**: Real-time tachometers, speed monitors, DRS status, ERS charge %, and tire compound degradation indicators.

### ⚔️ 3. Teammate Head-to-Head Battle Portal (`/teammates`)
- **Constructor Rivalries**: H2H comparisons across all 10 F1 constructor teams.
- **Telemetry Delta Graphs**: Cumulative championship points progression curves, qualifying pace deltas, and finishing statistics.

### 🔬 4. High-Contrast Telemetry & Strategy Lab (`/lab`)
The Strategy Lab provides an advanced four-tool telemetry reconnaissance and race engineer strategy suite:
- **Circuit DNA & Sector Domination Matrix (`CircuitDNASectorMatrix.tsx`)**:
  - **100% Empirical Telemetry**: Decomposes authentic FIA session timing into **Sector 1 (high-speed aero downforce)**, **Sector 2 (mechanical traction & direction changes)**, and **Sector 3 (power unit efficiency & DRS speed traps)** without synthetic AI guesses.
  - **Theoretical Ultimate Lap**: Synthesizes purple micro-sector benchmarks across all drivers to compute the mathematical ceiling of the circuit.
  - **Constructor Aero Dominance**: Computes team mechanical vs aerodynamic chassis balance with sector-by-sector head-to-head duels.
- **Head-to-Head Tactical Strategy Duel (`TacticalStrategyDuel.tsx`)**:
  - **Race Pace & Pit Battle Engine**: Merges authentic long-run race pace deltas with dynamic 1-stop vs. 2-stop undercut and overcut simulations.
  - **Live Gap Evolution**: Visualizes projected track intervals across all race laps with pit loss offsets.
  - **Safety Car / VSC Injections**: Simulates tactical pit window compression under Safety Car ($14\text{s}$ loss) and Virtual Safety Car ($11\text{s}$ loss) conditions.
- **Tyre Degradation & Stint Whisperer Lab (`TyreDegradationLab.tsx`)**:
  - **Track-Specific Pirelli Allocations**: Ingests official **C1 through C5** compound nominations (Hard, Medium, Soft) for every Grand Prix circuit.
  - **3-Phase Thermal Cliff Physics Engine**: Models non-linear compound behavior across Phase 1 (Scrub-in Peak, Laps 1–3), Phase 2 (Management Plateau), and Phase 3 (Exponential Thermal Cliff: $\Delta\text{s} \propto (\text{lapsOverCliff})^{1.55}$).
  - **Dynamic Crossover Lap Detection**: Automatically calculates the exact lap where a degrading softer compound crosses pace parity with a fresh harder tyre.
  - **Fuel-Burnoff Compensation**: Adjusts stint degradation by $+0.055\text{s/lap}$ to isolate genuine rubber wear from vehicle mass reduction.
  - **Tyre Whisperer Index**: Evaluates driver management efficiency on a 0–100 scale with driving style presets (*Whisperer*, *Balanced*, *Attack*).
- **Telemetry & Lap Trace Overlay Analyzer**:
  - High-contrast multi-channel overlays comparing speed traces (km/h), throttle percentage, braking pressure, and gear shifts across hot laps.

### 🔐 5. Enterprise Supabase PKCE Auth & Security
- **Hard Credential Verification**: Multi-layer password authentication with Supabase PKCE.
- **Google OAuth 2.0 PKCE**: Seamless single sign-on with multi-account device chooser (`prompt: 'select_account'`).
- **Mandatory Email Gate**: Enforces verified email status before granting pit-wall telemetry access.

---

## 📐 System Architecture Summary

```mermaid
graph LR
    Client["🖥️ Client (Next.js 16 App Router)"] --> API["⚡ API Gateway (/api/circuits, /api/auth)"]
    Client --> Lab["🔬 Strategy Lab (/lab: Circuit DNA + Tyre Physics + Pit Duels)"]
    API --> Engine["🏎️ Coordinate Engine (circuitTransform.ts)"]
    API --> Proxy["🐍 FastF1 Python Telemetry Proxy"]
    Proxy --> FastF1["🌐 Official F1 Timing & Telemetry Data"]
    Client --> Supabase["🔐 Supabase PKCE Auth & Session Guard"]
```

---

## 🛠️ Environment Setup (`.env.local`)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-secure-jwt-secret-key
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛩️ Deployment

```bash
# Production build check
npm run build
```

Deploy seamlessly to **[Vercel](https://vercel.com)** by connecting your GitHub repository.
