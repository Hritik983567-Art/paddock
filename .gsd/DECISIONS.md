# DECISIONS.md — Architecture Decision Records (ADRs)

# ADR-001: Authentic Live Telemetry vs. Simulation Engine
- **Date:** 2026-10-11
- **Status:** Accepted
- **Context:** Previous builds ran artificial background intervals that incremented lap counters, simulated fake tyre degradation, and triggered fabricated overtakes and radio messages. This corrupted timing accuracy and spammed Mission Control.
- **Decision:** Completely eliminate the synthetic simulation engine. Live telemetry streams strictly for the 4 official competitive sessions (Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix) via an authentic SignalR pass-through proxy. When in standby, display a static, venue-anchored benchmark grid with a real-time countdown to the next session.
- **Consequences:** Accurate, dependable timing data; clean Mission Control logs; zero synthetic noise.

---

# ADR-002: 78-Circuit Geometry & 5-Pass Chicane Collision Relaxation
- **Date:** 2026-10-10
- **Status:** Accepted
- **Context:** Tight chicanes (such as Monza Variante del Rettifilo or Variante della Roggia) caused SVG corner badges to overlap, making corner selection difficult.
- **Decision:** Implement a 5-pass iterative collision relaxation algorithm with `MIN_LABEL_DISTANCE = 38px` and auto-settling 90° clockwise orientation for vertically elongated tracks (`rangeY > rangeX * 1.15`).
- **Consequences:** Clean, readable, jitter-free SVG corner interaction across all 78 circuits.

---

# ADR-003: Server-Side Web Crypto HS256 Session Authentication
- **Date:** 2026-10-08
- **Status:** Accepted
- **Context:** Storing authentication tokens in client-accessible `localStorage` exposes user sessions to XSS token theft.
- **Decision:** Issue signed HS256 JWT tokens using the native Web Crypto API and persist them in `HttpOnly; Secure; SameSite=Lax` cookies named `paddock_auth_token`.
- **Consequences:** Secure session management, tamper resistance, and automatic token transmission on server route requests.

---

# ADR-004: Tactical Strategy Duel Merger (Pace Delta + Pit Simulator)
- **Date:** 2026-10-12
- **Status:** Accepted
- **Context:** Previously, Driver Race Pace Delta and Pit Strategy Simulator existed as disconnected cards. Strategy decisions in Formula 1 are inextricably tied to on-track pace deltas.
- **Decision:** Merge both into the Head-to-Head Tactical Strategy Duel (`TacticalStrategyDuel.tsx`), uniting actual lap timing deltas with 1-stop vs 2-stop undercut simulation, live gap evolution curves, and Safety Car / VSC scenario injection.
- **Consequences:** Fluid pit-wall user experience, realistic tactical duel modeling, reduced UI fragmentation.

---

# ADR-005: 100% Empirical Circuit DNA & Sector Domination over Black-Box ML
- **Date:** 2026-10-13
- **Status:** Accepted
- **Context:** Users lacked confidence in synthetic/predictive machine learning projections for upcoming race grids, demanding verifiable, real-world telemetry facts.
- **Decision:** Replace speculative predictive models with the Circuit DNA & Sector Domination Matrix (`CircuitDNASectorMatrix.tsx`), derived 100% from official FIA sector times (S1, S2, S3), top speed traps, and the Theoretical Ultimate Lap benchmark.
- **Consequences:** Complete user trust and credibility; 100% verifiable data points with zero artificial hallucination.

---

# ADR-006: Official Pirelli C1–C5 Allocations & 3-Phase Non-Linear Thermal Cliff Model
- **Date:** 2026-10-13
- **Status:** Accepted
- **Context:** The original Tyre Degradation Lab used simplistic linear slopes with generic Soft/Medium/Hard tags, failing to reflect true Pirelli compound physics or the sudden non-linear "thermal cliff".
- **Decision:** Load official circuit-specific Pirelli nominations (C1 to C5) and implement a 3-phase progression model (Scrub-in Peak ➔ Management Plateau ➔ Exponential Thermal Cliff), paired with real stint extraction (`/pitstops.json`), fuel-burnoff compensation, and the Tyre Whisperer index.
- **Consequences:** Realistic tire engineering simulation matching actual telemetry behavior on race weekends.

---

# ADR-007: Zero Mock Data Mandate Across Entire Telemetry Platform
- **Date:** 2026-10-13
- **Status:** Accepted
- **Context:** Hardcoded initial driver rosters (`INITIAL_DRIVERS`) and synthetic anchor lap generators (`generateAnchorLapTimes`) created the illusion of active sessions on non-session days, conflicting with the platform's commitment to 100% empirical, real-world accuracy.
- **Decision:** Strictly ban all mock, dummy, synthetic, or pre-seeded driver lists and lap times. The live timing console initializes with an empty driver grid (`[]`) displaying an official FIA Pit-Wall Telemetry Standby state with the verified session schedule and real countdown timers. Telemetry and driver rows populate dynamically only when official SignalR/WebSocket frames (`TimingData`, `DriverList`, `TimingAppData`) stream from `ws://127.0.0.1:8080`.
- **Consequences:** Absolute data integrity, zero synthetic noise, and clear distinction between session standby and active competitive telemetry.

---

# ADR-008: AI Post-Qualifying Prediction Engine & Accuracy Ledger
- **Date:** 2026-10-20
- **Status:** Accepted
- **Context:** Fans and race analysts require probabilistic finishing models for upcoming Grands Prix that take into account actual qualifying grid positions, 2026 team switches (e.g. Hamilton at Ferrari, Sainz at Williams), and empirical track DNA.
- **Decision:** Implement a calibrated Machine Learning model (`racePredictorService.ts`) operating strictly after Saturday Qualifying is finalized. Before qualifying concludes, display an explicit countdown state (`Qualifying Not Yet Completed`) rather than speculative mock predictions. Archive all past predictions into an immutable Historical Accuracy Ledger matched against actual FIA classified results.
- **Consequences:** High model credibility, verifiable track record, zero synthetic noise prior to Saturday shootout.

---

# ADR-009: Elimination of Developer Annotations & Adoption of Authentic F1 Broadcast Terminology
- **Date:** 2026-10-21
- **Status:** Accepted
- **Context:** Several components featured developer-style bracketed codes (`[TEL_01]`, `[TEL_03]`, `[MAP_GPS]`, `[ELEV_01]`, `[USR_AUTH]`, `[CAL_STREAM]`) and code-comment slashes (`//`) in visible UI headings, clashing with the high-end broadcast aesthetic of the platform.
- **Decision:** Ban all developer code tags and comment slashes in user-visible typography. Replace them across all routes with clean, authentic Formula 1 broadcast graphics terminology (e.g., `AI Race Prediction Engine`, `Projected Race Winner`, `Driver Win Probabilities`, `Track Map • Topology & Corner Analysis`, `Circuit Elevation & Topography Contour`, `FIA Formula 1 • World Championship Calendar`).
- **Consequences:** Pristine, immersive broadcast aesthetics indistinguishable from official FIA television graphics.

---

# ADR-010: Authentic F1 Typography Enforcement & Removal of Serif Overrides
- **Date:** 2026-10-21
- **Status:** Accepted
- **Context:** Legacy CSS rules contained hardcoded `Times New Roman` serif overrides for `--font-body`, `--font-sans`, and several card titles, creating an incongruous editorial serif look on a high-tech telemetry platform.
- **Decision:** Completely purge `Times New Roman` from the design system. Enforce the official Formula 1 typography trio: `Titillium Web` (for display headings, cards, and branding), `Roboto Condensed` (for high-contrast telemetry numbers and sector times), and `Inter` (for neutral, crisp UI copy).
- **Consequences:** Cohesive visual identity aligned with modern Formula 1 design standards and `docs/07_UI_UX_SPECIFICATION.md`.

---

# ADR-011: Translucent Glassmorphic Pit-Wall Authentication Portal
- **Date:** 2026-10-21
- **Status:** Accepted
- **Context:** The login screen previously displayed an opaque, full-height dark card that vertically sliced the background Formula 1 car in half, while random telemetry chips cluttered the view.
- **Decision:** Redesign `AuthGate.tsx` with a centered translucent frosted glass surface (`rgba(9, 14, 22, 0.65)`, `backdrop-filter: blur(24px) saturate(140%)`, machined subtle border), allowing the continuous F1 car wallpaper to shine through with full immersion. Excised distracting floating telemetry chips and side HUD pods to maintain clean, unobstructed focus on credentials and pit-wall entry.
- **Consequences:** Dramatic, state-of-the-art entry experience with zero background slicing and authentic paddock pass aesthetics.

---

# ADR-012: Race Replay Circuit Geometry, Centerline Fallbacks & Geographic Orientation Fidelity
- **Date:** 2026-10-21
- **Status:** Accepted
- **Context:** In `CircuitReplay.tsx`, circuits were forming with severe visual defects: (1) if telemetry was pending or missing, connecting isolated corner apex dots from `ALL_CIRCUIT_CORNERS` created a jagged, criss-crossed polygon; (2) omitting the `invertY` flag inverted SVG screen-space registry tracks vertically upside down; (3) unconditional `autoSettle` was rotating tall circuits (e.g. Interlagos, Red Bull Ring) 90° sideways; (4) start/finish and split gate text was rotated upside down on leftward straights; and (5) cars on the starting grid wrapped backward through final turn chicanes.
- **Decision:** Overhaul circuit formation across `CircuitReplay.tsx` and `circuitTransform.ts`:
  1. Fall back strictly to high-density centerline paths from `TRACKS_REGISTRY` via `getTrackDefinition`, providing smooth 200+ point polygons from initial mount.
  2. Pass `isFastF1 = activeTelemetry.coordinateSystem === 'fastf1_xy'` to `computeTransformBounds` so screen-space tracks preserve upright orientation.
  3. Make `autoSettle` opt-in (`autoSettle: false` default) to guarantee circuits maintain their authentic F1 broadcast orientation.
  4. Isolate track gate rotation lines from upright label badges on `FINISH`, `S1 SPLIT`, and `S2 SPLIT`.
  5. Refine track stroke widths (20px asphalt / 15px inner / 5px core) to prevent blobbing at tight hairpins.
  6. Stage starting grid cars along the start/finish straight tangent vector in clean 2x2 grid boxes with smooth launch interpolation.
- **Consequences:** Flawless circuit rendering, correct geographic orientation, crisp chicanes, and realistic race start staging across all 78 F1 circuits.



