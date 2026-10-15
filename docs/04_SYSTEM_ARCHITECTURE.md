# 🏎️ Paddock Telemetry — System Architecture & Component Design



| Metadata | Details |

| :--- | :--- |

| **Document ID** | `PADDOCK-ARCH-004` |

| **System** | Paddock Telemetry Full-Stack Platform |

| **Version** | `1.0.0` (Production Baseline) |

| **Frameworks** | Next.js 16 (App Router), React 19, TypeScript 5, Supabase |

| **Status** | Approved / Active |



---



## 1. Architectural Philosophy



Paddock Telemetry is architected around three foundational engineering tenets:

1. **Zero-Overhead Client Execution**: Computation-heavy coordinate transformations, rate-limiting, and JWT verification are kept either strictly server-side or hardware-accelerated via HTML5 Canvas GPU pipelines.

2. **Defensive Layering**: No client script has direct access to authentication secrets, sensitive cookies, or un-gated upstream API calls.

3. **Telemetry Determinism**: 60fps canvas replays utilize synchronized timestamp-interpolated coordinate streams rather than erratic real-time polling ticks.



---



## 2. Global System Architecture Diagram



```mermaid

graph TD

    subgraph ClientLayer ["Client Layer (Modern Browser / WebKit & Chromium)"]

        UI["Pit-Wall UI & AuthGate (AuthGate.tsx / LayoutWrapper.tsx)"]

        CTX["Global State Contexts (AuthContext.tsx / SeasonContext.tsx)"]

        CANVAS["60fps Canvas Telemetry Engine (CircuitReplay.tsx / CircuitMap.tsx)"]

        API_HELPER["Client API Transport (app/utils/api.ts)"]

    end



    subgraph SecurityLayer ["Defensive Middleware & Transport Layer"]

        CSP["Content Security Policy (next.config.ts)"]

        COOKIE["HttpOnly, Secure, SameSite=Lax (paddock_auth_token)"]

        EMAIL_GATE["Mandatory Email Verification Gate (AuthGate.tsx)"]

    end



    subgraph ServerLayer ["Next.js 16 Server Engine Layer (Node API Route Handlers)"]

        VERIFY["/api/auth/verify (Session Validation)"]

        AUTH_ROUTES["/api/auth/login & /api/auth/register (Rate-Limited)"]

        CALLBACK["/auth/callback (PKCE Code Exchange)"]

        GOOGLE_API["/api/auth/google (OAuth Identity Verifier)"]

        CIRCUIT_API["/api/circuits & /api/circuits/[year] (Vector Geometry Provider)"]

        PROXY["/api/f1/[...path] (5-Min In-Memory Caching Proxy)"]

    end



    subgraph SecurityLib ["Server-Only Security Modules ('server-only')"]

        JWT_ENGINE["Web Crypto HS256 Engine (app/lib/jwt.ts)"]

        RATE_LIMIT["Sliding Window In-Memory Rate Limiter (app/lib/rateLimit.ts)"]

        GOOGLE_VERIFIER["Google OAuth Claims Verifier (app/lib/googleOAuth.ts)"]

    end



    subgraph DataPersistence ["Persistence & Upstream Telemetry Sources"]

        SUPABASE_DB["Supabase PostgreSQL (Profiles, Presets, RLS)"]

        FASTF1_ENGINE["FastF1 Python Engine / Official Telemetry"]

        JOLPICA_API["Jolpica / Ergast Open F1 API"]

    end



    UI --> CTX

    CTX -->|Session Check| VERIFY

    UI -->|Credentials Submission| AUTH_ROUTES

    UI -->|Google SSO Redirect| CALLBACK

    CANVAS -->|Fetch Circuit Geometry| CIRCUIT_API

    API_HELPER -->|Cached Telemetry Queries| PROXY



    CSP --> AUTH_ROUTES

    AUTH_ROUTES --> RATE_LIMIT

    AUTH_ROUTES --> JWT_ENGINE

    AUTH_ROUTES -->|Password Check| SUPABASE_DB

    AUTH_ROUTES -->|Set HttpOnly Cookie| COOKIE



    CALLBACK -->|Exchange PKCE Code| SUPABASE_DB

    CALLBACK -->|Issue Token| COOKIE



    GOOGLE_API --> GOOGLE_VERIFIER

    GOOGLE_API --> JWT_ENGINE



    VERIFY --> JWT_ENGINE

    PROXY -->|5-Min Cache Store| JOLPICA_API

    CIRCUIT_API --> FASTF1_ENGINE

```



---



## 3. Subsystem Architectural Breakdowns



### 3.1 Authentication & Session Subsystem



```mermaid

sequenceDiagram

    autonumber

    actor User as Engineer / Fan

    participant Client as Browser (AuthGate.tsx)

    participant Server as Next.js Route (/api/auth/login)

    participant RateLimiter as app/lib/rateLimit.ts

    participant Supabase as Supabase Auth Engine

    participant Crypto as app/lib/jwt.ts



    User->>Client: Enters Email & Password

    Client->>Server: POST /api/auth/login { email, password }

    Server->>RateLimiter: Check IP Sliding Window (<10 req/min)

    RateLimiter-->>Server: Rate Limit OK

    Server->>Supabase: signInWithPassword(email, password)

    alt Invalid Credentials

        Supabase-->>Server: Error: Invalid login credentials

        Server-->>Client: HTTP 401 Unauthorized

    else Valid Credentials (Email Confirmed)

        Supabase-->>Server: Return User & Session

        Server->>Crypto: signJwt({ sub: user.id, email: user.email })

        Crypto-->>Server: Signed HS256 Token

        Server-->>Client: HTTP 200 OK + Set-Cookie: paddock_auth_token (HttpOnly)

        Client->>Client: Transition AuthGate -> Pit-Wall Command Center

    end

```



### 3.2 60fps Vector Replay Engine (`CircuitReplay.tsx`)



The replay engine is designed to eliminate frame jitter and garbage collection pauses:

1. **Mathematical Coordinate Transform (`circuitTransform.ts`)**:

   - Circuits are stored as normalized GPS coordinates $(X, Y)$.

   - The engine computes bounding boxes, applies an aspect-ratio-preserving projection, and scales coordinates to fit the canvas viewport dimensions:

   $$\text{ScreenX} = (X - X_{\min}) \times \text{Scale} + \text{OffsetX}$$

   $$\text{ScreenY} = (Y - Y_{\min}) \times \text{Scale} + \text{OffsetY}$$

2. **Double-Buffering & Frame Stepping**:

   - `requestAnimationFrame` maintains a timestamp accumulator.

   - For any playback multiplier ($1\times, 2\times, 5\times, 10\times$), the engine performs linear interpolation between telemetry keyframes to position car marker dots smoothly without stutter.

3. **Hardware Acceleration**:

   - The canvas element utilizes `will-change: transform` and 2D canvas context optimizations (`imageSmoothingEnabled = true`).



### 3.3 2D Circuit Telemetry Map Pipeline (`CircuitMap.tsx` & `circuitTransform.ts`)



The circuit map vector pipeline handles high-precision rendering of 78 world championship layouts:

1. **Auto-Settle Aspect Ratio Projection**:

   - Upright vertical layouts (`rangeY > rangeX * 1.15`, e.g., Indianapolis, Monza) are automatically tilted 90° clockwise in `computeTransformBounds()` so tracks settle horizontally and fill standard widescreen viewports with zero clipping.

2. **5-Pass Iterative Collision Relaxation**:

   - In tight chicanes where multiple corners occur within short distances (e.g. Monza T1–2, T4–5, T8–9–10), `transformCorners()` executes a 5-pass iterative relaxation loop enforcing a minimum separation of `MIN_LABEL_DISTANCE = 38px`. Symmetrical displacement ensures leader lines and badges remain clean, balanced, and visually separated.

3. **Jitter-Free SVG Hit Testing & Coordinate Anchoring**:

   - Badges use direct SVG translation `translate(lx, ly)` with `pointerEvents: 'all'`. Dynamic bounding-box recalculation (`transformBox: fill-box`) is intentionally excluded to prevent browser origin shifting on hover.

   - Hover micro-interactions use **color-only CSS transitions** (`transition-colors duration-150`). Geometry properties (`strokeWidth`, `r`) remain fixed during hover, eliminating high-frequency hover oscillation loops.

   - Hit targets use non-overlapping painted targets (`fill="#FFFFFF" fillOpacity="0.001"`) sized at 32×26px for badges and 12px radius for apex anchors.

4. **Gesture Disambiguation & Click Bleed-Through Guards**:

   - Canvas panning enforces a 12px movement threshold (`Math.hypot(dx, dy) < 12`), isolating normal mouse clicks and finger taps from accidental canvas dragging.

   - All interactive nodes feature `data-corner="true"`, allowing canvas drag handlers to immediately yield.

   - Modal backdrop dismissals implement an opening time guard (`modalOpenedAtRef`, 250ms threshold) to prevent the trigger click from bleeding through and immediately closing the modal.



### 3.4 F1 Strategy Lab & Clean Tabbed Cockpit Subsystem (/lab & app/lab/components/)



The Strategy Lab provides an investigative race insights workspace built upon transparent empirical timing telemetry, reproducible data transformations, and explicit provenance labeling:

```mermaid
flowchart TD
    subgraph DataSources["FIA Timing and Historical Data Sources"]
        CALENDAR["/api/f1/calendar<br/>(Season Schedule)"]
        RESULTS["/api/f1/results<br/>(Official Classification)"]
        LAPS["/api/f1/laps<br/>(Transponder Lap Times)"]
        PITSTOPS["/api/f1/pitstops<br/>(Stationary Durations)"]
        CIRCUIT_DB["TRACKS_REGISTRY<br/>(Vector Geometry and Demands)"]
    end

    subgraph Normalization["lapProcessing.ts — Telemetry Normalization"]
        ALIGN["buildContinuousLapRecords()<br/>(Unshifted 1..N Lap Index Grid)"]
        METRICS["derivePaceMetrics()<br/>(Clean Mean, Outlier Filter, σ)"]
        PROVENANCE["Data Provenance Classifier<br/>(RECORDED / DERIVED / ESTIMATE)"]
        DEGRADATION["Fuel-Compensated Regression<br/>(Tyre Wear Δs/lap - 0.055s Fuel Loss)"]
    end

    subgraph State["app/lab/page.tsx — Central State and Cockpit HUD"]
        SHARED_STATE["Shared Comparative State<br/>• Season and Round<br/>• Driver 1 vs Driver 2"]
        HEADER["LabHeader.tsx<br/>(Top-Anchored Cockpit Tabs)"]
        RIBBON["GrandPrixSummaryBar.tsx<br/>(2-Row Command Ribbon and 4 Telemetry Cells)"]
    end

    subgraph Views["Focused Workspace Modules"]
        VIEW1["PitStopReview.tsx<br/>• Hero Chronology Timeline<br/>• Pit Box Leaderboard<br/>• Tactical Undercut Simulator"]
        VIEW2["WhereWasTimeLost.tsx<br/>• Unshifted Pace and Delta Traces<br/>• Clean Focus Toolbar<br/>• Head-to-Head Telemetry Cards"]
        VIEW3["TyreStintStory.tsx<br/>• 3-Pill Pirelli Strip (Hard/Med/Soft)<br/>• Fuel-Corrected Wear Slopes<br/>• Grid Stint Matrix"]
        VIEW4["CircuitStrengths.tsx<br/>• Aero / Mechanical DNA<br/>• Deep-link to 2D Reconnaissance"]
    end

    CALENDAR --> SHARED_STATE
    RESULTS --> SHARED_STATE
    LAPS --> ALIGN
    ALIGN --> METRICS
    METRICS --> PROVENANCE
    PITSTOPS --> ALIGN
    CIRCUIT_DB --> VIEW4

    SHARED_STATE --> HEADER
    SHARED_STATE --> RIBBON
    SHARED_STATE --> PROVENANCE

    PROVENANCE --> VIEW1
    PROVENANCE --> VIEW2
    DEGRADATION --> VIEW3
    SHARED_STATE --> VIEW4

    classDef header fill:#0e1e2d,stroke:#00f2fe,stroke-width:2px,color:#fff;
    classDef module fill:#18181b,stroke:#27272a,stroke-width:1px,color:#e4e4e7;
    classDef proc fill:#1e1e38,stroke:#818cf8,stroke-width:1px,color:#e0e7ff;
    class HEADER,RIBBON,SHARED_STATE header;
    class VIEW1,VIEW2,VIEW3,VIEW4 module;
    class ALIGN,METRICS,PROVENANCE,DEGRADATION proc;
```




1. **Top-Down Cockpit Hierarchy (app/lab/page.tsx)**:

   - **Header & Navigation Tabs (LabHeader.tsx)**: Prominently anchored at the top, presenting 4 sleek tabs (Pit Stop Review, Race Pace & Gaps, Tyre Stints, Circuit Demands) with active glow indicators.

   - **Unified Session Command Ribbon (GrandPrixSummaryBar.tsx)**: Directly follows the tabs, combining Round selection, circuit venue details, Driver 1 vs Driver 2 comparator pills with team livery colors, and a compact 4-metric telemetry strip (Winner, Race Distance, Pole Position, Fastest Lap).

   - **Centralized Comparative State**: Driver 1 and Driver 2 selections in the session bar serve as the single source of truth across all analytical workspaces, eliminating confusing duplicate dropdowns in child components.



2. **Telemetry Data Processing Pipeline (app/lab/utils/lapProcessing.ts)**:

   - **Provenance-Aware Types**: Every metric explicitly denotes its origin: RECORDED_TIMING (authentic FIA timing sheets), DERIVED_METRIC (mathematically aggregated statistics), or SIMULATION_ESTIMATE (physics models).

   - **Lap Index Boundary Defense**: buildContinuousLapRecords() guarantees unshifted alignment between 1-based FIA lap numbers and array indices ($1 \dots N$). Incomplete, pitted, or outlier laps are rendered with spanGaps: false, preventing artificial lap shifts.

   - **Empirical Sector Handling**: Sector splits and pace deltas derive strictly from recorded transponder timestamps without synthetic interpolation.



3. **Field Pit Stop Strategy & Timing (PitStopReview.tsx)**:

   - **Chronological Timeline**: Hero visualization displaying field pit stops across laps 1 through $N$ with an explicit lap-number ruler and team filter.

   - **In-Lap & Out-Lap Pace Breakdown**: Measures empirical time loss entering the pit lane ($\Delta t_{\text{in}}$) and exiting on cold tyres ($\Delta t_{\text{out}}$) relative to clean median pace.

   - **Fastest Pit Crew Leaderboard**: Official stationary box durations ranked across the field.

   - **Tactical Undercut Simulator (TacticalStrategyDuel.tsx)**: Tucked behind a clean toggle button, providing a dedicated mathematical simulation engine for undercut/overcut tactical duels.



4. **Discrete Race Pace & Head-to-Head Gaps (WhereWasTimeLost.tsx)**:

   - **Integrated Telemetry Toolbar**: Clean Pace Focus toggle, smooth vs linear trace toggles, benchmark visibility, and dynamic outlier cutoff threshold (effectiveThreshold).

   - **Head-to-Head Telemetry Cards**: Compact tiles computing Best Lap, Clean Average Pace, Consistency Score (%), and Standard Deviation ($\sigma$) for Driver 1 and Driver 2.

   - **Continuous Lap-by-Lap Progression**: Interactive Chart.js canvas graphing unshifted lap times and head-to-head delta progression ($\Delta t_i = t_{A, i} - t_{B, i}$).



5. **Tyre Stint Degradation & Pirelli Allocation (TyreStintStory.tsx)**:

   - **Pirelli Technical Allocation Strip**: Compact 3-pill technical strip displaying Hard, Medium, and Soft nominations and circuit asphalt severity.

   - **Fuel-Compensated Degradation Slopes**: Mathematical linear regression modeling tyre wear per lap ($\Delta\text{s/lap}$) adjusted for vehicle fuel burnoff ($+0.055\text{s/lap}$ baseline).

   - **Grid Stint Matrix**: Full-field stint lengths and pit stop lap chronology sorted by finishing position or laps completed.



6. **Circuit Characteristics & Track DNA (CircuitStrengths.tsx)**:

   - **Chassis Trait Decomposition**: Sector 1 high-speed aero downforce, Sector 2 mechanical compliance, and Sector 3 traction/straight-line efficiency.

   - **Direct Reconnaissance Deep Links**: Deep-links directly to 2D vector circuit reconnaissance (/gallery?circuit=).



---



### 3.5 Official Live Telemetry & SignalR Ingestion Subsystem (`/live` & `scripts/f1-proxy.js`)



The Live Telemetry console adheres strictly to an authentic, zero-mock-data pit-wall pipeline:

1. **Zero Mock Data Architecture**:

   - Strictly prohibits hardcoded initial driver rosters (`INITIAL_DRIVERS`) or artificial noise generators (`generateAnchorLapTimes`).

   - The driver grid initializes cleanly as an empty array (`[]`).

2. **Official FIA Pit-Wall Standby State**:

   - When no session is active on track, the classification table renders an authentic FIA Standby card displaying verified session timetables and T-minus countdowns from `API_BASE/current.json`.

   - Weather displays `— / —` until real environmental sensors transmit.

3. **Dynamic Multi-Channel SignalR Ingestion**:

   - Subscribes to official F1 timing channels: `Heartbeat`, `TimingData`, `TimingStats`, `TimingAppData`, `DriverList`, `WeatherData`, `TrackStatus`, `SessionInfo`, and `RaceControlMessages`.

   - `DriverList` dynamically registers drivers with car numbers, broadcast codes, and constructor IDs.

   - `TimingData` dynamically creates and updates positions, lap times, trap speeds, and micro-sector splits (S1/S2/S3).

   - `TimingAppData` updates tyre stints and compound age.



---



## 4. Codebase Composition & Volume Metrics



The Paddock platform comprises modular TypeScript, React, and server-side components:



| Component Category | File Count | Line Count | Codebase Share |

| :--- | :--- | :--- | :--- |

| 🎨 **Frontend UI & Visual Telemetry** | 41 Files | ~14,100 Lines | **65.6%** |

| ⚙️ **Backend API Routes & Cryptography** | 12 Files | ~4,820 Lines | **22.4%** |

| 🗄️ **Database Schemas & Data Configs** | 6 Files | ~2,580 Lines | **12.0%** |

| 🏁 **Total Active Volume** | **59 Files** | **~21,500 Lines** | **100.0%** |



```text

Component Distribution:

[████████████████████████████████████████████████████████████] 65.6% Frontend UI

[██████████████████████] 22.4% Backend APIs & Security

[████████████] 12.0% Database & Config

```



---



## 5. Security & Isolation Boundaries



1. **`import 'server-only'` Barrier**:

   - The Web Crypto HS256 engine in [`app/lib/jwt.ts`](../app/lib/jwt.ts) explicitly declares `import 'server-only'`. Any attempt to import cryptographic signing utilities inside client components triggers an immediate Next.js compilation error.

2. **HttpOnly Cookie Isolation**:

   - The authentication token (`paddock_auth_token`) is marked `HttpOnly; Secure; SameSite=Lax`. JavaScript running in the browser cannot read or exfiltrate the token via `document.cookie`.

3. **Sliding-Window Memory Store**:

   - Route rate limits are evaluated against an in-memory sliding window queue, discarding expired request timestamps on each hit to prevent memory leaks.

