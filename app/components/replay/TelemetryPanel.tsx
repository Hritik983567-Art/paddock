import React, { useState, useEffect } from 'react';
import { DriverMeta } from '../../lib/replayDataService';

interface TelemetryPanelProps {
  driverId: string | null;
  driverIds?: string[];
  driverMeta: Record<string, DriverMeta>;
  onSelectDriver?: (id: string) => void;
  currentLap?: number;
  totalLaps?: number;
  position: number | null;
  lapTime: number | null;
  gap: string;
  isPlaying?: boolean;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  driverId,
  driverIds,
  driverMeta,
  onSelectDriver,
  currentLap = 1,
  totalLaps = 72,
  position,
  lapTime,
  gap,
  isPlaying = false
}) => {
  const meta = driverId ? driverMeta[driverId] : null;

  // Track micro-simulation tick for dynamic throttle, brake, gear animation during replay
  const [telemetryTick, setTelemetryTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTelemetryTick(prev => (prev + 1) % 100);
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Clean gap formatting to eliminate duplicate "+-" signs
  const cleanGap = React.useMemo(() => {
    if (!gap || gap === 'N/A' || gap === 'LEADER' || gap === 'OUT') return gap || 'N/A';
    const cleaned = gap.replace(/\+\+/g, '+').replace(/\+-/g, '-');
    return cleaned;
  }, [gap]);

  // Deterministic realistic telemetry profile along lap track sectors
  const telemetry = React.useMemo(() => {
    if (!position) {
      return {
        speed: 0,
        throttle: 0,
        brake: 0,
        gear: 'N',
        rpm: 0,
        drs: 'CLOSED',
        sector: 'SEC 1',
        sectorColor: '#00FFE0'
      };
    }

    // Phase progression along lap (0.00 to 1.00) combining driver offset, current lap and micro-tick
    const driverOffset = (position * 13) % 100;
    const lapOffset = ((currentLap * 19) + telemetryTick * 3) % 100;
    const phase = ((driverOffset + lapOffset) % 100) / 100;

    let speed = 310;
    let throttle = 100;
    let brake = 0;
    let gear = '8th';
    let rpm = 11800;
    let drs = 'CLOSED';
    let sector = 'SEC 1';
    let sectorColor = '#00FFE0';

    if (phase < 0.25) {
      // Main Straight (High Speed & Acceleration)
      sector = 'SEC 1';
      sectorColor = '#00FFE0';
      speed = Math.floor(290 + (phase / 0.25) * 45); // 290 - 335 km/h
      throttle = 100;
      brake = 0;
      gear = speed > 315 ? '8th' : '7th';
      rpm = 11500 + Math.floor((speed - 290) * 20);
      drs = cleanGap !== 'LEADER' && cleanGap.includes('+') && parseFloat(cleanGap.replace(/[^\d.]/g, '')) <= 1.2
        ? 'DRS ACTIVE'
        : 'DRS AVAILABLE';
    } else if (phase < 0.35) {
      // Turn 1 & 2 Heavy Braking Zone
      sector = 'SEC 1';
      sectorColor = '#00FFE0';
      const brakeProgress = (phase - 0.25) / 0.10;
      speed = Math.floor(335 - brakeProgress * 230); // 335 down to 105 km/h
      throttle = 0;
      brake = Math.floor(100 - brakeProgress * 30); // 100% trail to 70%
      gear = speed < 115 ? '2nd' : (speed < 160 ? '3rd' : '4th');
      rpm = 10200 + Math.floor((speed % 30) * 40);
      drs = 'CLOSED';
    } else if (phase < 0.55) {
      // Sector 2 Sweepers & Acceleration Zone
      sector = 'SEC 2';
      sectorColor = '#FFB800';
      const accelProgress = (phase - 0.35) / 0.20;
      speed = Math.floor(115 + accelProgress * 145); // 115 up to 260 km/h
      throttle = Math.floor(60 + accelProgress * 40); // 60% up to 100%
      brake = 0;
      gear = speed < 140 ? '3rd' : (speed < 185 ? '4th' : (speed < 230 ? '5th' : '6th'));
      rpm = 10800 + Math.floor(accelProgress * 1200);
      drs = 'CLOSED';
    } else if (phase < 0.70) {
      // Sector 2 Technical Chicane & Infield Braking
      sector = 'SEC 2';
      sectorColor = '#FFB800';
      const chicaneProgress = (phase - 0.55) / 0.15;
      speed = Math.floor(260 - chicaneProgress * 135); // 260 down to 125 km/h
      throttle = chicaneProgress > 0.5 ? 45 : 0;
      brake = chicaneProgress < 0.5 ? 85 : 0;
      gear = speed < 135 ? '3rd' : '4th';
      rpm = 10400 + Math.floor((speed % 25) * 50);
      drs = 'CLOSED';
    } else if (phase < 0.88) {
      // Sector 3 Hairpin & High-G Banking Run
      sector = 'SEC 3';
      sectorColor = '#C840FF';
      const hairpinProgress = (phase - 0.70) / 0.18;
      speed = Math.floor(125 + hairpinProgress * 160); // 125 up to 285 km/h
      throttle = Math.floor(75 + hairpinProgress * 25);
      brake = 0;
      gear = speed < 165 ? '4th' : (speed < 225 ? '5th' : (speed < 275 ? '6th' : '7th'));
      rpm = 11100 + Math.floor(hairpinProgress * 900);
      drs = 'DRS STANDBY';
    } else {
      // Final Straight Run to Finish Line
      sector = 'SEC 3';
      sectorColor = '#C840FF';
      const finalProgress = (phase - 0.88) / 0.12;
      speed = Math.floor(285 + finalProgress * 40); // 285 up to 325 km/h
      throttle = 100;
      brake = 0;
      gear = speed > 310 ? '8th' : '7th';
      rpm = 11600 + Math.floor(finalProgress * 600);
      drs = cleanGap !== 'LEADER' && cleanGap.includes('+') && parseFloat(cleanGap.replace(/[^\d.]/g, '')) <= 1.2
        ? 'DRS ACTIVE'
        : 'DRS AVAILABLE';
    }

    return {
      speed,
      throttle,
      brake,
      gear,
      rpm,
      drs,
      sector,
      sectorColor
    };
  }, [position, currentLap, telemetryTick, cleanGap]);

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      {/* Header Row with Title & Interactive Driver Selector */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📡</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            DRIVER LIVE TELEMETRY
          </h3>
          <span 
            className="text-[9px] font-black px-2 py-0.5 rounded border"
            style={{ 
              color: telemetry.sectorColor, 
              borderColor: `${telemetry.sectorColor}50`, 
              background: `${telemetry.sectorColor}15` 
            }}
          >
            {telemetry.sector}
          </span>
        </div>

        {/* Interactive Driver Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">SELECT:</span>
          {driverIds && driverIds.length > 0 ? (
            <select
              value={driverId || ''}
              onChange={(e) => onSelectDriver?.(e.target.value)}
              aria-label="Select Driver for Live Telemetry"
              className="bg-[#0D121F] border border-cyan-500/60 text-cyan-300 font-mono text-[11px] font-bold rounded px-2.5 py-1 outline-none cursor-pointer hover:border-cyan-400 transition-colors shadow-sm"
            >
              {driverIds.map(dId => {
                const dMeta = driverMeta[dId];
                return (
                  <option key={dId} value={dId} className="bg-[#070A10] text-white">
                    {dMeta?.code || dId} — {dMeta?.name || dId} ({dMeta?.team || ''})
                  </option>
                );
              })}
            </select>
          ) : (
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
              {meta ? `DRIVER: ${meta.code}` : 'NO DRIVER SELECTED'}
            </span>
          )}
        </div>
      </div>

      {meta ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. SPEED GAUGE */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">SPEED</span>
                <span className="text-[9px] text-slate-500">KM/H</span>
              </div>
              <span className="text-xl font-black text-white">{telemetry.speed} <small className="text-xs text-slate-400 font-normal">km/h</small></span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-200" 
                style={{ width: `${Math.min(100, (telemetry.speed / 350) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. THROTTLE GAUGE (Interactive Live Bar) */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">THROTTLE</span>
                <span className="text-[10px] font-black text-emerald-300">{telemetry.throttle}%</span>
              </div>
              <span className="text-xl font-black text-emerald-400">{telemetry.throttle}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 mt-2 overflow-hidden border border-emerald-950">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-[0_0_8px_#10B981]" 
                style={{ width: `${telemetry.throttle}%` }}
              />
            </div>
          </div>

          {/* 3. BRAKE GAUGE (Interactive Live Bar) */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-red-400 uppercase">BRAKE</span>
                <span className="text-[10px] font-black text-red-300">{telemetry.brake}%</span>
              </div>
              <span className={`text-xl font-black ${telemetry.brake > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                {telemetry.brake}%
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 mt-2 overflow-hidden border border-red-950">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-150 shadow-[0_0_8px_#EF4444]" 
                style={{ width: `${telemetry.brake}%` }}
              />
            </div>
          </div>

          {/* 4. GEAR (With F1 Steering Wheel Shift LEDs) */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">GEAR</span>
                {/* F1 LED Shift Lights Bar */}
                <div className="flex gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.rpm > 11000 ? 'bg-red-500' : 'bg-slate-700'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.rpm > 11400 ? 'bg-red-500' : 'bg-slate-700'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.rpm > 11800 ? 'bg-amber-400' : 'bg-slate-700'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.rpm > 12200 ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.rpm > 12500 ? 'bg-purple-500 animate-pulse' : 'bg-slate-700'}`}></span>
                </div>
              </div>
              <span className="text-xl font-black text-white">{telemetry.gear} <small className="text-xs text-slate-400 font-normal">Gear</small></span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-1">
              STATUS: <span className="text-cyan-300">ENGAGED</span>
            </div>
          </div>

          {/* 5. ENGINE RPM */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">ENGINE RPM</span>
              <span className="text-xl font-black text-white">{telemetry.rpm.toLocaleString()} <small className="text-xs text-slate-400 font-normal">RPM</small></span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-amber-400 to-red-500 h-full rounded-full transition-all duration-200" 
                style={{ width: `${Math.min(100, (telemetry.rpm / 13000) * 100)}%` }}
              />
            </div>
          </div>

          {/* 6. DRS STATUS */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">DRS STATUS</span>
              <span className={`text-lg font-black ${
                telemetry.drs === 'DRS ACTIVE' 
                  ? 'text-emerald-400 animate-pulse' 
                  : telemetry.drs === 'DRS AVAILABLE' 
                  ? 'text-cyan-400' 
                  : 'text-slate-500'
              }`}>
                {telemetry.drs}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 font-bold mt-1">
              {telemetry.drs === 'DRS ACTIVE' ? 'WING FLAP DEPLOYED' : 'AERO RETRACTED'}
            </div>
          </div>

          {/* 7. LAST LAP TIME */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">LAST LAP TIME</span>
              <span className="text-xl font-black text-cyan-300">{lapTime ? `${lapTime.toFixed(3)}s` : 'N/A'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-1">
              LAP: <span className="text-white font-bold">{currentLap}/{totalLaps}</span>
            </div>
          </div>

          {/* 8. GAP TO LEADER */}
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">GAP TO LEADER</span>
              <span className={`text-xl font-black ${cleanGap === 'LEADER' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {cleanGap}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-1">
              POSITION: <span className="text-white font-bold">P{position || '—'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 text-xs font-mono">
          Click on any driver marker on the track or leaderboard to view live telemetry.
        </div>
      )}
    </div>
  );
};

