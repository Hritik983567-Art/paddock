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
