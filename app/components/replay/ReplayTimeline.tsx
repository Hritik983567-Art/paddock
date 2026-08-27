import React from 'react';
import { RaceEvent } from '../../lib/replayDataService';

interface ReplayTimelineProps {
  currentLap: number;
  totalLaps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSelectSpeed: (speedMs: number) => void;
  onStepBack10s: () => void;
  onStepFwd10s: () => void;
  onStepPrevLap: () => void;
  onStepNextLap: () => void;
  onReset: () => void;
  onScrubLap: (lap: number) => void;
  events: RaceEvent[];
  onSelectEvent: (ev: RaceEvent) => void;
}

export const ReplayTimeline: React.FC<ReplayTimelineProps> = ({
  currentLap,
  totalLaps,
  isPlaying,
  onTogglePlay,
  speed,
  onSelectSpeed,
  onStepBack10s,
  onStepFwd10s,
  onStepPrevLap,
  onStepNextLap,
  onReset,
  onScrubLap,
  events,
  onSelectEvent
}) => {
  // Format current time vs total session time display
  const currentMinutes = Math.floor((currentLap / Math.max(totalLaps, 1)) * 95);
  const currentSeconds = Math.floor(((currentLap / Math.max(totalLaps, 1)) * 95 * 60) % 60);
  const formattedCurrent = `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
  const formattedTotal = `01:35:00`;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-4 border-2 border-slate-700/80 rounded-xl my-4 shadow-2xl relative z-10"
    >
      {/* Primary Timeline Scrubber Bar with Event Markers */}
      <div className="relative mb-3">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1 font-bold">
          <span>START &bull; LAP 1</span>
          <span className="text-cyan-400">{formattedCurrent} / {formattedTotal}</span>
          <span>FINISH &bull; LAP {totalLaps}</span>
        </div>

        {/* Timeline Slider input */}
        <input
          type="range"
          min="1"
          max={totalLaps}
          value={currentLap}
          onChange={(e) => onScrubLap(parseInt(e.target.value))}
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-inner"
        />

        {/* Timeline Flag / Event Overlay Markers */}
        <div className="relative h-6 mt-1 pointer-events-none">
          {events.map((ev) => {
            const pct = (ev.lap / Math.max(totalLaps, 1)) * 100;
            let icon = '🟡';
            if (ev.type === 'red_flag') icon = '🔴';
            if (ev.type === 'green_flag') icon = '🟢';
            if (ev.type === 'pit_stop') icon = '🔧';
            if (ev.type === 'overtake') icon = '🏎️';
            if (ev.type === 'finish') icon = '🏁';
            if (ev.type === 'safety_car') icon = '🚗';

            return (
              <button
                key={ev.id}
                style={{ left: `${pct}%` }}
                onClick={() => onSelectEvent(ev)}
                className="absolute top-0 -translate-x-1/2 pointer-events-auto hover:scale-125 transition-transform"
                title={`Lap ${ev.lap}: ${ev.title}`}
              >
                <span className="text-xs">{icon}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Buttons & Playback Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs font-bold transition-colors"
            title="Reset to Start (|◀)"
          >
            |◀
          </button>
          <button
            onClick={onStepPrevLap}
            disabled={currentLap <= 1}
            className="px-2.5 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs font-bold transition-colors disabled:opacity-40"
            title="Previous Lap (Shift + Left)"
          >
            ◀ LAP
          </button>
          <button
            onClick={onStepBack10s}
            className="px-2.5 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs font-bold transition-colors"
            title="Back 10 Sec (Left Arrow)"
          >
            -10s
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`px-5 py-1.5 text-xs font-mono font-black rounded-lg uppercase tracking-wider shadow-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>

          <button
            onClick={onStepFwd10s}
            className="px-2.5 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs font-bold transition-colors"
            title="Forward 10 Sec (Right Arrow)"
          >
            +10s
          </button>
          <button
            onClick={onStepNextLap}
            disabled={currentLap >= totalLaps}
            className="px-2.5 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-xs font-bold transition-colors disabled:opacity-40"
            title="Next Lap (Shift + Right)"
          >
            LAP ▶
          </button>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center gap-1 bg-[#0D121F] p-1 border border-slate-700/80 rounded-lg">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 uppercase">SPEED:</span>
          {[
            { label: '0.25x', speedMs: 3200 },
            { label: '0.5x', speedMs: 1600 },
            { label: '1x', speedMs: 800 },
            { label: '2x', speedMs: 400 },
            { label: '4x', speedMs: 200 }
          ].map(s => (
            <button
              key={s.label}
              onClick={() => onSelectSpeed(s.speedMs)}
              className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded transition-all ${
                speed === s.speedMs
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
