# 🏎️ Paddock Telemetry — Software Requirements Specification (SRS)

| Metadata | Details |
| :--- | :--- |
| **Document ID** | `PADDOCK-SRS-002` |
| **Project Name** | Paddock Telemetry & Pit-Wall Command Center |
| **Version** | `1.0.0` (Production Baseline) |
| **Status** | Approved / Active |
| **Target Framework** | Next.js 16 (App Router), React 19, TypeScript 5, Supabase |

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, behavioral, performance, and interface requirements for the **Paddock Telemetry** web application. It serves as the authoritative technical benchmark for software engineers, QA specialists, and system architects maintaining the repository.

### 1.2 Scope of the System
Paddock Telemetry is a client-server web platform delivering telemetry visualization, race replay simulation, circuit reconnaissance, and statistical analytics for Formula 1 racing. The system interfaces with Supabase for user persistence and external telemetry data sources (FastF1 and Jolpica/Ergast).

---

## 2. Overall Description

### 2.1 System Architecture Perspective
Paddock operates as a Next.js 16 full-stack application utilizing Server Components, Client Components, and Edge/Node Route Handlers.

```mermaid
graph TD
    User["Client Browser (Chrome / Safari / Firefox)"]
    NextEdge["Next.js 16 App Router & Route Handlers"]
    SupabaseAuth["Supabase PostgreSQL & PKCE Auth"]
    TelemetryProxy["In-Memory Cached Telemetry Proxy (/api/f1)"]
    FastF1Engine["FastF1 Python Engine / Jolpica REST API"]

    User <-->|HTTPS / Secure Cookies| NextEdge
    NextEdge <-->|PostgreSQL Protocol / REST| SupabaseAuth
    NextEdge <-->|HTTP Cache Layer (5 min)| TelemetryProxy
    TelemetryProxy <-->|JSON / CSV Telemetry Stream| FastF1Engine
```

### 2.2 System Constraints
1. **Runtime Environment**: Node.js `>= 20.x` with Turbopack support.
2. **Browser Requirements**: Modern evergreen browsers supporting HTML5 Canvas, Web Crypto API (`crypto.subtle`), and ES2022.
3. **Data Availability**: Upstream telemetry depends on official session availability and Jolpica/Ergast rate-limiting constraints.

---

## 3. Specific Functional Requirements

### 3.1 Authentication & User Lifecycle (FR-AUTH)

- **FR-AUTH-01 (Mandatory Email Gate)**: The system shall intercept unconfirmed accounts upon signup and block access to pit-wall features until `email_confirmed_at` is populated via Supabase PKCE confirmation.
- **FR-AUTH-02 (Credential Verification)**: The system shall authenticate email/password credentials server-side via `/api/auth/login` utilizing Supabase Auth and issue signed `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **FR-AUTH-03 (Google OAuth 2.0 PKCE)**: The system shall support Google Single Sign-On using PKCE code exchange with dynamic multi-account selection prompt (`prompt: 'select_account consent'`).
- **FR-AUTH-04 (Session Revocation)**: On user logout, the system shall trigger global session invalidation across Supabase, invalidate server cookies, and purge client-side session storage.
- **FR-AUTH-05 (Password Recovery)**: The system shall provide an asynchronous password recovery journey across `/forgot-password` and `/update-password` with PKCE token validation.

### 3.2 Circuit Reconnaissance & Apex Telemetry (FR-CIRCUIT)

- **FR-CIRCUIT-01 (78 Circuit Vector Database)**: The system shall provide SVG and 2D vector coordinate datasets for 78 worldwide Formula 1 circuits.
- **FR-CIRCUIT-02 (Apex Telemetry Inspection)**: Selecting any corner marker shall update the telemetry HUD with entry speed (km/h), apex speed, exit speed, minimum gear, and peak lateral/longitudinal G-forces.
- **FR-CIRCUIT-03 (Interactive Zoom & Pan)**: The circuit map canvas shall support touch/mouse zoom, pan, and dynamic recentering with sector highlights (Sector 1, 2, 3).
- **FR-CIRCUIT-04 (Apex Photography Matching)**: The system shall display verified apex photography with license accreditation and metadata, gracefully falling back to high-resolution team wallpapers if corner photography is pending.

### 3.3 60fps Race Replay Engine (FR-REPLAY)

- **FR-REPLAY-01 (Continuous Canvas Loop)**: The replay engine shall execute via `requestAnimationFrame` maintaining a target frame rate of 60 frames per second on compliant hardware.
- **FR-REPLAY-02 (Timeline Scrubbing & Rate Multipliers)**: The timeline shall allow scrubbing across any lap (1 through total race laps) and playback speed adjustments (1x, 2x, 5x, 10x).
- **FR-REPLAY-03 (Telemetry Gauges)**: The replay interface shall render live tachometers, speedometers, throttle/brake progression bars, DRS deployment status, and ERS battery charge percentage.
- **FR-REPLAY-04 (Event Logging)**: The event feed shall log overtakes, yellow flags, safety car deployments, pit entry/exit events, and retirements with timestamps.

### 3.4 Teammate Head-to-Head Analytics (FR-TEAMMATE)

- **FR-TEAMMATE-01 (Constructor Comparison)**: The portal shall provide head-to-head comparisons for all 10 active Formula 1 constructor teams.
- **FR-TEAMMATE-02 (Delta Pace Calculations)**: The system shall compute median qualifying pace deltas in milliseconds between teammates.
- **FR-TEAMMATE-03 (Points & Position Graphs)**: The portal shall render round-by-round cumulative championship points progression and finishing position line charts.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance Requirements (NFR-PERF)
| Metric | Target SLA | Benchmark Result |
| :--- | :--- | :--- |
| **Replay Canvas Frame Rate** | $\ge 58\text{ fps}$ continuous | $60.0\text{ fps}$ |
| **Cached API Response Time** | $\le 300\text{ ms}$ | $45\text{ ms}$ (memory cache) |
| **Cold Upstream Telemetry Fetch**| $\le 2500\text{ ms}$ | $1850\text{ ms}$ |
| **Peak Concurrency Throughput** | $\ge 35\text{ req/sec}$ without 5xx errors | $37.26\text{ req/sec}$ (1,000 req test) |

### 4.2 Security Requirements (NFR-SEC)
- **Zero Client Token Storage**: Authentication tokens shall never be written to `window.localStorage` or accessible via document scripts.
- **Defensive HTTP Headers**: The system shall serve HSTS (`max-age=63072000`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a strict Content Security Policy restricting `script-src` and eliminating `'unsafe-eval'`.
- **Rate Limiting**: High-risk routes (`/api/auth/login`, `/api/auth/register`) shall enforce IP-based sliding window rate limits (maximum 10 requests per minute).

### 4.3 Usability & Accessibility (NFR-USAB)
- Full keyboard shortcut navigation in the replay viewer (Space for play/pause, Arrow keys for 5s/lap skips).
- High-contrast telemetry visualization conforming to WCAG 2.1 AA standards for data charts and telemetry HUD elements.

---

## 5. Interface & Protocol Requirements

### 5.1 External Software Interfaces
- **Supabase JS SDK (`@supabase/supabase-js` v2.112.4)**: User authentication, PKCE flow, and PostgreSQL persistence with RLS.
- **Jolpica / Ergast F1 REST API**: Historical race results, lap times, pit stop records, and driver standings.
- **FastF1 Python Integration**: High-density per-car telemetry traces (RPM, Speed, Throttle, Brake, Gear, X/Y coordinates).
- **Web Crypto API**: Native `crypto.subtle` HMAC-SHA256 signature verification for server-issued JWT tokens.
