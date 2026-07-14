# 🏎️ Paddock

**A premium F1 telemetry and pit-wall command center featuring live timing, session replay, tyre strategy simulation, and satellite circuit maps — powered by Next.js, TypeScript, and the Jolpica F1 API.**

---

## ⚡ Core Features

### 1. 📡 Live Telemetry Console ("Mission Control")
* **Dual Connection Toggles**: Switch between a local simulation engine and a live connection to official F1 timing feeds.
* **Live Timing classifications**: Real-time position shifts, speed traps, tyre choices, and tyre ages.
* **Pit Radio Terminal Event Log**: Retro green command-line terminal displaying pit lane entries, safety car conditions, and simulated radio transcript logs.

### 2. 🗺️ Real Race Tracker Timing Center
* **Telemetry Timing Board**: Deep historical classifications sheet.
* **Dynamic Satellite Mapping**: Embeds Google Maps satellite imagery centered on the selected Grand Prix circuit coordinates.
* **Pit Lane Logs**: Chronological timeline showing stop counts and total pit lane durations.
* **Live weather feeds**: Displays venue coordinates temperature, humidity, wind speed, and precipitation.

### 3. ⏮️ Interactive Session Replay
* **Step-by-Step Scrubbing**: Inspect races at your own pace with `⏮ Step Back` and `⏭ Step Fwd` controls.
* **Custom Playback Speeds**: Slow (1.6s) and Super Slow (3.2s) options.
* **Hover Cross-Highlighting**: Highlight a driver's trace line and standing row simultaneously.

### 4. 🧸 Teammate PVC Showroom
* Driver pairings side-by-side represented as glossy, team-colored PVC collectible figures displaying permanent numbers (`#44 · HAM`) and three-letter timing codes.

---

## 🚀 Running Locally

### 1. Start the Next.js Frontend
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Launch the F1 Timing Proxy Server
To connect to the F1 Timing Server (stands by with a mock stream on non-race days):
```bash
node scripts/f1-proxy.js
```
Then, toggle the connection selector on the **Live Telemetry** page to "Connect to F1 Live Server".

---

## 🛩️ Deploying to Vercel

1. Push this codebase to a new repository on GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
2. Import the repository inside your Vercel Dashboard at **[vercel.com](https://vercel.com)**.
3. Click **Deploy**!
