# 🏎️ PADDOCK TELEMETRY

**A state-of-the-art F1 telemetry and pit-wall command center featuring real-time timing, interactive race replay, teammate head-to-head analytics, satellite circuit maps, and enterprise-grade Supabase PKCE authentication — powered by Next.js 16 (App Router), TypeScript, and Tailwind CSS.**

---

## ⚡ Key Systems & Features

### 🔐 1. End-to-End Supabase PKCE Auth & Security
- **Mandatory Email Verification Gate**: Strict access restriction requiring users to confirm their email address before entering the telemetry dashboard.
- **Supabase Google OAuth 2.0 Integration**: Multi-account device chooser (`prompt: 'select_account consent'`) with dynamic origin detection (`getURL()`) for seamless local and Vercel production deployment.
- **PKCE Password Recovery Journey**: Public `/forgot-password` request form, server-side token exchange via `/auth/callback?next=/update-password`, and authenticated `/update-password` interface.
- **Dual-Layer Hard Credential Validation**: Server-side password verification in `/api/auth/login` via `@supabase/supabase-js` that blocks fake or incorrect credentials.
- **Complete Logout Session Revocation**: Invokes global `supabase.auth.signOut()`, clears HttpOnly session cookies, and purges browser storage (`localStorage`, `sessionStorage`) to eliminate auto-relogin bugs on refresh.

### 🏎️ 2. Hardware-Accelerated F1 Entrance Sweep & Flow Engine
- **2.4s Entrance Sweep**: High-performance right-to-left F1 car entrance (`f1CarRightEntrance`) transitioning into continuous floating flow (`f1CarFloatingFlow`).
- **60fps GPU Compositor**: Uses hardware-accelerated CSS properties (`translate3d`, `opacity`, `.f1-entry-speed-streaks`, `.f1-ambient-flow-glow`) with zero CPU blur overhead.

### 🗺️ 3. 24 GP Circuit Satellite Maps & Corner Telemetry
- **Interactive Track Canvas**: High-precision SVG and canvas map engine for all 24 Grand Prix venues in the 2026 F1 calendar.
- **Corner Telemetry Inspector**: Detailed sector data including apex speeds, lateral G-forces, braking points, and gear selections (`CornerDetails.tsx`).
- **Corner Photo Gallery**: Lightbox gallery showcasing high-resolution apex photography with EXIF metadata (`CornerImageGallery.tsx`).

### ⏱️ 4. Interactive Race Replay Engine (`/replay`)
- **Real-Time Canvas Trajectories**: 60fps telemetry playback engine displaying car positions, gaps, and telemetry graphs.
- **Scrubber & Speed Controls**: Variable playback rates (1x, 2x, 5x, 10x), step-by-step frame stepping, and interactive scrubber timeline (`ReplayTimeline.tsx`).
- **Live Telemetry & Pit Monitors**: Gauges for RPM, speed, DRS, ERS charge percentage, and tire stint degradation (`TelemetryPanel.tsx`, `TyreStrategy.tsx`).

### ⚔️ 5. Teammate Head-to-Head Battle Portal (`/teammates`)
- **Constructor Team Comparisons**: Detailed head-to-head rivalries across all 10 F1 constructor teams.
- **Telemetry Delta Graphs**: Cumulative championship points progression, qualifying pace deltas, and race finish charts (`PointsProgressionChart.tsx`, `QualifyingH2H.tsx`).

---

## 🛠️ Environment Setup (`.env.local`)

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-secure-jwt-secret-key
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛩️ Deploying to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: production build"
   git push origin main
   ```
2. Import the repository in **[Vercel Dashboard](https://vercel.com)**.
3. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VERCEL_URL`) in Vercel settings.
4. Click **Deploy**!

