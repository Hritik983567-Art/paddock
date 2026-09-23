# 🏎️ Paddock Telemetry — UI/UX Specification & Design System

| Metadata | Details |
| :--- | :--- |
| **Document ID** | `PADDOCK-UI-007` |
| **Version** | `1.0.0` (Production Baseline) |
| **Design Language** | Dark Pit-Wall Telemetry HUD / Glassmorphism |
| **Status** | Approved / Active |

---

## 1. Design Vision & Guiding Principles

The Paddock Telemetry interface is engineered to emulate an **FIA Formula 1 Pit-Wall Engineering Command Console**:
1. **Mission-Critical Legibility**: Dark backgrounds with high-contrast neon accents ensure instant readability of micro-second timing deltas and telemetry curves under intense simulation sessions.
2. **Tactile Micro-Interactions**: Real-time tachometers, speed gauges, and timeline scrubbers feature hardware-accelerated transitions that respond instantly to user input.
3. **Information Density without Clutter**: Modular card grids and collapsible drawers allow users to drill from macro championship standings down to apex G-forces on turn 4 of Suzuka.

---

## 2. Color System & Design Tokens

### 2.1 Base System Tokens
```css
:root {
  /* Surface Darks */
  --bg-paddock-base: #0a0a0f;
  --bg-paddock-surface: #12121a;
  --bg-paddock-elevated: #1a1a24;
  --border-paddock: rgba(255, 255, 255, 0.08);

  /* Brand Accents */
  --accent-f1-red: #e10600;
  --accent-neon-cyan: #00f0ff;
  --accent-telemetry-green: #00e676;
  --accent-warning-yellow: #ffd600;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 2.2 F1 Tire Compound Palette
| Compound | Token Variable | Hex Code | Visual Swatch | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Soft (C3–C5)** | `--tyre-soft` | `#FF1801` | 🔴 Red | Maximum mechanical grip, fast degradation |
| **Medium (C2–C4)**| `--tyre-medium` | `#FFD800` | 🟡 Yellow | Balanced race strategy compound |
| **Hard (C1–C3)** | `--tyre-hard` | `#FFFFFF` | ⚪ White | Low degradation, long stint durability |
| **Intermediate** | `--tyre-inter` | `#3ECF8E` | 🟢 Green | Damp tracks with standing surface water |
| **Full Wet** | `--tyre-wet` | `#0070F3` | 🔵 Blue | Heavy rain and monsoon conditions |

### 2.3 Constructor Livery Themes
- **Scuderia Ferrari**: Red (`#E8002D`), Gold (`#FFF200`), Carbon Black (`#000000`).
- **Red Bull Racing**: Deep Navy (`#1434CB`), Red (`#ED1B24`), Yellow (`#FCD700`).
- **Mercedes-AMG**: Silver (`#00A19B`), Petro-Cyan (`#00D2BE`), Obsidian (`#0A0A0A`).
- **McLaren**: Papaya Orange (`#FF8000`), Anthracite (`#111111`), Cyan (`#47C7FC`).

---

## 3. Typography & Data Formatting

- **Data Values & Sector Timing**: Rendered strictly in monospace fonts (`JetBrains Mono` or tabular numerals `font-variant-numeric: tabular-nums`) to prevent layout shifting as lap counters increment.
- **Lap Deltas**:
  - Negative (Faster / Green): `text-emerald-400 font-mono -0.142s`
  - Positive (Slower / Red): `text-rose-400 font-mono +0.389s`

---

## 4. Canvas Telemetry Specifications

### 4.1 60fps Vector Track Canvas (`CircuitReplay.tsx`)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [LIVE REPLAY HUD]                     Round 08: Monaco GP  [LAP 34/78] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                      .-""""-.                                          │
│                    .'  16    '.       (Track Canvas Projection)        │
│                   /   _    _   \                                       │
│                  ;   (_)  (_)   ;     • VER (P1)                       │
│                  |    __    |   • NOR (P2) +1.284s                     │
│                  \   \__/   /         • LEC (P3) +2.411s               │
│                   '.      .'                                           │
│                     `'--'`                                             │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Speedometer: 284 km/h] [RPM: 11,850] [DRS: ACTIVE] [ERS: 84%]        │
├────────────────────────────────────────────────────────────────────────┤
│ [⏮] [◀◀] [ ▶ PLAY ] [▶▶] [⏭]  Speed: [1x] [2x] [5x] [10x]  [00:48:12] │
└────────────────────────────────────────────────────────────────────────┘
```

- **Resolution Scaling**: Canvas dimensions dynamically adapt to `window.devicePixelRatio` to prevent blurriness on Retina/High-DPI displays.
- **Car Node Markers**: 12px circular SVG/Canvas nodes displaying constructor colors and driver three-letter codes (e.g., `HAM`, `VER`, `LEC`).

---

## 5. Responsive Grid & Breakpoint Strategy

| Breakpoint | Width Range | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Single-column stacked cards. Canvas switches to compact pan mode. Bottom sticky playback controller. |
| **Tablet (`md`)** | `640px – 1024px`| 2-column layout. Split view between circuit map and corner telemetry specs. |
| **Desktop (`lg`)**| `1024px – 1536px`| 3-column pit-wall console. Live leaderboards, track canvas, and driver telemetry gauges. |
| **Command Center (`2xl`)**| `> 1536px` | Dual-monitor widescreen optimization with multi-driver telemetry overlay panes. |

---

## 6. Accessibility & Keyboard Control Standards

- **Keyboard Shortcut Mapping**:
  - `Space`: Toggle Replay Play / Pause.
  - `Arrow Left` / `Arrow Right`: Step backward / forward 5 seconds.
  - `Arrow Up` / `Arrow Down`: Increase / decrease playback speed multiplier.
  - `Key M`: Toggle audio/sound telemetry effects.
  - `Key F`: Toggle full-screen command center mode.
- **Screen Reader Support**: All interactive charts and HUD nodes contain descriptive `aria-label` tags (e.g. `aria-label="Turn 4 Variante del Rettifilo apex speed 75 kilometers per hour"`).
