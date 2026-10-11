---
updated: 2026-10-11T21:06:00Z
---

# Project State

## Current Position

**Milestone:** v1.0 (Paddock Telemetry Command Center)  
**Phase:** 4 — Telemetry Analytics, Driver Compare & Replay Engine  
**Status:** executing  
**Plan:** Plan 4.2 — Driver telemetry trace comparison & `/compare` integration  

---

## Last Action

- Completed onboarding of repository into the GSD framework (`/new-project`).
- Generated baseline GSD specification (`.gsd/SPEC.md`), roadmap (`.gsd/ROADMAP.md`), and system architecture (`.gsd/ARCHITECTURE.md`).
- Successfully stripped artificial race simulation from `app/live/page.tsx` and `scripts/f1-proxy.js`.
- Restricted live telemetry streams to the 4 official competitive sessions: Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix.
- Squashed recent micro-commits into atomic commit `0301590` and pushed cleanly to GitHub `origin/main`.
- Verified TypeScript compilation (`tsc --noEmit`), Vitest suite (9/9 passed), and Next.js 16 production build.

---

## Next Steps

1. **Audit `/compare` & `/teammates` Telemetry Deltas**: Validate driver trace comparisons and head-to-head lap pace graphs against 2026 calendar data.
2. **Refine 60fps Canvas Race Replay**: Test `CircuitReplay.tsx` on historical and simulated multi-car positioning for Singapore Grand Prix.
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

---

## Blockers

*None. Working tree is clean, and both proxy (`ws://localhost:8080`) and Next.js (`http://localhost:3000`) servers are active.*

---

## Concerns

- **F1 Live SignalR Availability**: Between competitive sessions, official SignalR endpoints do not stream `TimingData`. This is mitigated by the venue-anchored pre-session benchmark classification grid and live countdown timer.
- **Large Circuit Vector Registry**: `circuitCornersData.ts` and `tracksRegistry.ts` contain extensive geometric coordinates (~750KB combined). Pre-computed coordinates and lazy route loading maintain fast page response times.

---

## Session Context

- **Proxy Process**: Node.js WebSocket proxy daemon running on `ws://localhost:8080` (`node scripts/f1-proxy.js`).
- **Dev/Prod Server**: Next.js 16 production server active on `http://localhost:3000`.
- **Git Branch**: `main` is clean and up to date with `origin/main` at commit `0301590`.

---

*Last updated: 2026-10-11*
