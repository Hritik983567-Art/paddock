import React from 'react';
import { TeamOption } from '../../lib/teammateDataService';
import { ALL_F1_SEASONS } from '../../utils/api';

interface TeammateHeaderProps {
  season: string;
  onSelectSeason: (s: string) => void;
  teams: TeamOption[];
  selectedTeamId: string;
  onSelectTeam: (tId: string) => void;
  mode: 'current' | 'historical';
  onToggleMode: (m: 'current' | 'historical') => void;
}

export const TeammateHeader: React.FC<TeammateHeaderProps> = ({
  season,
  onSelectSeason,
  teams,
  selectedTeamId,
  onSelectTeam,
  mode,
  onToggleMode
}) => {
  const seasons = ALL_F1_SEASONS;

  return (
    <header 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-4 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600/30 border-2 border-red-500 text-red-400 font-mono font-black text-xs tracking-wider shadow-lg">
            F1
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1">
                <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                  HEAD-TO-HEAD BATTLE
                </span>
              </span>
              <span className="text-slate-700 font-sans text-xs">•</span>
              <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                TEAMMATE TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
              PADDOCK TEAMMATES
            </h1>
            <p className="text-xs font-sans text-slate-400 mt-0.5 leading-relaxed">
              F1 teammate head-to-head analysis, qualifying deltas &amp; race pace workstation
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0D121F] p-1 border-2 border-slate-700 rounded-lg">
          <button
            onClick={() => onToggleMode('current')}
            className={`px-3 py-1 text-xs font-black rounded transition-all ${
              mode === 'current'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            CURRENT SEASON ⚡
          </button>
          <button
            onClick={() => onToggleMode('historical')}
            className={`px-3 py-1 text-xs font-black rounded transition-all ${
              mode === 'historical'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            HISTORICAL MODE 📜
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Season Selector */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
            SEASON
          </label>
          <select
            value={season}
            onChange={(e) => onSelectSeason(e.target.value)}
            className="px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-bold text-xs rounded-lg focus:outline-none focus:border-cyan-500"
          >
            {seasons.map(s => (
              <option key={s} value={s}>{s} Season</option>
            ))}
          </select>
        </div>

        {/* Team Selector */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
            CONSTRUCTOR TEAM
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => onSelectTeam(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-bold text-xs rounded-lg focus:outline-none focus:border-cyan-500"
          >
            {teams.map(t => (
              <option key={t.constructorId} value={t.constructorId}>
                {t.constructorName} ({t.drivers.map(d => d.code).join(' vs ')})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
