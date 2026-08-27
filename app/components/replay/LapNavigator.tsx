import React, { useState, useEffect } from 'react';

interface LapNavigatorProps {
  currentLap: number;
  totalLaps: number;
  onSelectLap: (lap: number) => void;
  onPrevLap: () => void;
  onNextLap: () => void;
}

export const LapNavigator: React.FC<LapNavigatorProps> = ({
  currentLap,
  totalLaps,
  onSelectLap,
  onPrevLap,
  onNextLap
}) => {
  const [inputVal, setInputVal] = useState(String(currentLap));

  useEffect(() => {
    setInputVal(String(currentLap));
  }, [currentLap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputVal, 10);
    if (!isNaN(num) && num >= 1 && num <= totalLaps) {
      onSelectLap(num);
    } else {
      setInputVal(String(currentLap));
    }
  };

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="flex items-center gap-2 border-2 border-slate-700/80 p-2 rounded-xl shadow-2xl font-mono relative z-10"
    >
      <button
        onClick={onPrevLap}
        disabled={currentLap <= 1}
        className="px-3 py-1 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold text-xs disabled:opacity-40"
      >
        ⏮ PREV LAP
      </button>

      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <span className="text-xs text-slate-400 font-bold uppercase">LAP</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleSubmit}
          className="w-12 text-center bg-[#0D121F] border border-slate-700 font-black text-cyan-400 text-sm rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500"
        />
        <span className="text-xs text-slate-400 font-bold">/ {totalLaps}</span>
      </form>

      <button
        onClick={onNextLap}
        disabled={currentLap >= totalLaps}
        className="px-3 py-1 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold text-xs disabled:opacity-40"
      >
        NEXT LAP ⏭
      </button>
    </div>
  );
};
