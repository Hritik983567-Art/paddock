# TODO.md — Pending Tasks & Technical Debt

## Completed in Milestone v1.1 (Phases 5 & 6 — 2026-10-21)
- [x] **Race Predictor ML Forecasting Engine (`/predictor`)**:
  - Implemented 16-feature post-qualifying ML model (`app/lib/racePredictorService.ts`) calibrated with 2026 driver/constructor aero indexes.
  - Built Pre-Qualifying Lockout & Countdown Gate (`PredictorStatusStates.tsx`) with zero speculative hallucination before Saturday qualifying concludes.
  - Implemented consensus normalization ensuring all 20 driver win probabilities sum strictly to 100.0%.
  - Built immutable SHA-256 accuracy audit ledger (`PredictionHistoryLedger.tsx` & `raceResultsService.ts`) verified against official Jolpica race results.
  - Created `/api/predictions/race/[raceId]` route handler with rate-limiting, edge caching headers, and automated test coverage.
  - Built responsive multi-column pit-wall workstation (`app/predictor/page.tsx`) with winner projection hero, driver probability rankings, performance factor bars, and race dynamics panels.
- [x] **Platform-Wide Broadcast Jargon Elimination**:
  - Replaced all raw code comments (`//`) and developer bracket tags (`[TEL_01]`, `[MAP_GPS]`, `[WINNER_PROJECTION]`) with polished FIA broadcast terminology across `/predictor`, `/gallery`, `/live`, `/schedule`, `/account`, and legal pages.
- [x] **Authentic F1 Typography Enforcement**:
  - Purged `Times New Roman` serif overrides from `@theme`, `:root`, and utility classes in `app/globals.css`.
  - Re-established `Titillium Web` (display), `Roboto Condensed` (telemetry/numbers), and `Inter` (body/UI) across all pages.
- [x] **Translucent Glassmorphic Pit-Wall Authentication Portal**:
  - Transformed `.centered-login-card` in `AuthGate.tsx` to translucent frosted glass (`rgba(9, 14, 22, 0.65)` with `backdrop-filter: blur(24px)`).
  - Padded `#authGate` container to eliminate vertical edge-to-edge stretching, preventing wallpaper clipping.
  - Excised floating HUD pods and debug chips to maintain clean, unobstructed focus on pit-wall credentials and continuous high-definition F1 car background wallpaper.
- [x] **Race Replay Circuit Forming & Grid Staging Fidelity (`CircuitReplay.tsx` & `circuitTransform.ts`)**:
  - Replaced isolated corner apex fallback with high-density centerline track coordinates from `TRACKS_REGISTRY` via `getTrackDefinition`.
  - Fixed coordinate space inversion (`invertY = isFastF1`) so SVG screen-space registry tracks are never mirrored upside down.
  - Made auto-settle strictly opt-in (`autoSettle: false` default) to preserve authentic canonical F1 broadcast orientation.
  - Isolated track gate rotation from label badges (`FINISH`, `S1 SPLIT`, `S2 SPLIT`) so text remains permanently upright.
  - Calibrated asphalt stroke widths (20px asphalt base, 15px inner tarmac, 5px sector line) eliminating hairpins and chicane blobbing.
  - Staged starting grid cars along the start/finish straight tangent vector in clean 2x2 grid boxes with smooth cubic launch transition.
- [x] **Comprehensive Design System Documentation**:
  - Authored root `DESIGN.md` establishing color tokens, typography rules, glassmorphism specs, and HUD component patterns.
- [x] **10-Suite Automated Test Baseline**:
  - Expanded test coverage to 68 automated tests across 10 suites (`npm test`), maintaining a 100% pass rate.

## Completed in Phase 4 (Strategy Lab & Zero Mock Invariants — 2026-10-13)
- [x] Implemented **Circuit DNA & Sector Domination Matrix** (`CircuitDNASectorMatrix.tsx`): 100% empirical S1 aero, S2 mechanical grip, S3 top speed trap decomposition, Theoretical Ultimate Lap, and team aero dominance radar.
- [x] Implemented **Head-to-Head Tactical Strategy Duel** (`TacticalStrategyDuel.tsx`): Merged authentic race pace delta calculations with 1-stop vs 2-stop undercut simulation, live gap trajectory line chart, and SC/VSC delta injection.
- [x] Implemented **Tyre Degradation & Stint Whisperer Lab** (`TyreDegradationLab.tsx`): Track-specific Pirelli C1–C5 compound allocations, 3-phase non-linear thermal degradation physics engine, dynamic crossover lap detection, fuel-burnoff compensation ($+0.055\text{s/lap}$), and driver Tyre Whisperer Index.
- [x] Documented ADR-004 through ADR-011 covering Strategy Duel, Empirical Telemetry, Pirelli C1–C5 Physics, Developer Jargon Removal, Authentic F1 Typography, and Glassmorphic Auth.
- [x] **Zero Mock Data Platform Purge**: Removed all hardcoded drivers (`INITIAL_DRIVERS`) and synthetic anchor lap generators (`generateAnchorLapTimes`) from `app/live/page.tsx`, initialized driver state to `[]`, replaced mock weather fallbacks, and added dynamic `DriverList` / `TimingData` ingestion with ADR-007.

## Active Backlog (Milestone v1.2 Candidate Features)
- [ ] **Static Telemetry Archive Offloading**: Archive historical circuit telemetry (1950–2015, ~140 MB) to Supabase Storage or Cloudflare R2 on demand to streamline container size.
- [ ] **Circuit Gallery Registry Dynamic Import**: Code-split and lazy-load `circuitGalleryRegistry.json` (7.32 MB) on a per-circuit basis.
- [ ] **Automated Proxy Reconnection Watchdog**: Set up auto-reconnect backoff watchdog for `scripts/f1-proxy.js`.
- [ ] **Historical Circuit Layout Variations**: Add historical track variations in `/gallery` (e.g. Monza with/without chicane, Silverstone 1991 vs 2011).
- [ ] **Wallpaper Asset Optimization**: WebP/AVIF progressive compression pipeline for high-resolution pit-wall wallpapers.
