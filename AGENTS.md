<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> ⚠️ **Node.js Runtime Requirement**: Node.js 20 and below are deprecated for `@supabase/supabase-js`. The target Node.js version for Paddock Telemetry is **Node.js 22 or later** (see [Supabase Discussion 45715](https://github.com/orgs/supabase/discussions/45715)).

# 🏎️ Paddock Telemetry — Agent Rules & System Invariants

1. **Zero Hallucination / 100% Empirical Data / Zero Mock Data**:
   - Never generate synthetic race walks, artificial radio chatter, or speculative black-box AI predictions for lap times or pit stops.
   - Strictly prohibit mock data, hardcoded initial driver rosters (`INITIAL_DRIVERS`), or synthetic anchor lap generators (`generateAnchorLapTimes`) across the codebase.
   - Live timing grids initialize strictly as an empty state (`[]`) showing verified FIA timetable countdowns when on standby. Telemetry and driver rows must populate dynamically strictly when official live frames stream in from the proxy.
   - Ground all telemetry analysis in authentic official FIA session timing, real speed traps, and verified Pirelli compound engineering.
2. **Strategy Lab Suite (`/lab`)**:
   - `CircuitDNASectorMatrix.tsx`: Decomposes real timing into S1 (high-speed aero), S2 (mechanical traction), and S3 (power unit speed traps). Theoretical Ultimate Lap is $\min(S_1) + \min(S_2) + \min(S_3)$.
   - `TacticalStrategyDuel.tsx`: Merges real race pace deltas with 1-stop vs 2-stop undercut/overcut calculations and SC/VSC delta injection.
   - `TyreDegradationLab.tsx`: Enforces circuit-specific Pirelli nominations (C1–C5), 3-phase thermal cliff curve ($\Delta\text{s} \propto (\text{lapsOverCliff})^{1.55}$), dynamic crossover lap detection, and $+0.055\text{s/lap}$ fuel burnoff correction.
3. **SVG & Canvas Telemetry**:
   - Preserve canonical geographic and broadcast orientation by default (`autoSettle: false`). Auto-settle is strictly opt-in.
   - Replay tracks fall back strictly to high-density centerlines from `TRACKS_REGISTRY` via `getTrackDefinition(circuitId).path` (200+ smooth points), map coordinate spaces correctly (`invertY = isFastF1`), keep gate labels permanently upright (`FINISH`, `S1 SPLIT`, `S2 SPLIT`), calibrate asphalt strokes (20px/15px/5px), and stage starting grid cars along the straight tangent in clean 2x2 grid boxes.
   - Chicane badges enforce 5-pass collision relaxation (`MIN_LABEL_DISTANCE = 38px`).
   - SVG micro-interactions use color-only CSS transitions; never dynamically recalculate `transform-box` or bounding boxes on hover.
4. **Race Predictor Machine Learning Invariants (`/predictor`)**:
   - Strict post-qualifying gate: Never generate predictions for upcoming rounds until Saturday Qualifying has concluded and official grid coordinates are verified. Render the countdown lock screen instead.
   - Calibrated consensus probabilities: Sum of all 20 driver win probabilities must equal 100.0%.
   - Immutable SHA256 audit ledger: Every evaluated prediction must record an immutable snapshot (persisted to Supabase/disk) and verify against official Jolpica race results when available.
5. **Authentic F1 Broadcast Terminology & Clean Copy**:
   - Never include code comments (e.g. `//`) or bracketed developer tags (e.g. `[TEL_01]`, `[MAP_GPS]`, `[WINNER_PROJECTION]`) in user-facing UI copy or headers.
   - Use official Formula 1 broadcast terminology: "AI Race Prediction Engine", "Projected Race Winner", "Driver Win Probabilities", "Track Map • Topology & Corner Analysis", "FIA Formula 1 World Championship™".
6. **F1 Typography & Translucent Glassmorphism**:
   - Strictly enforce official typography tokens: `Titillium Web` (display headers), `Roboto Condensed` (telemetry/numbers), and `Inter` (body). Never allow serif font overrides (e.g. `Times New Roman`).
   - Authentication cards and modals must use translucent frosted glass (`rgba(9, 14, 22, 0.65)` with `backdrop-filter: blur(24px)`) floating with padding so full-screen car backgrounds remain completely visible without vertical opaque slicing or distracting floating HUD pod clutter.
7. **Strict Type Safety & Tests**:
   - All code must pass `npx tsc --noEmit` with zero errors.
   - All Vitest unit and integration tests (`npm test`, 68 tests across 10 suites) must pass before committing changes.
