# 🏎️ PADDOCK TELEMETRY — F1 Command Center & Telemetry Reconnaissance

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Vitest-68%20Passing%20(10%20Suites)-3ECF8E?style=for-the-badge&logo=vitest)](./docs/09_TESTING_STRATEGY.md)
[![Supabase PKCE](https://img.shields.io/badge/Supabase-Auth%20PKCE-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![FastF1 Telemetry](https://img.shields.io/badge/FastF1-Python%20Engine-FF1801?style=for-the-badge&logo=formula1)](https://github.com/theOdev/FastF1)
[![Circuits Supported](https://img.shields.io/badge/F1%20Circuits-78%20Tracks-E10600?style=for-the-badge&logo=formula1)](https://www.formula1.com/)

**Paddock Telemetry** is a state-of-the-art Formula 1 telemetry, pit-wall reconnaissance, and race prediction command center. Built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase PKCE Auth**, and **FastF1 Python telemetry data integration**, Paddock delivers real-time driver tracking, 60fps vector track canvas rendering, teammate head-to-head battle metrics, calibrated post-qualifying machine learning race predictions, and comprehensive corner telemetry for **78 F1 circuits**.

---

## 📘 Comprehensive Engineering Documentation Suite

Paddock Telemetry provides an enterprise-grade, modular software engineering documentation suite:

| Specification Document | Focus Area | Description |
| :--- | :--- | :--- |
| **[DESIGN.md](./DESIGN.md)** | Design System & Tokens | Translucent glassmorphism, official F1 typography, and HUD specifications |
| **[01_PRD.md](./docs/01_PRD.md)** | Product Requirements | Product vision, target personas, problem statement, and roadmap |
| **[02_SRS.md](./docs/02_SRS.md)** | Software Requirements | Functional & non-functional system requirements and SLAs |
| **[03_USER_STORIES.md](./docs/03_USER_STORIES.md)** | User Stories & BDD | Agile epics, user stories, and Gherkin acceptance criteria |
| **[04_SYSTEM_ARCHITECTURE.md](./docs/04_SYSTEM_ARCHITECTURE.md)** | System Architecture | Next.js 16 + FastF1 + Supabase diagrams, coordinate pipelines |
| **[05_DATABASE_DESIGN.md](./docs/05_DATABASE_DESIGN.md)** | Database Design | PostgreSQL schema, ERD diagrams, triggers, and RLS policies |
| **[06_API_SPECIFICATION.md](./docs/06_API_SPECIFICATION.md)** | API Specification | Complete endpoints reference, caching proxies, and status codes |
| **[07_UI_UX_SPECIFICATION.md](./docs/07_UI_UX_SPECIFICATION.md)** | UI/UX Specification | Dark pit-wall design tokens, tire palettes, 60fps canvas rules |
| **[08_SECURITY.md](./docs/08_SECURITY.md)** | Security Architecture | PKCE auth, hardened CSP without unsafe-eval, rate limiting |
| **[09_TESTING_STRATEGY.md](./docs/09_TESTING_STRATEGY.md)** | QA & Benchmarks | Tracked 1,000-op benchmark suite, concurrency stress tests, build audits |
| **[10_DEPLOYMENT.md](./docs/10_DEPLOYMENT.md)** | Deployment & Ops | Environment matrix, Vercel/Docker deployment, and smoke tests |
| **[STRATEGY_LAB_REDESIGN_PLAN.md](./docs/STRATEGY_LAB_REDESIGN_PLAN.md)** | Strategy Lab Plan | Architecture, correctness audits, and Clean Tabbed Cockpit specs |

---

## ⚡ Key Systems & Core Features

### 🗺️ 1. 78 F1 Circuit Satellite Canvas & Corner Reconnaissance (`/gallery`)
- **Two-Tier Track Registry**:
  - **24 Modern Championship Venues**: Fully verified centerline path vectors (`path`), authentic sector split gates (S1/S2/S3), speed trap coordinates, and calibrated apex telemetry specs (entry/apex/exit speeds in km/h, braking G-forces, typical gear selection, DRS zones).
  - **54 Heritage & Historic Venues**: Track layout outlines, official circuit lengths, corner names, and archival records (e.g. Nordschleife, Brands Hatch, Kyalami, Sepang, Indianapolis).
- **Canonical Geographic Orientation Fidelity**: Preserves true broadcast track orientations while supporting calibrated FastF1 rotations and opt-in auto-settle.
- **5-Pass Iterative Collision Relaxation**: Dynamically spaces corner badges in tight chicanes with a 38px clearance threshold, preventing badge overlap and eliminating hover jitter.
- **Intelligent Apex Matcher**: Dynamically maps corner selections to verified high-resolution apex photography and fallback team wallpapers.

### 🤖 2. Post-Qualifying AI Race Prediction Workstation (`/predictor`)
- **Calibrated Grid Model**: Probabilistic win distributions based on Saturday Qualifying starting grid order, constructor performance indices, and circuit DNA.
- **Saturday Qualifying State Gating**: Pre-qualifying sessions display an interactive countdown rather than speculative guesswork.
- **Historical Accuracy Ledger**: Audits all past predictions against official FIA classified finishes with empirical delta tracking.
- **2026 Grid Calibrations**: Fully reflects modern constructor switches (Hamilton at Ferrari, Sainz at Williams, Hulkenberg/Bortoleto at Kick Sauber).

### ⏱️ 3. 60fps Interactive Race Replay Engine (`/replay`)
- **High-Fidelity Track Geometry & Starting Grid**: High-density SVG centerline paths for all 78 venues with official sector color coding (Cyan/Gold/Magenta), upright split gates, and realistic 2x2 starting grid staging along the main straight.
- **GPU-Accelerated Canvas Engine**: 60fps telemetry playback engine displaying car positions, gaps, and telemetry graphs.
- **Playback Controls**: Variable rates (1x, 2x, 5x, 10x), scrubber timeline, frame stepping, and lap-by-lap playback.
- **Telemetry Gauges**: Real-time tachometers, speed monitors, DRS status, ERS charge %, and tire compound degradation indicators.

### ⚔️ 4. Teammate Head-to-Head Battle Portal (`/teammates`)
- **Constructor Rivalries**: H2H comparisons across all 10 F1 constructor teams.
- **Telemetry Delta Graphs**: Cumulative championship points progression curves, qualifying pace deltas, and finishing statistics.

### 🔬 5. Clean Tabbed Strategy Lab & Tactical Cockpit (`/lab`)
The Strategy Lab delivers an uncluttered, high-signal Formula 1 tactical command center:
- **Cockpit Tab Switcher (`LabHeader.tsx`)**: High-contrast horizontal tab bar allowing instant switching across four focused tactical workspaces.
- **Unified Session Command Ribbon (`GrandPrixSummaryBar.tsx`)**: Compact 2-row command bar providing Round selection, circuit venue metadata, a liveried Driver 1 vs Driver 2 comparator, and a 4-cell telemetry strip (**Winner • Race Distance • Pole Position • Fastest Lap**).
- **Four Dedicated Tactical Workspaces**:
  1. **Field Pit Stop Strategy (`PitStopReview.tsx`)**: Field pit stop timeline across laps 1 through $N$ with a normalized lap ruler, stationary durations, in/out-lap loss breakdown, and a toggleable alternate undercut simulator.
  2. **Race Pace & Lap Deltas (`WhereWasTimeLost.tsx`)**: Continuous unshifted lap pace progression (`spanGaps: false`), clean pace averages, consistency scores, and head-to-head delta progression with integrated outlier cutoff controls.
  3. **Tyre Stints & Wear Slopes (`TyreStintStory.tsx`)**: Technical Pirelli compound allocation strip (`⚪ Hard`, `🟡 Medium`, `🔴 Soft`), fuel burnoff compensation ($+0.055\text{s/lap}$), and full-grid stint longevity matrix.
  4. **Circuit Demands & Track DNA (`CircuitStrengths.tsx`)**: Chassis trait decomposition (S1 aero, S2 mechanical, S3 traction) with deep links directly into 2D circuit reconnaissance.

### 🔐 6. Translucent Glassmorphic Pit-Wall Authentication Portal (`AuthGate.tsx`)
- **Frosted Glassmorphism**: Translucent centered card (`backdrop-filter: blur(24px) saturate(140%)`) that preserves the wide-angle Formula 1 car background without vertical screen slicing or visual clutter.
- **Official F1 Broadcasting Typography**: Styled exclusively with `Titillium Web`, `Roboto Condensed`, and `Inter`.
- **Enterprise Security**: Supabase PKCE authentication, Web Crypto HS256 JWT `HttpOnly; Secure; SameSite=Lax` cookies, and Google OAuth 2.0 device account picker.

---

## 📐 System Architecture Summary

```mermaid
graph LR
    Client["🖥️ Client (Next.js 16 App Router)"] --> API["⚡ API Gateway (/api/circuits, /api/auth)"]
    Client --> Lab["🔬 Strategy Lab (/lab: Circuit DNA + Tyre Physics + Pit Duels)"]
    Client --> Predictor["🤖 AI Race Predictor (/predictor: Win Distributions & Ledger)"]
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

## 🧪 Testing & Verification

```bash
# Run unit and integration tests (68 tests across 10 suites)
npm test

# Run TypeScript compilation check
npx tsc --noEmit
```

---

## 🛩️ Deployment

```bash
# Production build check
npm run build
```

Deploy seamlessly to **[Vercel](https://vercel.com)** by connecting your GitHub repository.
