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

