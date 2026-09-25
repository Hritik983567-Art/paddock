import React from 'react';

interface ReplayHeaderProps {
  season: string;
  raceName: string;
  circuitName: string;
  sessionType: string;
  isPlaying: boolean;
  onOpenShortcuts: () => void;
}

export const ReplayHeader: React.FC<ReplayHeaderProps> = ({
  season,
  raceName,
  circuitName,
  sessionType,
  isPlaying,
  onOpenShortcuts
}) => {
  return (
    <header 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="flex flex-wrap items-center justify-between gap-4 p-4 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600/30 border-2 border-red-500 text-red-400 font-mono font-black text-xs tracking-wider shadow-lg">
          F1
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
              <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                TELEMETRY REPLAY
              </span>
            </span>
            <span className="text-slate-700 font-sans text-xs">•</span>
            <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
              HISTORIC TIMING STREAM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
            PADDOCK REPLAY
          </h1>
          <p className="text-xs font-mono text-cyan-400 font-bold mt-0.5">
            {season} {raceName || 'Formula 1 Grand Prix'} &bull; <span className="text-white font-extrabold">{circuitName || 'Grand Prix Circuit'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div 
          style={{ backgroundColor: '#0D121F' }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-700/80 text-xs font-mono shadow-md"
        >
          <span className="text-cyan-400 font-black uppercase">SESSION:</span>
          <span className="font-black text-amber-400 uppercase">{sessionType}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
          <span className="text-[11px] text-emerald-400 font-black uppercase">
            {isPlaying ? 'PLAYING' : 'REPLAY MODE'}
          </span>
        </div>

        <button
          onClick={onOpenShortcuts}
          style={{ backgroundColor: '#0D121F' }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-black text-white hover:text-cyan-300 border-2 border-slate-700 hover:border-cyan-500 rounded-lg transition-all shadow-md"
          title="View Keyboard Shortcuts (?)"
        >
          <span>⌨️</span>
          <span>KEYBOARD</span>
        </button>
      </div>
    </header>
  );
};
