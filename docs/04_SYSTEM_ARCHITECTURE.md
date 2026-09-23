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

---

## 4. Codebase Composition & Volume Metrics

The Paddock platform comprises modular TypeScript, React, and server-side components:

| Component Category | File Count | Line Count | Codebase Share |
| :--- | :--- | :--- | :--- |
| 🎨 **Frontend UI & Visual Telemetry** | 38 Files | ~12,450 Lines | **64.2%** |
| ⚙️ **Backend API Routes & Cryptography** | 12 Files | ~4,820 Lines | **24.9%** |
| 🗄️ **Database Schemas & Data Configs** | 5 Files | ~2,110 Lines | **10.9%** |
| 🏁 **Total Active Volume** | **55 Files** | **~19,380 Lines** | **100.0%** |

```text
Component Distribution:
[████████████████████████████████████████████████████████████] 64.2% Frontend UI
[█████████████████████████] 24.9% Backend APIs & Security
[███████████] 10.9% Database & Config
```

---

## 5. Security & Isolation Boundaries

1. **`import 'server-only'` Barrier**:
   - The Web Crypto HS256 engine in [`app/lib/jwt.ts`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/app/lib/jwt.ts) explicitly declares `import 'server-only'`. Any attempt to import cryptographic signing utilities inside client components triggers an immediate Next.js compilation error.
2. **HttpOnly Cookie Isolation**:
   - The authentication token (`paddock_auth_token`) is marked `HttpOnly; Secure; SameSite=Lax`. JavaScript running in the browser cannot read or exfiltrate the token via `document.cookie`.
3. **Sliding-Window Memory Store**:
   - Route rate limits are evaluated against an in-memory sliding window queue, discarding expired request timestamps on each hit to prevent memory leaks.
