# TODO.md — Pending Tasks & Technical Debt

## Completed in Current Sprint (Phase 4 — 2026-10-13)
- [x] Implemented **Circuit DNA & Sector Domination Matrix** (`CircuitDNASectorMatrix.tsx`): 100% empirical S1 aero, S2 mechanical grip, S3 top speed trap decomposition, Theoretical Ultimate Lap, and team aero dominance radar.
- [x] Implemented **Head-to-Head Tactical Strategy Duel** (`TacticalStrategyDuel.tsx`): Merged authentic race pace delta calculations with 1-stop vs 2-stop undercut simulation, live gap trajectory line chart, and SC/VSC delta injection.
- [x] Implemented **Tyre Degradation & Stint Whisperer Lab** (`TyreDegradationLab.tsx`): Track-specific Pirelli C1–C5 compound allocations, 3-phase non-linear thermal degradation physics engine, dynamic crossover lap detection, fuel-burnoff compensation ($+0.055\text{s/lap}$), and driver Tyre Whisperer Index.
- [x] Documented ADR-004, ADR-005, and ADR-006 covering Strategy Duel Merger, Empirical Telemetry over ML, and Pirelli C1–C5 3-Phase Cliff Engine.
- [x] **Zero Mock Data Platform Purge**: Removed all hardcoded drivers (`INITIAL_DRIVERS`) and synthetic anchor lap generators (`generateAnchorLapTimes`) from `app/live/page.tsx`, initialized driver state to `[]`, replaced mock weather fallbacks, and added dynamic `DriverList` / `TimingData` ingestion with ADR-007.

## High Priority (Phase 4 Remaining)
- [ ] Audit `/compare` route telemetry speed and throttle traces against actual driver telemetry data.
- [ ] Audit `/teammates` head-to-head lap pace delta graphs for 2026 driver pairings.
- [ ] Refine `CircuitReplay.tsx` 60fps canvas loop on multi-car positions for Singapore Grand Prix.

## Medium Priority (Phase 5)
- [ ] Set up automated reconnection watchdog in `scripts/f1-proxy.js`.
- [ ] Benchmark bundle size and consider code-splitting `circuitCornersData.ts`.
- [ ] Add Playwright browser tests for circuit switching, Strategy Lab tool interaction, and modal inspection.

## Low Priority / Polish
- [ ] Add historical circuit layout variations (e.g. Monza with/without chicane).
- [ ] Optimize wallpaper image compression in `public/images/holograms/`.
