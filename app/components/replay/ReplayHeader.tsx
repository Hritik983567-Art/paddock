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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white uppercase font-display">
              PADDOCK REPLAY
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-md">
              WORKSTATION 2.0
            </span>
          </div>
          <p className="text-xs font-mono text-cyan-400 font-bold">
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
