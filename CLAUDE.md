<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> ⚠️ **Node.js Runtime Requirement**: Node.js 20 and below are deprecated for `@supabase/supabase-js`. Target **Node.js 22 or later** for all builds and serverless runtimes.


# 🏎️ Paddock Telemetry — Developer & AI Assistant Guide

This document serves as the primary technical cheat sheet for working on **Paddock Telemetry**, an enterprise-grade Formula 1 telemetry, pit-wall reconnaissance, and race replay command center.

---

## 🛠️ Common Commands

```bash
# Start local development server (Turbopack)
npm run dev

# Run TypeScript compilation check (strict zero-error policy)
npx tsc --noEmit

# Production build check
npm run build

# Linting
npm run lint
```

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack) & React 19
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS & CSS Variables (`app/globals.css`), Vanilla CSS for micro-interactions
- **Authentication**: Supabase Auth (PKCE flow, Email & Password with confirmation gate, Google OAuth 2.0 PKCE)
- **Session Security**: Server-side Web Crypto HS256 (`app/lib/jwt.ts`) with `HttpOnly; Secure; SameSite=Lax` cookies (`paddock_auth_token`)
- **Telemetry Data Engine**: FastF1 Python timing & coordinate integration, cached community API proxy (`/api/f1/[...path]`)
- **Canvas Engines**: 
  - 60fps GPU-accelerated race replay engine (`CircuitReplay.tsx`)
  - 2D SVG vector circuit geometry & telemetry map (`CircuitMap.tsx` & `circuitTransform.ts`)

---

## 🗺️ Circuit Telemetry & Canvas Geometry Guidelines

### 1. 78-Circuit Coverage & Physics Calibration
- Paddock supports **78 Formula 1 circuits** (25 modern calendar tracks and 53 historic heritage venues) spanning **4,348 corners**.
- Every corner contains verified physics telemetry: entry, apex, and exit speeds (km/h), typical gear, braking intensity / G-force, DRS activation, and overtaking dynamics.
- Track metadata is registered in `TRACKS_REGISTRY` (`app/lib/circuitTransform.ts`) and `public/data/circuits/2024/*.json`.

### 2. Coordinate Transformation & Orientation Rules
- **Auto-Settle 90° Tilt**: In `computeTransformBounds` (`circuitTransform.ts`), circuits with predominantly upright vertical aspect ratios (`rangeY > rangeX * 1.15`, e.g., Indianapolis, Monza) are automatically tilted 90° clockwise so they settle horizontally within widescreen viewports.
- **5-Pass Iterative Collision Relaxation**: To prevent corner badges from overlapping in tight chicanes (e.g. Monza T1–2, T4–5, T8–9–10), `transformCorners` applies a 5-pass iterative relaxation algorithm with `MIN_LABEL_DISTANCE = 38px`.
- **Stable SVG Coordinate Anchoring**: 
  - Never apply `transformBox: 'fill-box'` or `transformOrigin: 'center'` to `<g>` elements that also use SVG `translate(lx, ly)`. In Chrome, dynamic child stroke changes cause bounding box recalculation that leads to high-frequency hover shaking/jitter.
  - Hover states on SVG corners must use **color-only transitions** (`transition-colors duration-150`), never stroke-width or radius transitions (`transition-all`).
  - Hit targets must be right-sized (e.g., 32×26px for badges, 12px radius for apex anchors) using `fill="#FFFFFF" fillOpacity="0.001"` to ensure painted collision detection without overlapping neighboring chicanes.

### 3. Canvas Drag vs. Click Interactions
- Canvas panning uses a 12px threshold (`Math.hypot(dx, dy) < 12`) to prevent normal clicking micro-movements from initiating map dragging ("running").
- Interactive nodes must have `data-corner="true"`. `handleMouseDown` and `handleTouchStart` check `target.closest('[data-corner="true"]')` to completely isolate corner clicks from canvas dragging.
- Modal backdrops must use an opening time guard (`modalOpenedAtRef`, 250ms threshold) to prevent click bleed-through from immediately closing the modal.

---

## 🎨 Design System & Pit-Wall Aesthetics

- **Theme**: Dark pit-wall telemetry HUD (`#090D16`, `#0D1117`, `#050814`) with glassmorphism overlays.
- **Typography Tokens**:
  - Display & Headings: `Titillium Web` (`font-display`, uppercase, black/bold)
  - Telemetry & Speed Gauges: `Roboto Condensed` (`font-telemetry`, high-contrast technical data)
  - Body & UI: `Inter` (`font-sans`)
  - Tabular & Code: `JetBrains Mono` (`font-mono`, tabular numbers)
- **Tire Compound Palette**: Soft (🔴 `#FF1801`), Medium (🟡 `#FFD800`), Hard (⚪ `#FFFFFF`), Inter (🟢 `#3ECF8E`), Wet (🔵 `#0070F3`).

---

## 📚 Documentation Reference

For in-depth architectural and engineering specifications, refer to the documentation suite in `docs/`:
- `docs/01_PRD.md`: Product Requirements & Persona Specifications
- `docs/02_SRS.md`: System Requirements & Non-Functional SLAs
- `docs/03_USER_STORIES.md`: User Stories & Gherkin Acceptance Criteria
- `docs/04_SYSTEM_ARCHITECTURE.md`: Architecture Diagrams & Component Pipelines
- `docs/05_DATABASE_DESIGN.md`: PostgreSQL Schema, RLS & Supabase Models
- `docs/06_API_SPECIFICATION.md`: Endpoints Reference & Status Codes
- `docs/07_UI_UX_SPECIFICATION.md`: UI/UX Design System & Canvas Rules
- `docs/08_SECURITY.md`: Auth Architecture, PKCE, CSP & Threat Mitigation
- `docs/09_TESTING_STRATEGY.md`: Test Suites, Benchmarks & Validation
- `docs/10_DEPLOYMENT.md`: Environment Matrix, Vercel & CI/CD Ops
