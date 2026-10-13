---
updated: 2026-10-13T09:30:00Z
---

# Project State

## Current Position

**Milestone:** v1.0 (Paddock Telemetry Command Center)  
**Phase:** 4 — Strategy Lab, Telemetry Analytics & Replay Suite  
**Status:** executing  
**Plan:** Plan 4.2 — Strategy Lab Suite & Zero Mock Telemetry Mandate  

---

## Last Action

- **Zero Mock Data Platform Purge**:
  - Completely removed `INITIAL_DRIVERS` (22 hardcoded drivers) and `generateAnchorLapTimes` (sinusoidal synthetic lap time generator) from `app/live/page.tsx`.
  - Initialized live driver state cleanly to empty arrays (`[]`).
  - Added an authentic **FIA Pit-Wall Telemetry Standby** card in the timing table displaying real-time T-minus countdowns and verified competitive session timetables from `API_BASE/current.json`.
  - Replaced hardcoded fallback weather temperature (`32.4°C / 28.1°C`) with `— / —` and `Awaiting session weather telemetry`.
  - Added dynamic ingestion for `DriverList`, `TimingData`, and `TimingAppData` in `app/live/page.tsx` and subscribed to `DriverList` in `scripts/f1-proxy.js`.
- **F1 Strategy Lab Suite (`app/lab/`)**:
  - **Circuit DNA & Sector Domination Matrix (`CircuitDNASectorMatrix.tsx`)**: 100% empirical session timing and speed trap telemetry (S1 aero, S2 mechanical grip, S3 top speed), Theoretical Ultimate Lap benchmark, and constructor aero balance mapping.
  - **Head-to-Head Tactical Strategy Duel (`TacticalStrategyDuel.tsx`)**: Real race pace deltas merged with 1-stop vs 2-stop undercut simulations, gap evolution line charts, and SC / VSC scenario injection.
  - **Tyre Degradation & Stint Whisperer Lab (`TyreDegradationLab.tsx`)**: Ingested official race stints (`/pitstops.json`), applied fuel-burnoff compensation ($+0.055\text{s/lap}$), scored drivers on the Tyre Whisperer Index (0–100), loaded official circuit-specific Pirelli C1–C5 compound nominations, implemented 3-phase non-linear thermal cliff model, and automated compound crossover lap detection.
- Verified TypeScript compilation (`npx tsc --noEmit`) with 0 errors, ESLint with 0 errors, and Vitest with 9/9 passing tests.

---

## Next Steps

1. **Audit `/compare` & `/teammates` Telemetry Deltas**: Validate driver trace comparisons and head-to-head lap pace graphs against 2026 calendar data.
2. **Refine 60fps Canvas Race Replay**: Test `CircuitReplay.tsx` on historical and multi-car positioning for Singapore Grand Prix.
3. **Automated Health Check for Proxy**: Add an automatic watchdog timer in `scripts/f1-proxy.js` to handle reconnection drops when SignalR server closes.

---

## Active Decisions

| ID | Decision | Choice | Made | Affects |
| :--- | :--- | :--- | :--- | :--- |
| **AD-01** | **Simulation Engine Removal** | Eliminated client & proxy simulated race walk; stream strictly authentic SignalR packets or static venue benchmarks | 2026-10-11 | `app/live/page.tsx`, `scripts/f1-proxy.js` |
| **AD-02** | **Competitive Session Filter** | Live telemetry activates strictly during Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix | 2026-10-11 | `app/live/page.tsx` |
| **AD-03** | **Chicane Collision Relaxation** | 5-pass iterative relaxation algorithm (`MIN_LABEL_DISTANCE = 38px`) to resolve tight corner overlapping | 2026-10-10 | `app/lib/circuitTransform.ts` |
| **AD-04** | **Auto-Settle Aspect Ratio** | Circuits with `rangeY > rangeX * 1.15` automatically tilt 90° clockwise for widescreen settling | 2026-10-10 | `app/lib/circuitTransform.ts` |
| **AD-05** | **Node.js Runtime Target** | Mandate Node.js `>= 22.0.0` for all local runtimes and CI/CD environments | 2026-10-09 | `package.json`, CI workflow |
| **AD-06** | **Server-Side Auth Sessions** | Web Crypto HS256 JWT tokens in `HttpOnly; Secure; SameSite=Lax` cookies | 2026-10-08 | `app/lib/jwt.ts`, middleware |
| **AD-07** | **Tactical Strategy Duel Merger** | Unified real race pace delta and pit strategy simulation into single H2H battle engine | 2026-10-12 | `app/lab/components/TacticalStrategyDuel.tsx` |
| **AD-08** | **100% Empirical Circuit DNA** | Replaced black-box predictive ML models with verifiable official FIA sector benchmarks & speed traps | 2026-10-13 | `app/lab/components/CircuitDNASectorMatrix.tsx` |
| **AD-09** | **Pirelli C1–C5 3-Phase Cliff Engine** | Implemented track-specific Pirelli compound nominations and 3-phase thermal cliff physics | 2026-10-13 | `app/lab/components/TyreDegradationLab.tsx` |
| **AD-10** | **Zero Mock Data Mandate** | Completely banned synthetic drivers and fake lap time generators; initialize driver grid cleanly to `[]` awaiting real SignalR frames | 2026-10-13 | `app/live/page.tsx`, `scripts/f1-proxy.js` |

---

## Blockers

*None. Working tree is clean, and both proxy (`ws://localhost:8080`) and Next.js (`http://localhost:3000`) servers are active.*

---

## Concerns

- **F1 Live SignalR Availability**: Between competitive sessions, official SignalR endpoints do not stream `TimingData`. Mitigated by the official FIA Pit-Wall Telemetry Standby state and real-time countdown timer to the next scheduled competitive session.
- **Large Circuit Vector Registry**: `circuitCornersData.ts` and `tracksRegistry.ts` contain extensive geometric coordinates (~750KB combined). Pre-computed coordinates and lazy route loading maintain fast page response times.

---

## Session Context

- **Proxy Process**: Node.js WebSocket proxy daemon running on `ws://localhost:8080` (`node scripts/f1-proxy.js`).
- **Dev/Prod Server**: Next.js 16 production server active on `http://localhost:3000`.
- **Git Branch**: `main` active.

---

*Last updated: 2026-10-13*ed: 2026-10-13*
