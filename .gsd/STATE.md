---
updated: 2026-10-21T16:35:00Z
---

# Project State

## Current Position

**Milestone:** v1.1 (Paddock Race Predictor & Telemetry Design Polish)  
**Phase:** 6 — UI/UX Polish, Authentic F1 Typography & Clean Broadcasting Terminology  
**Status:** complete  
**Plan:** Plan 6.1 — Translucent Glassmorphic Pit-Wall, F1 Typography Standardization & Zero Developer Jargon  

---

## Last Session Summary
Platform-wide UI/UX refinement, design system alignment, and telemetry fixes:
- **Removed Floating HUD Pods from Auth Screen**: Excised the floating Speed Trap / DRS pod and Fastest Sector / Green Flag pod from [app/components/AuthGate.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/app/components/AuthGate.tsx) as requested, leaving the clean translucent glassmorphic pit-wall authentication card unobstructed over the background.
- **Race Replay Circuit Forming Overhaul**: Resolved circuit deformation and inverted rendering in [app/components/replay/CircuitReplay.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/app/components/replay/CircuitReplay.tsx) & [app/lib/circuitTransform.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/app/lib/circuitTransform.ts):
  - Fixed fallback geometry: Replaced 10-15 isolated corner apex points with high-density centerline coordinates from `TRACKS_REGISTRY` via `getTrackDefinition`.
  - Fixed coordinate space inversion: Correctly passed `isFastF1 = activeTelemetry.coordinateSystem === 'fastf1_xy'` to `computeTransformBounds` so SVG screen-space registry tracks are never mirrored upside down.
  - Made auto-settle opt-in (`autoSettle: false` by default): Prevented authentic canonical circuit broadcast orientations from being forcibly tilted 90° sideways.
  - Upright text badges: Isolated line rotations from label pills on `FINISH`, `S1 SPLIT`, and `S2 SPLIT`, ensuring text never renders upside down on leftward straights.
  - Optimized stroke width: Refined asphalt and sector path widths (20px/15px/5px) to eliminate blobbing at tight chicanes and hairpins.
  - Starting Grid Formation: Staged cars along the start/finish straight tangent vector in a realistic 2x2 grid instead of wrapping backward across sharp chicanes/corners, with smooth launch interpolation.
- **Codebase Integrity**: 100% test pass rate maintained with **68/68 passed tests** across 10 Vitest suites, with zero TypeScript compilation errors (`npx tsc --noEmit`).

---

## Active Decisions

| ID | Decision | Choice | Made | Affects |
| :--- | :--- | :--- | :--- | :--- |
| **AD-01** | **Simulation Engine Removal** | Eliminated client & proxy simulated race walk; stream strictly authentic SignalR packets | 2026-10-11 | `app/live/page.tsx`, `scripts/f1-proxy.js` |
| **AD-02** | **Competitive Session Filter** | Live telemetry activates strictly during Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix | 2026-10-11 | `app/live/page.tsx` |
| **AD-03** | **Chicane Collision Relaxation** | 5-pass iterative relaxation algorithm (`MIN_LABEL_DISTANCE = 38px`) to resolve tight corner overlapping | 2026-10-10 | `app/lib/circuitTransform.ts` |
| **AD-04** | **Opt-In Auto-Settle Orientation** | Auto-settle made strictly opt-in (`autoSettle: false` default); preserves authentic geographic/broadcast orientation | 2026-10-21 | `app/lib/circuitTransform.ts` |
| **AD-05** | **Node.js Runtime Target** | Mandate Node.js `>= 22.0.0` for all local runtimes and CI/CD environments | 2026-10-09 | `package.json`, CI workflow |
| **AD-06** | **Server-Side Auth Sessions** | Web Crypto HS256 JWT tokens in `HttpOnly; Secure; SameSite=Lax` cookies | 2026-10-08 | `app/lib/jwt.ts`, middleware |
| **AD-07** | **Zero Mock Data Mandate** | Banned synthetic drivers; initialize driver grid cleanly to `[]` awaiting real SignalR frames | 2026-10-13 | `app/live/page.tsx`, `scripts/f1-proxy.js` |
| **AD-08** | **Strict Pre-Qualifying State Gating** | Zero mock predictions; display `Qualifying Not Yet Completed` countdown until Saturday qualifying is finalized | 2026-10-20 | `app/predictor/`, `app/lib/racePredictorService.ts` |
| **AD-09** | **2026 Grid Calibration** | Updated driver-team affiliations (Hamilton at Ferrari, Sainz at Williams, Hulkenberg/Bortoleto at Sauber) | 2026-10-20 | `app/predictor/`, `app/lib/racePredictorService.ts` |
| **AD-10** | **Historical Accuracy Ledger** | Immutable predictions audit matching actual race finishes starting from this race onwards | 2026-10-20 | `app/predictor/`, `app/lib/raceResultsService.ts` |
| **AD-11** | **Edge Bandwidth Compression & Caching** | Enabled `compress: true` and 1-year immutable caching on `/data/*` and `/images/*` in `next.config.ts` | 2026-10-21 | `next.config.ts` |
| **AD-12** | **PostgREST 2026 Table Grants** | Explicit `GRANT` statements added for all public tables to comply with Supabase Oct 30 policy | 2026-10-21 | `supabase/schema.sql`, `supabase/migrations/` |
| **AD-13** | **Zero Developer Jargon Mandate** | Eliminated code-style tags (`[TAG] // ...`) across all user-facing UI labels; adopted authentic F1 broadcast nomenclature | 2026-10-21 | Platform-wide (`/predictor`, `/schedule`, `/account`, `/live`, `CircuitMap.tsx`) |
| **AD-14** | **Authentic F1 Typography Enforcement** | Banned serif font overrides (`Times New Roman`); enforced `Titillium Web` (display), `Roboto Condensed` (numerals), and `Inter` (body) | 2026-10-21 | `app/globals.css`, design system |
| **AD-15** | **Glassmorphic Pit-Wall Authentication** | Replaced opaque vertical slicing card with translucent frosted glass card (`backdrop-filter: blur(24px)`); uncluttered backdrop | 2026-10-21 | `app/components/AuthGate.tsx`, `app/globals.css` |
| **AD-16** | **Race Replay Geometry & Grid Formation Fidelity** | Centerline fallback from `TRACKS_REGISTRY`, `invertY` coordinate check, upright split labels, and 2x2 tangent grid | 2026-10-21 | `app/components/replay/CircuitReplay.tsx`, `circuitTransform.ts` |

---

## Blockers & Concerns

- **Working Tree:** Clean, all 68 Vitest tests passing, dev server active on `http://localhost:3000`.
- **Bandwidth Usage:** Static datasets (`public/data/`, ~151 MB) are served with Brotli/Gzip compression and permanent browser cache headers.

---

*Last updated: 2026-10-21*
