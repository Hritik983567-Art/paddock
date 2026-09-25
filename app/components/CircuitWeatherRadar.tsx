'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchCircuitWeather, WeatherData } from '../utils/api';

interface CircuitLocation {
  id: string;
  name: string;
  flag: string;
  locality: string;
  country: string;
  lat: string;
  lon: string;
}

const DEFAULT_CALENDAR_CIRCUITS: CircuitLocation[] = [
  { id: 'bahrain', name: 'Bahrain International Circuit', flag: '🇧🇭', locality: 'Sakhir', country: 'Bahrain', lat: '26.0325', lon: '50.5106' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', flag: '🇸🇦', locality: 'Jeddah', country: 'Saudi Arabia', lat: '21.6319', lon: '39.1044' },
  { id: 'albert_park', name: 'Albert Park Circuit', flag: '🇦🇺', locality: 'Melbourne', country: 'Australia', lat: '-37.8497', lon: '144.968' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', flag: '🇯🇵', locality: 'Suzuka', country: 'Japan', lat: '34.8431', lon: '136.541' },
  { id: 'shanghai', name: 'Shanghai International Circuit', flag: '🇨🇳', locality: 'Shanghai', country: 'China', lat: '31.3389', lon: '121.22' },
  { id: 'miami', name: 'Miami International Autodrome', flag: '🇺🇸', locality: 'Miami', country: 'United States', lat: '25.9581', lon: '-80.2389' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari (Imola)', flag: '🇮🇹', locality: 'Imola', country: 'Italy', lat: '44.3439', lon: '11.7167' },
  { id: 'monaco', name: 'Circuit de Monaco', flag: '🇲🇨', locality: 'Monte Carlo', country: 'Monaco', lat: '43.7347', lon: '7.4206' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', flag: '🇨🇦', locality: 'Montreal', country: 'Canada', lat: '45.5', lon: '-73.5228' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', flag: '🇪🇸', locality: 'Montmeló', country: 'Spain', lat: '41.57', lon: '2.2611' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', flag: '🇦🇹', locality: 'Spielberg', country: 'Austria', lat: '47.2197', lon: '14.7647' },
  { id: 'silverstone', name: 'Silverstone Circuit', flag: '🇬🇧', locality: 'Silverstone', country: 'Great Britain', lat: '52.0786', lon: '-1.0169' },
  { id: 'hungaroring', name: 'Hungaroring', flag: '🇭🇺', locality: 'Mogyoród', country: 'Hungary', lat: '47.5789', lon: '19.2486' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', flag: '🇧🇪', locality: 'Spa', country: 'Belgium', lat: '50.4372', lon: '5.9714' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', flag: '🇳🇱', locality: 'Zandvoort', country: 'Netherlands', lat: '52.3888', lon: '4.5409' },
  { id: 'monza', name: 'Autodromo Nazionale Monza', flag: '🇮🇹', locality: 'Monza', country: 'Italy', lat: '45.6156', lon: '9.2811' },
  { id: 'baku', name: 'Baku City Circuit', flag: '🇦🇿', locality: 'Baku', country: 'Azerbaijan', lat: '40.3725', lon: '49.8533' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', flag: '🇸🇬', locality: 'Marina Bay', country: 'Singapore', lat: '1.2914', lon: '103.864' },
  { id: 'americas', name: 'Circuit of the Americas (COTA)', flag: '🇺🇸', locality: 'Austin', country: 'United States', lat: '30.1328', lon: '-97.6411' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', flag: '🇲🇽', locality: 'Mexico City', country: 'Mexico', lat: '19.4042', lon: '-99.0907' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace (Interlagos)', flag: '🇧🇷', locality: 'São Paulo', country: 'Brazil', lat: '-23.7036', lon: '-46.6997' },
  { id: 'vegas', name: 'Las Vegas Strip Circuit', flag: '🇺🇸', locality: 'Las Vegas', country: 'United States', lat: '36.1147', lon: '-115.173' },
  { id: 'losail', name: 'Lusail International Circuit', flag: '🇶🇦', locality: 'Lusail', country: 'Qatar', lat: '25.49', lon: '51.4542' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', flag: '🇦🇪', locality: 'Abu Dhabi', country: 'United Arab Emirates', lat: '24.4672', lon: '54.6031' },
];

interface CircuitWeatherRadarProps {
  initialLat?: string;
  initialLon?: string;
  circuitName?: string;
  locality?: string;
  country?: string;
  flag?: string;
  circuitId?: string;
}

export default function CircuitWeatherRadar({
  initialLat,
  initialLon,
  circuitName,
  locality,
  country,
  flag = '🏁',
}: CircuitWeatherRadarProps) {
  // Active selected circuit state
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('auto');
  const [radarRange, setRadarRange] = useState<number>(50); // 25, 50, 100 km
  const [showExpandedModal, setShowExpandedModal] = useState<boolean>(false);

  // Weather fetch states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Active coordinates
  const activeLocation = useMemo(() => {
    if (selectedCircuitId !== 'auto') {
      const found = DEFAULT_CALENDAR_CIRCUITS.find(c => c.id === selectedCircuitId);
      if (found) return found;
    }
    return {
      id: 'active_gp',
      name: circuitName || 'Active Grand Prix Circuit',
      flag: flag || '🏁',
      locality: locality || '',
      country: country || '',
      lat: initialLat || '26.0325',
      lon: initialLon || '50.5106',
    };
  }, [selectedCircuitId, initialLat, initialLon, circuitName, locality, country, flag]);

  // Load weather when activeLocation changes
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCircuitWeather(activeLocation.lat, activeLocation.lon);
        if (!isCancelled) {
          setWeather(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const e = err as Error;
          setError(e.message || 'Weather radar feed offline');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    // Poll every 3 minutes for live weather radar updates
    const timer = setInterval(loadData, 180000);
    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [activeLocation.lat, activeLocation.lon]);

  // Canvas radar animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Radar Animation Loop
  useEffect(() => {
    let animId: number;
    let angle = 0;

    // Seed realistic Doppler rain cloud echo blobs
    const seed = (Math.abs(parseFloat(activeLocation.lat)) * 100 + Math.abs(parseFloat(activeLocation.lon))) % 1000;
    const cloudCoverage = weather?.cloudCover ?? 20;
    const rainVol = weather?.rain ?? 0;
    const rainProb = weather?.rainProbability ?? 0;
    const windAngleRad = ((weather?.windDirection ?? 80) * Math.PI) / 180;

    // ONLY generate Doppler precipitation echo clusters if rain is detected or risk >= 15%
    let numBlobs = 0;
    if (rainVol > 1.5) numBlobs = 8;
    else if (rainVol > 0.05) numBlobs = 6;
    else if (rainProb >= 50) numBlobs = 5;
    else if (rainProb >= 25) numBlobs = 3;
    else if (rainProb >= 15) numBlobs = 2;

    const blobs = Array.from({ length: numBlobs }, (_, i) => {
      const distRatio = 0.25 + ((seed * (i + 1) * 17) % 60) / 100; // 0.25 to 0.85 of radius
      const blobAngle = ((seed * (i + 1) * 43) % 360) * (Math.PI / 180);
      const intensity = rainVol > 1.5 ? 0.9 : rainVol > 0.1 ? 0.65 : rainProb > 40 ? 0.45 : 0.25;
      const radius = 12 + ((seed * (i + 1) * 11) % 24);
      return { distRatio, blobAngle, intensity, radius };
    });

    const drawRadar = (canvas: HTMLCanvasElement | null, isModal = false) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) - (isModal ? 24 : 12);

      // Clear with dark carbon cockpit background
      ctx.fillStyle = '#060A12';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial dark gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      bgGrad.addColorStop(0, '#0B111D');
      bgGrad.addColorStop(0.7, '#070C15');
      bgGrad.addColorStop(1, '#030509');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // Outer bezel ring
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Range Rings (10km, 25km, 50km, 100km equivalents)
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      const ringLabels = [
        Math.round(radarRange * 0.25) + 'k',
        Math.round(radarRange * 0.5) + 'k',
        Math.round(radarRange * 0.75) + 'k',
        radarRange + 'km',
      ];

      ringSteps.forEach((step, idx) => {
        const r = maxR * step;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? 'rgba(0, 245, 212, 0.35)' : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.font = `${isModal ? '10px' : '8px'} 'Roboto Condensed', sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(ringLabels[idx], cx + 4, cy - r + 10);
      });

      // Crosshairs (N-S, E-W)
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Compass Cardinal Points
      ctx.font = `bold ${isModal ? '12px' : '9.5px'} 'Titillium Web', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // North in F1 Red
      ctx.fillStyle = '#E10600';
      ctx.fillText('N', cx, cy - maxR + (isModal ? 12 : 7));
      
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText('E', cx + maxR - (isModal ? 12 : 7), cy);
      ctx.fillText('S', cx, cy + maxR - (isModal ? 12 : 7));
      ctx.fillText('W', cx - maxR + (isModal ? 12 : 7), cy);

      // Draw Doppler Rain / Cloud Reflectivity Echoes
      blobs.forEach(b => {
        const bx = cx + Math.cos(b.blobAngle) * (maxR * b.distRatio);
        const by = cy + Math.sin(b.blobAngle) * (maxR * b.distRatio);

        // Calculate angular distance to sweep line for radar blip effect
        let angleDiff = Math.abs(angle - b.blobAngle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        const blipFactor = angleDiff < 0.35 ? 1 + (0.35 - angleDiff) * 1.5 : 1;

        const rad = b.radius * (isModal ? 1.6 : 1) * blipFactor;
        const cloudGrad = ctx.createRadialGradient(bx, by, 2, bx, by, rad);

        if (b.intensity > 0.7) {
          // Heavy rain: Red / Amber core
          cloudGrad.addColorStop(0, 'rgba(225, 6, 0, 0.75)');
          cloudGrad.addColorStop(0.5, 'rgba(255, 184, 0, 0.45)');
          cloudGrad.addColorStop(1, 'rgba(255, 184, 0, 0)');
        } else if (b.intensity > 0.4) {
          // Moderate rain: Amber / Green core
          cloudGrad.addColorStop(0, 'rgba(255, 184, 0, 0.65)');
          cloudGrad.addColorStop(0.6, 'rgba(0, 210, 190, 0.35)');
          cloudGrad.addColorStop(1, 'rgba(0, 210, 190, 0)');
        } else {
          // Light drizzle / cloud: Emerald cyan
          cloudGrad.addColorStop(0, 'rgba(0, 245, 212, 0.35)');
          cloudGrad.addColorStop(0.7, 'rgba(0, 210, 190, 0.15)');
          cloudGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');
        }

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      if (blobs.length === 0) {
        ctx.fillStyle = 'rgba(0, 245, 212, 0.4)';
        ctx.font = `600 ${isModal ? '11px' : '8px'} 'Titillium Web', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('0 PRECIPITATION ECHOES · CLEAR SCAN', cx, cy + maxR * 0.42);
      }

      // Rotating Radar Sweep Scanner Beam
      const sweepArc = Math.PI / 4; // 45-degree fading trail
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGrad.addColorStop(0, 'rgba(0, 245, 212, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(0, 245, 212, 0.08)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - sweepArc, angle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sharp Leading Laser Sweep Line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // Wind Vector Arrow (Pointing in the direction the wind is blowing)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(windAngleRad);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -maxR * 0.4);
      ctx.strokeStyle = 'rgba(255, 184, 0, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(0, -maxR * 0.45);
      ctx.lineTo(-4, -maxR * 0.38);
      ctx.lineTo(4, -maxR * 0.38);
      ctx.closePath();
      ctx.fillStyle = '#FFB800';
      ctx.fill();
      ctx.restore();

      // Center Circuit Marker Bullseye
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#E10600';
      ctx.shadowColor = '#E10600';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(225, 6, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const render = () => {
      angle = (angle + 0.028) % (Math.PI * 2);
      drawRadar(canvasRef.current, false);
      if (showExpandedModal) {
        drawRadar(modalCanvasRef.current, true);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [weather, activeLocation, radarRange, showExpandedModal]);

  return (
    <div className="bg-[#0A0E17]/95 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5 relative overflow-hidden group">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[#E10600] font-black text-xs select-none">///</span>
          <span className="font-display font-black text-white text-xs sm:text-sm tracking-wider uppercase">
            CIRCUIT WEATHER RADAR
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-display font-black text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE DOPPLER</span>
          </span>
        </div>

        {/* Range Buttons & Quick Circuit Switcher */}
        <div className="flex items-center gap-1.5 text-xs font-display">
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
            {[25, 50, 100].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRadarRange(r)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  radarRange === r
                    ? 'bg-[#E10600] text-white shadow-sm font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}K
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowExpandedModal(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
            title="Expand Full Radar Screen"
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Circuit Selector Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base select-none shrink-0">{activeLocation.flag}</span>
          <div className="min-w-0">
            <div className="font-display font-black text-white text-xs truncate">
              {activeLocation.name}
            </div>
            <div className="text-[10.5px] font-sans text-slate-400 truncate">
              {activeLocation.locality ? `${activeLocation.locality}, ` : ''}{activeLocation.country}
            </div>
          </div>
        </div>

        {/* Circuit Select Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedCircuitId}
            onChange={(e) => setSelectedCircuitId(e.target.value)}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-[11px] font-display font-bold py-1 pl-2 pr-6 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-red-500 max-w-[140px] truncate"
          >
            <option value="auto">📍 Next GP Track</option>
            {DEFAULT_CALENDAR_CIRCUITS.map(c => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.locality || c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[9px]">
            ▼
          </span>
        </div>
      </div>

      {/* Main Content: Doppler Radar Canvas + Live F1 Telemetry Grid */}
      {loading ? (
        <div className="py-8 text-center space-y-2">
          <span className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-xs font-display text-slate-400">Calibrating circuit Doppler radar…</p>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs font-display text-red-400 space-y-1">
          <div>⚠️ {error}</div>
          <button
            type="button"
            onClick={() => setSelectedCircuitId('auto')}
            className="text-cyan-400 hover:underline text-[11px]"
          >
            Reset to Next Grand Prix
          </button>
        </div>
      ) : weather ? (
        <div className="space-y-3">
          {/* Radar Screen with Overlay */}
          <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-full drop-shadow-[0_0_15px_rgba(0,245,212,0.15)]"
            />

            {/* Radar Overlay Status Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/85 border border-slate-800/80 text-[10px] font-telemetry font-bold text-slate-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>RADAR {radarRange}KM RADIUS</span>
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/85 border border-slate-800/80 text-[10px] font-telemetry font-bold text-[#FFB800] backdrop-blur-md">
              <span>WIND:</span>
              <span>{weather.windCompass} {weather.windSpeed} km/h</span>
            </div>

            {/* Rain Risk Arrival Banner */}
            <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-display">
              <span className="flex items-center gap-1 text-slate-300 font-bold">
                <span>🌧️ RAIN RISK:</span>
                <span className={`font-telemetry font-black ${
                  weather.rainProbability > 60
                    ? 'text-red-400'
                    : weather.rainProbability > 25
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {weather.rainProbability}% ({weather.rain > 0 ? `${weather.rain} mm/h` : 'No Rain Near Track'})
                </span>
              </span>

              <span className="text-[10px] font-telemetry text-slate-500">
                UPDATED {weather.updatedAt}
              </span>
            </div>
          </div>

          {/* Authentic F1 Pit-Wall Meteorological Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-display">
            {/* Air Temp */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>🌡️ AIR TEMP</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-telemetry font-black text-white">
                  {weather.airTemp}°C
                </span>
                <span className="text-[11px] font-telemetry text-slate-400">
                  ({Math.round(weather.airTemp * 1.8 + 32)}°F)
                </span>
              </div>
            </div>

            {/* Track Temp (Distinct Asphalt Surface Measurement) */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-red-950/60 shadow-[0_0_10px_rgba(225,6,0,0.1)] flex flex-col justify-between">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <span>🔥 TRACK TEMP</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-telemetry font-black text-[#FFB800]">
                  {weather.trackTemp}°C
                </span>
                <span className="text-[11px] font-telemetry text-amber-500/70">
                  ({Math.round(weather.trackTemp * 1.8 + 32)}°F)
                </span>
              </div>
            </div>

            {/* Conditions & Track Status */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CONDITIONS
              </span>
              <div className="mt-1 font-bold text-slate-100 text-[12px] truncate">
                {weather.description}
              </div>
            </div>

            {/* Track Status & Grip */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                TRACK STATUS
              </span>
              <div className="mt-1 font-bold text-emerald-300 text-[12px] truncate">
                {weather.trackStatus}
              </div>
            </div>

            {/* Wind Vector & Direction */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider">
                WIND VECTOR
              </span>
              <div className="mt-1 font-telemetry font-black text-[#00F5D4] text-[13px] flex items-center gap-1.5 flex-wrap">
                <span>{weather.windArrow}</span>
                <span>{weather.windSpeed} km/h</span>
                <span className="text-slate-400 text-xs font-normal">({weather.windCompass})</span>
                {weather.windGusts > weather.windSpeed && (
                  <span className="text-amber-400/90 text-[10px] font-mono">G {weather.windGusts}</span>
                )}
              </div>
            </div>

            {/* Humidity & Pressure & Dew Point */}
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                HUMIDITY &amp; BARO
              </span>
              <div className="mt-1 font-telemetry font-bold text-slate-200 text-[12px] flex items-baseline gap-1.5">
                <span>{weather.humidity}% · {weather.pressure} hPa</span>
                {weather.dewPoint !== undefined && (
                  <span className="text-slate-500 text-[10px] font-mono">(Td {weather.dewPoint}°C)</span>
                )}
              </div>
            </div>
          </div>

          {/* Tyre Compound Recommendation Banner */}
          <div className="p-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between text-xs font-display">
            <span className="text-slate-400 font-bold text-[10.5px]">TYRE ADVISORY:</span>
            <span className="font-bold text-white text-[11px]">
              {weather.tyreRecommendation}
            </span>
          </div>
        </div>
      ) : null}

      {/* Expanded Full-Screen Doppler Radar Modal */}
      {showExpandedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#E10600] font-black text-sm select-none">///</span>
                <h3 className="text-lg font-black font-display text-white uppercase tracking-wider">
                  HIGH-DEFINITION DOPPLER WEATHER RADAR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExpandedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 text-slate-400 hover:text-white font-mono flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Canvas */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <canvas
                ref={modalCanvasRef}
                width={400}
                height={400}
                className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full drop-shadow-[0_0_25px_rgba(0,245,212,0.25)]"
              />
            </div>

            {/* Key Live Met Data Summary */}
            {weather && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-display">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 uppercase">Air Temp</span>
                  <span className="text-base font-telemetry font-black text-white">{weather.airTemp}°C</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-red-950/60">
                  <span className="block text-[10px] text-red-400 uppercase">Track Temp</span>
                  <span className="text-base font-telemetry font-black text-[#FFB800]">{weather.trackTemp}°C</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-[#00F5D4] uppercase">Wind Velocity</span>
                  <span className="text-base font-telemetry font-black text-[#00F5D4]">{weather.windSpeed} km/h {weather.windCompass}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-emerald-400 uppercase">Rain Probability</span>
                  <span className="text-base font-telemetry font-black text-emerald-400">{weather.rainProbability}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
