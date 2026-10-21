<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> ⚠️ **Node.js Runtime Requirement**: Node.js 20 and below are deprecated for `@supabase/supabase-js`. Target **Node.js 22 or later** for all builds and serverless runtimes.


# 🏎️ Paddock Telemetry — Developer & AI Assistant Guide

This document serves as the primary technical cheat sheet for working on **Paddock Telemetry**, an enterprise-grade Formula 1 telemetry, pit-wall reconnaissance, and race replay command center.

---

## 🛠️ Common Commands

```bash
# Start local development server (Turbopack)
npm run dev

# Run TypeScript compilation check (strict zero-error policy)
npx tsc --noEmit

# Production build check
npm run build

# Run Vitest automated test suites (68 tests across 10 suites)
npm test

# Linting
npm run lint
```

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack) & React 19
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS & CSS Variables (`app/globals.css`), Vanilla CSS for micro-interactions
- **Authentication**: Supabase Auth (PKCE flow, Email & Password with confirmation gate, Google OAuth 2.0 PKCE)
- **Session Security**: Server-side Web Crypto HS256 (`app/lib/jwt.ts`) with `HttpOnly; Secure; SameSite=Lax` cookies (`paddock_auth_token`)
- **Telemetry Data Engine**: FastF1 Python timing & coordinate integration, cached community API proxy (`/api/f1/[...path]`)
- **Canvas Engines**: 
  - 60fps GPU-accelerated race replay engine (`CircuitReplay.tsx`)
  - 2D SVG vector circuit geometry & telemetry map (`CircuitMap.tsx` & `circuitTransform.ts`)

---

## 🗺️ Circuit Telemetry & Canvas Geometry Guidelines

### 1. 78-Circuit Coverage & Physics Calibration
- Paddock supports **78 Formula 1 circuits** (25 modern calendar tracks and 53 historic heritage venues) spanning **4,348 corners**.
- Every corner contains verified physics telemetry: entry, apex, and exit speeds (km/h), typical gear, braking intensity / G-force, DRS activation, and overtaking dynamics.
- Track metadata is registered in `TRACKS_REGISTRY` (`app/lib/circuitTransform.ts`) and `public/data/circuits/2024/*.json`.

### 2. Coordinate Transformation & Orientation Rules
- **Canonical Geographic Orientation Fidelity & Opt-In Auto-Settle**: In `computeTransformBounds` (`circuitTransform.ts`), circuits preserve their authentic broadcast track orientation. Auto-settle is strictly opt-in (`autoSettle: false` default) to prevent tracks from being tilted 90° sideways.
- **Coordinate Space Inversion Mapping**: Pass `isFastF1 = activeTelemetry.coordinateSystem === 'fastf1_xy'` to `computeTransformBounds` so SVG screen-space registry tracks operate with `invertY: false` and are never rendered upside down.
- **Replay High-Density Centerline Fallback**: When telemetry is loading or partial, fall back strictly to high-density centerlines from `TRACKS_REGISTRY` via `getTrackDefinition(circuitId).path` (200+ smooth points) rather than connecting isolated corner apex points.
- **Upright Gate Badges**: Split and finish gates rotate cross-track orientation lines while isolating label pills (`FINISH`, `S1 SPLIT`, `S2 SPLIT`) so text never renders upside down on leftward straights.
- **Calibrated Asphalt Stroke Widths**: 20px asphalt base, 15px inner tarmac, and 5px core sector centerline, preserving sharp definition through tight hairpins without blobbing.
- **2x2 Starting Grid Staging**: Grid cars stage along the start/finish straight tangent vector in clean 2x2 boxes with smooth cubic launch transition.
- **5-Pass Iterative Collision Relaxation**: To prevent corner badges from overlapping in tight chicanes (e.g. Monza T1–2, T4–5, T8–9–10), `transformCorners` applies a 5-pass iterative relaxation algorithm with `MIN_LABEL_DISTANCE = 38px`.
- **Stable SVG Coordinate Anchoring**: 
  - Never apply `transformBox: 'fill-box'` or `transformOrigin: 'center'` to `<g>` elements that also use SVG `translate(lx, ly)`. In Chrome, dynamic child stroke changes cause bounding box recalculation that leads to high-frequency hover shaking/jitter.
  - Hover states on SVG corners must use **color-only transitions** (`transition-colors duration-150`), never stroke-width or radius transitions (`transition-all`).
  - Hit targets must be right-sized (e.g., 32×26px for badges, 12px radius for apex anchors) using `fill="#FFFFFF" fillOpacity="0.001"` to ensure painted collision detection without overlapping neighboring chicanes.

### 3. Canvas Drag vs. Click Interactions
- Canvas panning uses a 12px threshold (`Math.hypot(dx, dy) < 12`) to prevent normal clicking micro-movements from initiating map dragging ("running").
- Interactive nodes must have `data-corner="true"`. `handleMouseDown` and `handleTouchStart` check `target.closest('[data-corner="true"]')` to completely isolate corner clicks from canvas dragging.
- Modal backdrops must use an opening time guard (`modalOpenedAtRef`, 250ms threshold) to prevent click bleed-through from immediately closing the modal.

### 4. Strategy Lab & Empirical Telemetry Principles (`/lab`)
- **100% Empirical Telemetry**: Strictly avoid speculative or black-box machine learning models. Sector timing, speed traps, and benchmark classifications must derive from verifiable official FIA telemetry data.
- **Circuit DNA Decomposition**: Decompose sessions into Sector 1 (high-speed aero downforce), Sector 2 (mechanical grip & traction), and Sector 3 (power unit efficiency & DRS top speeds). Calculate Theoretical Ultimate Lap from purple benchmarks.
- **Pirelli C1–C5 Allocations**: Circuit compound selections must adhere to track-specific nominations (`CIRCUIT_PIRELLI_ALLOCATIONS`), mapping C1 (hardest) to C5 (softest).
- **3-Phase Thermal Cliff Model**: Do not use naive linear tire wear. Stint simulation must enforce: Phase 1 (Scrub-in Peak, L1–3), Phase 2 (Management Plateau), and Phase 3 (Exponential Thermal Cliff: $\Delta\text{s} \propto (\text{lapsOverCliff})^{1.55}$).
- **Fuel-Burnoff Compensation**: Decouple car weight loss from tyre wear using $+0.055\text{s/lap}$ delta adjustment.

### 5. Zero Mock Data Policy & Live Ingestion (`/live`)
- **Strictly No Mock Data**: Never seed artificial driver grids (`INITIAL_DRIVERS`), synthetic anchor lap times (`generateAnchorLapTimes`), or hardcoded weather temperatures.
- **Standby Mode**: When off-session, render the official FIA Pit-Wall Telemetry Standby card with real session start countdowns derived from `API_BASE/current.json`.
- **Dynamic Ingestion**: When competitive sessions stream, driver rows, micro-sectors (S1, S2, S3), trap speeds, and tyre stints populate dynamically strictly from incoming SignalR WebSocket frames (`DriverList`, `TimingData`, `TimingAppData`).

### 6. Race Predictor & Post-Qualifying ML Engine (`/predictor`)
- **Strict Gating**: Forecasts are strictly calculated after Saturday Qualifying has concluded. Before qualifying completes, render the countdown lockout state (`QualifyingGridInProgress` / `PreSessionGating`).
- **Feature Pipeline & Calibration**: 16 engineered features combining qualifying delta, rolling form, 2026 constructor aero index, and circuit-specific track DNA. Consensus probabilities are strictly normalized to sum to 100.0%.
- **Immutable Accuracy Audit Ledger**: Persists SHA-256 hashed predictions to Supabase (`race_predictions_audit`) and verifies against official Jolpica race results upon session conclusion.
- **2026 Calibrated Driver Roster**: Accounts for active seat changes (Hamilton at Ferrari, Sainz at Williams, Antonelli at Mercedes, Bortoleto/Hülkenberg at Sauber/Audi).

---

## 🎨 Design System & Pit-Wall Aesthetics

- **Theme**: Dark pit-wall telemetry HUD (`#090D16`, `#0D1117`, `#050814`) with translucent glassmorphic surfaces (`rgba(9, 14, 22, 0.65)` with `backdrop-filter: blur(24px)`).
- **Wallpaper Integrity & Portal Immersion**: Background images remain fully visible in a translucent, non-intrusive manner without being sliced in half by opaque rectangular containers. The authentication card is centered and frosted, completely free of floating HUD pods or clutter, preserving continuous background immersion.
- **Typography Tokens (Strictly No Serif Overrides)**:
  - Display & Headings: `Titillium Web` (`font-display`, uppercase, black/bold font weight).
  - Telemetry & Speed Gauges: `Roboto Condensed` (`font-telemetry`, condensed high-contrast technical numerals).
  - Body & UI: `Inter` (`font-sans`).
  - Tabular & Code: `JetBrains Mono` (`font-mono`, tabular numbers).
  - **Forbidden**: `Times New Roman` or any serif font family must never override UI or typography tokens.
- **Clean Formula 1 Broadcast Copy**:
  - Raw developer comment markers (e.g. `//`) and bracketed debug labels (e.g. `[TEL_01]`, `[MAP_GPS]`, `[WINNER_PROJECTION]`) are strictly forbidden in user-facing UI.
  - Always use polished, authentic FIA broadcast terminology (e.g., `AI Race Prediction Engine`, `Track Map • Topology & Corner Analysis`, `Projected Race Winner`).
- **Tire Compound Palette**: Soft (🔴 `#FF1801`), Medium (🟡 `#FFD800`), Hard (⚪ `#FFFFFF`), Inter (🟢 `#3ECF8E`), Wet (🔵 `#0070F3`).

---

## 📚 Documentation Reference

For in-depth architectural and engineering specifications, refer to:
- `DESIGN.md`: Platform Design System, F1 Typography, Glassmorphism & Color Tokens
- `docs/01_PRD.md`: Product Requirements & Persona Specifications
- `docs/02_SRS.md`: System Requirements & Non-Functional SLAs
- `docs/03_USER_STORIES.md`: User Stories & Gherkin Acceptance Criteria
- `docs/04_SYSTEM_ARCHITECTURE.md`: Architecture Diagrams & Component Pipelines
- `docs/05_DATABASE_DESIGN.md`: PostgreSQL Schema, RLS & Supabase Models
- `docs/06_API_SPECIFICATION.md`: Endpoints Reference & Status Codes
- `docs/07_UI_UX_SPECIFICATION.md`: UI/UX Design System & Canvas Rules
- `docs/08_SECURITY.md`: Auth Architecture, PKCE, CSP & Threat Mitigation
- `docs/09_TESTING_STRATEGY.md`: Test Suites, Benchmarks & Validation (68 tests across 10 suites)
- `docs/10_DEPLOYMENT.md`: Environment Matrix, Vercel & CI/CD Ops
