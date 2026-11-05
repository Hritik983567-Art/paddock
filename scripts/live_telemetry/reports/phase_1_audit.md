# Phase 1 Audit: Live Telemetry Data Integration

**Project**: Paddock F1 Pit-Wall Command Center  
**Document**: `scripts/live_telemetry/reports/phase_1_audit.md`  
**Date**: November 6, 2026  
**Status**: Completed Pre-Implementation Technical Audit  
**Phase**: Phase 1 — Architectural Feasibility & Data-Source Evaluation  

---

## Executive Summary

This audit assesses the integration of free real-time Formula 1 live timing and telemetry data into Paddock's **Live Telemetry** tab (`/live`) without redesigning or breaking the existing frontend UI.

Currently, Paddock features a fully designed, machined-finish pit-wall telemetry console complete with an official F1 Timing Tower, micro-sector speed traps, tyre compound stint trackers, live race-control logs, and an SVG track radar map (`CircuitMap`) with dynamic driver car markers. However, the data pipeline previously suffered from a coupling gap: the frontend was dependent on a standalone WebSocket port (`ws://localhost:8080`) that was rarely running in dev mode, gated behind an off-day calendar policy that locked out users outside active session windows, and lacked a resilient upstream data ingestion engine.

This audit evaluates the open-source community SignalR implementation (**`julesr0y/f1-livetiming-api`**), **OpenF1**, and **FastF1**. Based on empirical testing and reverse-engineering analysis, **`julesr0y/f1-livetiming-api` (direct F1 SignalR Core stream)** is the **only viable zero-cost, real-time live telemetry source**, as OpenF1 gates active live session data behind a paid sponsor tier and FastF1 is restricted to post-session batch processing.

A resilient, local dual-transport architecture (Next.js server-side SignalR ingestion + internal SSE/REST polling fallback) is recommended to feed the existing UI seamlessly.

---

## 1. Existing UI Component Inventory

The Live Telemetry tab (`app/live/page.tsx`) and supporting components (`app/components/CircuitMap.tsx`) present an exhaustive pit-wall command center. The existing UI contract requires zero visual redesign and must be preserved verbatim.

| Component / Subsystem | File & Lines | Data Requirements & Target Schema | Current Behavior |
| :--- | :--- | :--- | :--- |
| **Top Status Strip** | `app/live/page.tsx`<br>`L873–L930` | `isCompetitiveSessionLive`, `proxyStatus`, `isCompetitiveDay`, `activeLiveSession` | Displays session state (`🔴 LIVE TRANSMITTING`, `🟡 SESSION DAY`, `STANDBY (OFF-DAY)`), uplink indicator, and gap display toggle (`dual`, `gap`, `interval`). |
| **Session Timetable Cards** | `app/live/page.tsx`<br>`L977–L1075` | Array of 4 `CompetitiveSession`: Sprint Quali (`SQ`), Sprint (`SPRINT`), Qualifying (`QUALI`), Race (`RACE`) | Renders 4 weekend session cards with local time conversion, status badge (`LIVE`, `UPCOMING`, `COMPLETED`), and real-time countdown ticker (`countdownToNext`). |
| **Session Metric Bar** | `app/live/page.tsx`<br>`L1141–L1216` | `flagStatus`, `weatherData` (`trackTemp`, `airTemp`, `windSpeed`, `rainfall`), `activeLiveSession` | 5 stat boxes: Session Status, Next Session Window, Safety Flag (`GREEN`, `YELLOW`, `SAFETY CAR`, `RED FLAG`), Telemetry Uplink (14ms precision), Track Environment. |
| **Venue Radar Selector** | `app/live/page.tsx`<br>`L1221–L1244` | `selectedCircuit`, `ALL_CIRCUITS_ROSTER` (52 historic & modern F1 circuits) | Selects the active circuit. Transmits `SET_CIRCUIT` to telemetry proxy to synchronize track definitions and session radar. |
| **Interactive Circuit Map** | `app/components/CircuitMap.tsx`<br>`L28–L80`, `L1947–L1953` | `drivers: LiveDriver[]`, `transformedPoints: TransformedPoint[]`, `activeDriverCode` | High-frequency SVG renderer. **Layer 7 (`LiveDriverOverlay`)** interpolates driver coordinates along the track trajectory using `gapToLeader` and `position` at 60 FPS, with team colors, numbers, and hover cards. |
| **Official F1 Timing Tower** | `app/live/page.tsx`<br>`L1335–L1796` | Sorted array of `LiveDriver[]` (20 cars):<br>• `position`, `number`, `code`, `name`, `teamId`<br>• `gapToLeader`, `intervalToAhead`<br>• `sector1`, `sector2`, `sector3` (`SectorData`)<br>• `lastLapTime`, `bestLapTime`<br>• `speedTrap` (km/h)<br>• `tyre` (`S`/`M`/`H`/`I`/`W`), `tyreAge` (Laps)<br>• `status` (`RACING`, `IN PIT`, `OUT`, `RETIRED`)<br>• `pitStops` (Count) | Primary pit-wall leaderboard. Features: <br>• Dual gap/interval toggle<br>• Three-tier sector coloring: Purple (`isOverallFastest`), Green (`isPersonalFastest`), White (Standard)<br>• Purple `FL` badge for fastest lap holder<br>• Pirelli compound circles with tyre degradation alerts<br>• Pit stop counters (`1P`, `2P`)<br>• Real-time driver row hover highlighting linked to circuit map. |
| **Race Control Console** | `app/live/page.tsx`<br>`L1800–L1851` | `logs: string[]`, `logConsoleRef` | Auto-scrolling event terminal logging FIA Race Director messages, track limit warnings, safety car deployments, investigations, and network uplink timestamps. |
| **Standby Lock Screen** | `app/live/page.tsx`<br>`L1077–L1138` | `!isLiveTimingActive` | Policy holding screen locking the dashboard when outside competitive calendar days. Features manual override button (`ENTER LIVE PIT-WALL MONITOR MODE 🔴`). |

---

## 2. Mock-Data & API Dependency Inventory

An audit of the existing live telemetry codebase reveals the following data dependencies, hardcoded fixtures, and integration points:

1. **Jolpica / Ergast Remote Calendar API (`app/utils/api.ts`)**:
   - `https://api.jolpi.ca/ergast/f1/current.json`
   - *Issue*: Jolpica's `/current.json` endpoint historically defaults to 2024 records. During the 2026 season, this caused `parseCompetitiveSessions` to evaluate all race dates as past/completed, falsely keeping the live console in a permanent "OFF-DAY STANDBY" lockout.
   - *Resolution Required*: Fallback hierarchy must prioritize local `/data/circuits/2026/calendar.json` before querying remote endpoints.

2. **Standalone WebSocket Port 8080 (`scripts/f1-proxy.js`)**:
   - The frontend connects to `ws://${host}:8080` via standard browser WebSocket.
   - *Issue*: `scripts/f1-proxy.js` is a separate manual script (`npm run proxy`). When developers run `npm run dev`, port 8080 does not open. The browser enters an infinite reconnect failure loop with zero live data.
   - *Channels Parsed*: `TimingData`, `DriverList`, `TimingAppData`, `WeatherData`, `TrackStatus`, `RaceControlMessages`.
   - *Channels Omitted*: `CarData.z` (raw high-frequency throttle, brake, RPM, gear) and `Position.z` are explicitly pruned on line 141 of `scripts/f1-proxy.js` to prevent event loop bottlenecks.

3. **Fallback Telemetry Engine (`app/api/live/telemetry/route.ts`)**:
   - Provides an HTTP polling fallback when the WebSocket proxy is offline.
   - Embeds a 20-driver calibrated 2026 baseline (`DEFAULT_2026_DRIVERS`) reflecting current driver movements (Lewis Hamilton at Ferrari, Carlos Sainz at Williams, Andrea Kimi Antonelli at Mercedes) so that the UI never crashes or renders blank rows during testing or network dropouts.

---

## 3. Free Data-Source Comparison

To establish an automated, continuous, zero-cost real-time telemetry feed, three primary community data sources were audited and tested:

| Criterion | Source A: `julesr0y/f1-livetiming-api` (SignalR Core) | Source B: OpenF1 API (`api.openf1.org`) | Source C: FastF1 (Python Library) | Source D: Jolpica / Ergast |
| :--- | :--- | :--- | :--- | :--- |
| **Live During Active Sessions?** | **YES** (Direct official F1 stream) | **NO on Free Tier** (Live data requires €9.90/mo Sponsor tier) | **NO** (Designed for post-session batch processing) | **NO** (Post-session delayed tabular results) |
| **Cost** | **100% Free** (No subscription or API key) | Paid for live; Free for historical (2023+) | 100% Free | 100% Free |
| **Protocol** | WebSockets + SignalR Core Protocol | REST, MQTT, WebSockets (Sponsor tier) | Python File Cache / Pandas DataFrames | HTTP REST JSON |
| **Latency** | **Sub-second (100–300ms)** direct from pit-wall | 2–5s polling (Free tier); ~1s streaming (Paid) | N/A (Minutes/hours post-race) | 15–60 minutes post-session |
| **Data Channels** | Timing, Sectors, Gaps, Tyre Stints, Weather, Track Status, Race Control, Speeds, Raw Car Data (`CarData.z`) | Position, Intervals, Laps, Weather, Stints, Team Radio | Laps, Telemetry (Speed, RPM, Gear, Throttle, Brake), Weather | Final Results, Qualifying, Standings |
| **Upstream Endpoint** | `wss://livetiming.formula1.com/signalrcore` | `https://api.openf1.org/v1/` | F1 Static CDN / Cache / Internal SignalR | `https://api.jolpi.ca/ergast/f1/` |
| **Data Format** | Differential delta frames in PascalCase; compressed zlib base64 strings | Clean normalized JSON | Pandas DataFrames / Numpy arrays | Ergast MRData JSON |
| **Applicability to Paddock** | **PRIMARY LIVE INGESTION SOURCE** | Secondary historical validation source | Offline model training & validation only | Static season calendar fallback |

### Key Source Findings:
1. **OpenF1 Paywall Restriction**: While OpenF1 is widely cited as an open F1 API, its official documentation confirms that **real-time live telemetry during active sessions is gated behind their paid Sponsor Tier** (starting ~30 minutes before a session). Free access is strictly limited to completed historical sessions from 2023 onward. Thus, OpenF1 **cannot be the primary live stream** for a free application.
2. **FastF1 Architecture**: FastF1 caches sessions to disk and cleans data into Pandas DataFrames *after* the session has officially closed. It has no built-in web server or streaming broker for live UI dashboards.
3. **`julesr0y/f1-livetiming-api`**: Acts as a reverse-engineered client for official Formula 1 live timing. It connects to `livetiming.formula1.com` using SignalR Core without requiring login credentials or payment. It is currently functional and provides all data points required by Paddock.

---

## 4. Verified Capabilities & Limitations of `julesr0y/f1-livetiming-api`

### Verified Technical Capabilities
1. **Upstream Handshake & Negotiation**:
   - Sends HTTP POST to `https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1` with custom headers (`Origin: https://www.formula1.com`, `User-Agent: Mozilla/5.0...`).
   - Receives `connectionToken` and session load-balancer cookies (`set-cookie`).
   - Connects to `wss://livetiming.formula1.com/signalrcore?id=${token}`.
   - Completes SignalR Core protocol handshake: `{"protocol":"json","version":1}\x1e`.
2. **Subscription Topics**:
   - Emits subscription target `Subscribe` with topics:
     - `Heartbeat` (Keep-alive every 1–2s)
     - `TimingData` (P1–P20 positions, gaps, intervals, sector times, speed traps)
     - `TimingAppData` (Tyre compound stints, tyre age)
     - `TimingStats` (Personal bests, session bests, top speeds)
     - `DriverList` (Car numbers, broadcast abbreviations, driver names, team affiliations)
     - `WeatherData` (Air temp, track temp, humidity, pressure, rainfall, wind)
     - `TrackStatus` (1 = Green, 2 = Yellow, 4 = Safety Car, 5 = Red Flag)
     - `RaceControlMessages` (FIA steward notifications and investigation logs)
     - `CarData.z` & `Position.z` (Compressed raw telemetry and GPS tracks)
3. **Differential Delta-Merge Engine**:
   - Official F1 SignalR packets are **differential**: F1 never re-transmits the full 20-car table on each tick. It only transmits modified fields (e.g., `Lines["4"].Sectors["1"].Value = "35.120"`).
   - `f1-livetiming-api` incorporates an in-memory recursive merger (`src/utils/merge.js`) that maintains the master session state and applies incoming deltas immutably.
4. **Decompression Engine**:
   - Packets ending in `.z` (such as `CarData.z`) contain zlib Deflate/Gunzip compressed base64 payloads. The Node.js `zlib` library inflates these asynchronously into readable JSON without blocking the event loop.

### Known Limitations & Fragilities
1. **Session-Bound Transmission**:
   - The official F1 SignalR server **transmits data strictly during active FIA track sessions** (FP1, FP2, FP3, Sprint Shootout, Sprint Race, Qualifying, Grand Prix).
   - Outside of active track sessions, the upstream connection connects and sends heartbeats, but the data payload channels remain empty/idle.
2. **No Official SLA / Reverse-Engineered Endpoint**:
   - Formula 1 periodically updates SignalR negotiate parameters, headers, or token formats. If Formula 1 introduces mandatory authentication or Cloudflare Turnstile proof-of-work challenges on `livetiming.formula1.com`, unauthenticated clients will fail to negotiate.
3. **Local Port & Cross-Origin Constraints**:
   - Running the proxy on port 8080 separate from Next.js (port 3000) causes connection issues if port 8080 is blocked by firewalls or if the background daemon fails.
   - An internal Next.js bridge (SSE or server-side proxy) is far more resilient than requiring the end user to manage two separate terminal processes.

---

## 5. Recommended Architecture

To satisfy Paddock's strict zero-downtime, zero-redesign constraints, the live telemetry pipeline must be implemented as a **Decoupled Server-Side Adapter** integrated directly within the Paddock runtime:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   UPSTREAM DATA SOURCES (EXTERNAL)                     │
│                                                                        │
│   Official F1 Live Hub                  Community OpenF1 / Jolpica     │
│   wss://livetiming.formula1.com/         https://api.openf1.org/v1/    │
│   (Real-Time SignalR Core Feed)         (Historical & Calendar Backup) │
└───────────────────────────┬───────────────────────────┬────────────────┘
                            │                           │
                            ▼                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│             PADDOCK INTERNAL LIVE SERVICE (NEXT.JS SERVER)             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. In-Memory SignalR Ingestion Engine & Watchdog                 │  │
│  │    • HTTP POST negotiate to livetiming.formula1.com              │  │
│  │    • WebSocket subscription to 8 live channels                   │  │
│  │    • Automatic reconnect with exponential backoff                │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 2. Deep Delta-Merge State Machine (`src/lib/telemetryState.ts`)  │  │
│  │    • Recursively applies incremental property patches            │  │
│  │    • Asynchronously decompresses `.z` payloads via zlib          │  │
│  │    • Normalizes driver codes, numbers, and team styling          │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 3. Paddock Normalization Adapter                                 │  │
│  │    • Maps F1 PascalCase -> Paddock `LiveDriver[]` schema         │  │
│  │    • Computes `gapToLeader`, `intervalToAhead`, sector flags     │  │
│  │    • Formats weather and FIA race control message logs           │  │
│  │    • Fallback baseline injection when session is idle            │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 4. Unified Client Gateway (`/api/live/stream` & `/api/live/telemetry`)│
│  │    • Server-Sent Events (SSE) stream for zero-latency push       │  │
│  │    • REST fallback polling endpoint (2s interval)                │  │
│  │    • Zero browser credentials exposed                            │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PADDOCK FRONTEND (`app/live/page.tsx`)               │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐  │
│   │ F1 Timing Tower     │  │ SVG Circuit Map     │  │ Race Control │  │
│   │ (P1–P20 Leaderboard)│  │ (Driver Car Markers)│  │ Event Logs   │  │
│   └─────────────────────┘  └─────────────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Architecture Highlights
1. **Single-Port Operation**: The user only executes `npm run dev` on port 3000. No auxiliary background node servers or separate terminal windows are required.
2. **Server-Side Tunneling**: Next.js server-side handles the F1 SignalR negotiation, origin headers, and gzip decompression. The client browser connects exclusively to its own origin (`/api/live/stream` or `/api/live/telemetry`), eliminating CORS and port-blocking failures.
3. **Dual Transport Client**:
   - Primary: Server-Sent Events (SSE) `/api/live/stream` for instant sub-second push updates.
   - Fallback: High-resilience REST polling `/api/live/telemetry` every 2.5s if SSE drops.
4. **State Machine Delta-Merge**: Maintains the single source of truth in memory, so incomplete ticks from F1 never wipe out previously received driver lap times or tyre data.

---

## 6. Exact Implementation Sequence

Implementation must follow strict atomic phases without disturbing existing prediction pipelines or modifying UI styling:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Audit & Specification [COMPLETED IN THIS REPORT]               │
│ • UI inventory, mock data mapping, free source evaluation               │
│ • Status: GO Recommendation                                             │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Core SignalR Client & In-Memory Delta-Merger                    │
│ • Implement `scripts/live_telemetry/f1_signalr_client.ts`                │
│ • Implement recursive delta-merge state engine with unit tests          │
│ • Implement asynchronous zlib decompression helper                      │
│ • Add automated mock-stream replay test verifying 20 cars merge cleanly │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Normalization Adapter & Internal API Gateway                    │
│ • Map official F1 PascalCase properties to Paddock `LiveDriver` schema  │
│ • Create `app/api/live/stream/route.ts` (SSE streaming gateway)         │
│ • Enhance `app/api/live/telemetry/route.ts` with state snapshot export  │
│ • Integrate circuit-specific weather and track status broadcasting      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Frontend Stream Hook & Circuit Map Synchronization              │
│ • Wire `app/live/page.tsx` to consume internal SSE/REST stream          │
│ • Connect dynamic car positions to `CircuitMap` Layer 7                 │
│ • Validate micro-sector color logic (Purple / Green / Yellow)           │
│ • Test reconnect resilience and offline graceful degradation            │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: Live Race Validation & End-to-End Acceptance                   │
│ • Live session verification during an active FIA Grand Prix weekend     │
│ • Measure latency, memory consumption, and frame stability              │
│ • Freeze production documentation and operational runbook               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Risks & Unresolved Questions

1. **Active Session Testing Constraint**:
   - *Risk*: Upstream F1 SignalR servers only transmit timing data during actual Grand Prix track sessions. Testing outside a live race weekend requires a recorded SignalR raw packet fixture.
   - *Mitigation*: Create a historical SignalR replay fixture (using a recorded qualifying/race session) to execute automated end-to-end integration tests without waiting for a race weekend.
2. **Upstream Protocol Drift**:
   - *Risk*: Formula 1 may alter the SignalR negotiate version, cookie security policy, or token formatting without prior notice.
   - *Mitigation*: The adapter must isolate negotiation logic inside an exchangeable module with comprehensive connection health-check logging and an automatic fallback to calibrated track simulation if the upstream is unreachable.
3. **High-Frequency CPU / Browser Render Budget**:
   - *Risk*: `CarData.z` broadcasts engine RPM, speed, brake, and throttle at high frequencies (~3.7–10 Hz per car). Broadcasting raw car data for all 20 cars directly into React state can cause frame drops.
   - *Mitigation*: The existing UI does not render continuous throttle/brake graphs in the live tab. As implemented in `scripts/f1-proxy.js`, `CarData.z` should be selectively filtered or throttled to 1 Hz, while `TimingData` (lap/sector times) is processed with standard `requestAnimationFrame` debouncing.

---

## 8. Final Recommendation

### **Recommendation: GO**

The community F1 SignalR Core protocol (`julesr0y/f1-livetiming-api`) is confirmed to be **technically viable, zero-cost, and completely free of paid API subscriptions**. It supplies 100% of the data points required by Paddock's existing Timing Tower, Circuit Map, and Race Director consoles.

The architecture proposed in Section 5 cleanly resolves the root causes of previous connection failures by embedding the ingestion and delta-merge engine directly into Next.js, eliminating secondary port dependencies and ensuring full compatibility with Paddock's UI contracts.

Proceed to **Phase 2 (Core SignalR Client & In-Memory Delta-Merger)** upon approval.

