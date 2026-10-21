# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> 🏎️ **Project**: Paddock Telemetry Command Center
> 📅 **Target Milestone**: v1.1 (Predictor & Design System)
> 📌 **Last Updated**: 2026-10-21

---

## Vision
Paddock is an enterprise-grade Formula 1 telemetry, pit-wall reconnaissance, race simulation, and winner prediction command center. It delivers real-time live timing towers, micro-sector telemetry analysis, 60fps GPU-accelerated canvas race replay, satellite weather radar, 78-circuit interactive vector track geometries, an empirical Strategy Lab suite, calibrated post-qualifying ML winner forecasting, and a translucent glassmorphic pit-wall portal for professional race analysts and motorsport enthusiasts.

---

## Goals
1. **Live Pit-Wall Telemetry Engine**: Stream official live timing lines, track status flags, micro-sector speeds, tyre stint ages, and genuine FIA Race Control messages strictly during official competitive sessions (Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix) via an official SignalR Core proxy.
2. **78-Circuit Interactive Geometry & Corner Telemetry**: Full interactive vector coverage of 78 Formula 1 circuits (25 modern calendar tracks and 53 historic heritage venues) spanning 4,348 corners with verified speed, gear, G-force, and DRS physics.
3. **GPU-Accelerated 60fps Race Replay & Analytics**: Lap-by-lap dynamic canvas replay (`/replay`), telemetry trace comparison (`/compare`), and teammate delta benchmarks (`/teammates`) powered by Jolpica and FastF1 data feeds.
4. **Secure Pit-Wall Authentication & Constructor Personalization**: Supabase Auth with PKCE, server-side Web Crypto HS256 JWT session tokens in `HttpOnly; Secure; SameSite=Lax` cookies, and dynamic F1 constructor themes with HD team wallpapers.
5. **High-Performance Responsive HUD**: Dark pit-wall telemetry interface built on Next.js 16 App Router, React 19, and Tailwind CSS v4, optimized for desktop command centers, tablets, and mobile devices.
6. **Empirical Strategy Lab Suite & Stint Physics (`/lab`)**: 100% empirical telemetry decomposition across Sector 1 (high-speed aero), Sector 2 (mechanical traction), and Sector 3 (power unit / DRS top speed traps) with Theoretical Ultimate Lap benchmarks; Tactical Strategy Duel merging race pace deltas with 1-stop vs 2-stop undercut simulations; and Pirelli C1–C5 tyre degradation physics with 3-phase thermal cliff modeling and dynamic compound crossover detection.
7. **Machine Learning Race Predictor Engine (`/predictor`)**: 16-feature post-qualifying ML model predicting Grand Prix winners, podium probability distributions, and key performance factors strictly after Saturday Qualifying has finished, backed by an immutable SHA-256 accuracy audit ledger verified against official Jolpica race results.
8. **Translucent Glassmorphic Portal & Broadcast HUD Standards**: Centered frosted-glass authentication cards (`backdrop-filter: blur(24px)`) that float seamlessly over high-resolution F1 car wallpapers without edge-to-edge clipping; adherence to official `Titillium Web`, `Roboto Condensed`, and `Inter` typography; and total elimination of developer comments (`//`) and debug tags (`[TEL_01]`) in favor of authentic Formula 1 broadcast terminology.

---

## Non-Goals (Out of Scope)
- **Synthetic Race Simulation & Mock Data**: Strictly zero mock data, fake driver rosters (`INITIAL_DRIVERS`), artificial overtakes, random pit stops, synthetic lap ticking, or hallucinated team radio messages (strictly authentic live telemetry frames via SignalR or clean FIA Pit-Wall Standby state).
- **Ungrounded / Pre-Qualifying Speculative Hallucinations**: Zero speculative forecasts before official Saturday Qualifying results are verified. If qualifying has not concluded, the system strictly displays the countdown lock state.
- **Raw Developer Jargon in User Interfaces**: No code comments (`//`), debug tags (`[TEL_01]`, `[MAP_GPS]`), or raw bracketed developer identifiers rendered in visible user-facing copy.
- **Client-Side Auth Token Storage**: No storing JWT tokens or Supabase sessions in insecure `localStorage`.
- **Heavy Third-Party Framework Bloat**: No legacy UI libraries or non-standard CSS engines that degrade 60fps canvas render performance.

---

## Target Users
- **Formula 1 Fans & Analysts**: Watching live Grands Prix with second-screen timing towers, gap intervals, winner projections, and official FIA Race Control notices.
- **Sim Racers & Track Enthusiasts**: Studying corner entry/apex/exit speeds, braking points, gear profiles, and overtaking dynamics across modern and historic tracks.
- **Motorsport Engineers & Strategists**: Reviewing teammate performance deltas, sector dominance matrices, undercut/overcut pit scenarios, and Pirelli compound degradation curves.

---

## Technical Constraints
- **Runtime Environment**: Node.js `>= 22.0.0` (mandated by `@supabase/supabase-js` v2 and Next.js 16).
- **Framework**: Next.js 16 (App Router with Webpack/Turbopack build optimization).
- **Type Safety**: TypeScript 5 in strict mode with zero compilation errors (`tsc --noEmit`).
- **Telemetry Ingestion**: SignalR Core WebSocket tunnel with Gzip/Deflate decompression on `ws://localhost:8080`.
- **API Rate Limiting**: Exponential backoff, in-memory sliding window rate-limiting, and client caching for Jolpica/Ergast API endpoints.

---

## Success Criteria
- [x] Zero TypeScript errors across all 35 routes and shared services (`npx tsc --noEmit`).
- [x] All 68 unit, integration, and benchmark tests passing across 10 suites (`npm test`).
- [x] Next.js production build compiling with 100% route generation (`npm run build`).
- [x] SignalR proxy daemon cleanly relaying official F1 timing packets without mock overhead.
- [x] 78 circuits loaded with calibrated physics and stable chicane collision relaxation.
- [x] F1 Strategy Lab deployed with Circuit DNA Sector Matrix, Tactical Strategy Duel, and Pirelli C1–C5 3-phase degradation physics.
- [x] Paddock Race Predictor deployed with post-qualifying gate, 16-feature consensus model, and immutable SHA-256 accuracy ledger.
- [x] Translucent glassmorphic authentication portal deployed with authentic F1 typography and clean, unobstructed background immersion.
- [x] Race Replay circuit geometry, centerline fallbacks, upright gate labels, and 2x2 starting grid staging deployed.

---

*Last updated: 2026-10-21*
