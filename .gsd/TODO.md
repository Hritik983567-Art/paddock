# TODO.md — Pending Tasks & Technical Debt

## High Priority (Phase 4)
- [ ] Audit `/compare` route telemetry speed and throttle traces against actual driver telemetry data.
- [ ] Audit `/teammates` head-to-head lap pace delta graphs for 2026 driver pairings.
- [ ] Refine `CircuitReplay.tsx` 60fps canvas loop on multi-car positions.

## Medium Priority (Phase 5)
- [ ] Set up automated reconnection watchdog in `scripts/f1-proxy.js`.
- [ ] Benchmark bundle size and consider code-splitting `circuitCornersData.ts`.
- [ ] Add Playwright browser tests for circuit switching and modal inspection.

## Low Priority / Polish
- [ ] Add historical circuit layout variations (e.g. Monza with/without chicane).
- [ ] Optimize wallpaper image compression in `public/images/holograms/`.
