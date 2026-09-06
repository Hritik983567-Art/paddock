# 🏎️ PADDOCK TELEMETRY — Enterprise System Architecture & Technical Pitch

> **Pitch-Ready Technical Documentation & Architectural Blueprint**  
> *A high-performance Formula 1 Telemetry Reconnaissance, 60fps Race Replay Engine, and Pit-Wall Command Center built with Next.js 16 (App Router), TypeScript, Supabase PKCE, and FastF1 Integration.*

---

## 🎯 Executive Summary & Value Proposition

**PADDOCK TELEMETRY** is an enterprise-grade Formula 1 analytics and pit-wall reconnaissance platform. Designed to process official F1 telemetry, driver telemetry streams, and FIA track vectors, Paddock provides real-time telemetry analysis, 60fps canvas race replays, teammate head-to-head performance metrics, and 78 F1 circuit corner reconnaissance profiles.

### 🌟 Core Pitch Highlights
* **78 F1 Circuit Support**: Complete coverage of current Grand Prix venues, historic retro tracks (Nürburgring Nordschleife, Brands Hatch, Sepang, Kyalami), and street circuits.
* **FastF1 Telemetry Engine**: Live telemetry proxy integration providing telemetry metrics for speed, throttle, braking intensity, lateral/longitudinal G-forces, RPM, and gear selection.
* **60fps Vector & Telemetry Playback Engine**: Zero-lag HTML5 Canvas & SVG rendering pipeline for telemetry playback and interactive 2D track maps.
* **Supabase PKCE Auth & Security**: Production-hardened PKCE auth lifecycle with Google OAuth 2.0, mandatory email verification gates, and instant session revocation.
* **Intelligent Telemetry & Image Matcher**: Dynamic pattern-matching algorithm mapping corner clicks to verified high-resolution apex photography and technical specs.

---

## 📐 System Architecture & Data Flow

Paddock Telemetry is structured as a modular, decoupled architecture consisting of a **Client Compositor Layer**, **Security & Auth Layer**, **Serverless API Gateway**, and **FastF1 Telemetry Ingestion Layer**.

```mermaid
graph TD
    %% Styling
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef auth fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef api fill:#111827,stroke:#f43f5e,stroke-width:2px,color:#fff
    classDef engine fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    classDef storage fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#fff

    subgraph Client Layer ["🖥️ Client Compositor Layer (Next.js 16 App Router)"]
        UI["React 19 App Shell & Layout Wrapper"]
        Replay["60fps Race Replay Engine (/replay)"]
        Gallery["78 Track Corner Gallery (/gallery)"]
        Tracker["Live Driver & Pit Tracker (/tracker)"]
        Teammates["Constructor H2H Battle Portal (/teammates)"]
        Lab["High-Contrast Telemetry Lab (/lab)"]
    end

    subgraph Auth Layer ["🔐 Security & Session Layer"]
        AuthCtx["AuthContext & Middleware Guard"]
        SupabasePKCE["Supabase PKCE OAuth 2.0 & Auth Engine"]
        JWTValidation["JWT Token & Session Cookie Storage"]
    end

    subgraph API Layer ["⚡ Serverless API & Proxy Gateway"]
        AuthAPIs["/api/auth (Login, Verify, Callback, Session)"]
        CircuitAPIs["/api/circuits/[year]/[circuit] Engine"]
        NewsAPIs["/api/news F1 Feed Aggregator"]
    end

    subgraph Ingestion Layer ["🏎️ Telemetry & Data Processing Layer"]
        FastF1Proxy["FastF1 Python Telemetry Proxy"]
        TransformEngine["Unified Track Coordinate Engine (circuitTransform.ts)"]
        CornersDB["78 Circuit Corner Technical Database (circuitCornersData.ts)"]
        MediaDB["Apex Photography & Vector Registry (galleryMediaData.ts)"]
    end

    subgraph External Systems ["🌐 External Providers & Datasets"]
        F1Timing["Official F1 Timing & Ergast API"]
        SupabaseCloud["Supabase Cloud (Auth, Postgres RLS)"]
        FastF1Server["FastF1 Live Telemetry Servers"]
    end

    %% Interactions
    UI --> AuthCtx
    AuthCtx --> SupabasePKCE
    SupabasePKCE --> SupabaseCloud

    Replay & Gallery & Tracker & Teammates & Lab --> CircuitAPIs
    CircuitAPIs --> FastF1Proxy
    FastF1Proxy --> FastF1Server
    CircuitAPIs --> TransformEngine
    TransformEngine --> CornersDB
    Gallery --> MediaDB

    class UI,Replay,Gallery,Tracker,Teammates,Lab client
    class AuthCtx,SupabasePKCE,JWTValidation auth
    class AuthAPIs,CircuitAPIs,NewsAPIs api
    class FastF1Proxy,TransformEngine,CornersDB,MediaDB engine
    class F1Timing,SupabaseCloud,FastF1Server storage
```

---

## 🔄 FastF1 Telemetry Ingestion & Transformation Sequence

The transformation sequence converts raw FastF1 global spatial coordinates into normalized 2D SVG/Canvas render coordinates with high mathematical precision.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Pit-Wall Operator
    participant Client as Next.js 16 Client Canvas
    participant API as Serverless Circuit API (/api/circuits/2024/monza)
    participant Python as FastF1 Telemetry Proxy
    participant Engine as Coordinate Transform Engine (circuitTransform.ts)

    User->>Client: Selects Circuit (e.g. Monza) / Clicks Corner Marker
    Client->>API: GET /api/circuits/2024/monza
    API->>Python: Request telemetry & corner vector data
    Python-->>API: Raw FastF1 X/Y array, speeds, gears, braking Gs
    API->>Engine: Pass raw telemetry + corner bounds
    
    Note over Engine: 1. Calculate Bounding Box (minX, maxX, minY, maxY)<br/>2. Apply Circuit Rotation Angle (degrees)<br/>3. Normalize to SVG Canvas (e.g. 1000x1000)<br/>4. Enrich corners with entry/apex/exit speeds
    
    Engine-->>API: Returns TransformedPoint[] & EnrichedCorners[]
    API-->>Client: JSON response (status: 200 OK)
    Client->>Client: Render 60fps Track Vector & Animate Telemetry Car Markers
    Client-->>User: Interactive Track Canvas & Corner Technical Specs Modal
```

---

## 🔐 Supabase PKCE Authentication & Security Lifecycle

Paddock implements a enterprise-grade PKCE (Proof Key for Code Exchange) auth flow ensuring user credentials and session tokens remain strictly secured across desktop and mobile browsers.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Member
    participant Frontend as Next.js Client (/login)
    participant AuthContext as React AuthContext Guard
    participant Server as Next.js API Routes (/api/auth)
    participant Supabase as Supabase Auth PKCE Provider

    alt Email & Password Authentication
        User->>Frontend: Submit Login Form (Email + Password)
        Frontend->>Server: POST /api/auth/login
        Server->>Supabase: supabase.auth.signInWithPassword()
        Supabase-->>Server: User Session & Access Token / Error
        Server-->>Frontend: Set HttpOnly Cookie & Return User Profile
    else Google OAuth 2.0 PKCE Flow
        User->>Frontend: Click "Sign in with Google"
        Frontend->>Supabase: supabase.auth.signInWithOAuth({ provider: 'google' })
        Supabase-->>User: Redirect to Google OAuth Consent Screen
        User->>Supabase: Approve Permissions
        Supabase-->>Server: Redirect to /auth/callback?code=...
        Server->>Supabase: supabase.auth.exchangeCodeForSession(code)
        Supabase-->>Server: Session Tokens
        Server-->>Frontend: Redirect to / (Authenticated Dashboard)
    end

    Frontend->>AuthContext: Verify Auth State & Check Email Verification
    alt Email Not Verified
        AuthContext-->>User: Display Verification Gate Alert ("Check Inbox")
    else Email Verified & Active Session
        AuthContext-->>User: Grant Full Access to Telemetry Pit-Wall
    end
```

---

## 🛠️ Key Architectural Components

### 1. Unified Track Transformation Engine (`app/lib/circuitTransform.ts`)
- **Mathematical Pipeline**: Ensures raw FastF1 track coordinates and FIA corner marker coordinates undergo the **exact same** transformation steps:
  $$\text{Point}_{\text{rotated}} = R(\theta) \cdot (\text{Point} - \text{Center})$$
  $$\text{Point}_{\text{canvas}} = \text{Scale} \cdot \text{Point}_{\text{rotated}} + \text{Padding}$$
- **Zero NaN Safety**: Protects coordinate math against division-by-zero or missing telemetry points using strict type guards.

### 2. Intelligent Corner Reconnaissance Engine (`app/gallery/page.tsx`)
- **Multi-Level Pattern Matcher**: Resolves corner selections (e.g. clicking "Turn 1" on Monza map) to multi-turn gallery items (e.g. "Turns 1-2 Variante del Rettifilo").
- **Dynamic Fallback Pipeline**: If a custom apex photo is unavailable for obscure historical circuits, the engine automatically selects a high-res constructor team background (`ferrari-bg`, `mclaren-bg`, `mercedes-bg`, `redbull-bg`, `aston-bg`), eliminating broken image 404 errors.

### 3. 60fps Race Replay & Telemetry Engine (`app/replay/page.tsx`)
- **GPU-Composited Playback**: Renders live driver markers on canvas with 60fps requestAnimationFrame synchronization.
- **Telemetry Gauges**: Monitors speed (km/h), RPM tachometers, DRS state, ERS charge %, tire compound degradation, and pit-stop durations.

### 4. Constructor Teammates H2H Battle Portal (`app/teammates/page.tsx`)
- **Telemetry Delta Graphs**: Visualizes qualifying pace deltas, championship points progression curves, and head-to-head battle metrics across all 10 F1 constructor teams.

---

## ⚡ Performance & Optimization Benchmarks

* **Rendering Performance**: 60fps smooth canvas playback using GPU CSS composition (`translate3d`, `will-change`).
* **Bundle Efficiency**: Strict tree-shaking with Next.js Turbopack, maintaining a lean client core bundle (~1.44 MB app code).
* **Zero Main-Thread Blocking**: Telemetry vector scaling and bounding box math executed in optimized synchronous sub-millisecond helper routines.

---

## 🚀 Environment Setup & Production Deployment

### Prerequisites
- Node.js 18.x or 20.x
- npm / pnpm / yarn

### Required Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-secure-jwt-secret-key
```

### Build & Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```
