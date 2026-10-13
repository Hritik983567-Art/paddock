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
   - Upright tracks automatically auto-settle with 90° clockwise tilt.
   - Chicane badges enforce 5-pass collision relaxation (`MIN_LABEL_DISTANCE = 38px`).
   - SVG micro-interactions use color-only CSS transitions; never dynamically recalculate `transform-box` or bounding boxes on hover.
4. **Strict Type Safety & Tests**:
   - All code must pass `npx tsc --noEmit` with zero errors.
   - All Vitest unit tests (`npm test`) must pass before committing changes.
