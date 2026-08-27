import React from 'react';

interface RoundItem {
  round: string;
  raceName: string;
  circuitId: string;
  date: string;
  hasSprint?: boolean;
}

interface RaceSelectorProps {
  seasons: string[];
  selectedSeason: string;
  onSelectSeason: (s: string) => void;
  rounds: RoundItem[];
  selectedRound: string;
  onSelectRound: (r: string) => void;
  sessionType: 'race' | 'quali' | 'sprint_quali' | 'sprint';
  onSelectSessionType: (s: 'race' | 'quali' | 'sprint_quali' | 'sprint') => void;
  onLoadSession: () => void;
  loadingRounds: boolean;
  loadingSession: boolean;
  sessionError: string;
}

export const RaceSelector: React.FC<RaceSelectorProps> = ({
  seasons,
  selectedSeason,
  onSelectSeason,
  rounds,
  selectedRound,
  onSelectRound,
  sessionType,
  onSelectSessionType,
  onLoadSession,
  loadingRounds,
  loadingSession,
  sessionError
}) => {
  const currentRoundObj = rounds.find(r => r.round === selectedRound);
  const hasSprint = Boolean(currentRoundObj?.hasSprint);

  const availableSessions: ('sprint_quali' | 'sprint' | 'quali' | 'race')[] = hasSprint
    ? ['sprint_quali', 'sprint', 'quali', 'race']
    : ['quali', 'race'];

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-4 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10"
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Season Selector */}
        <div className="flex flex-col">
          <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            SEASON
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(e.target.value)}
            className="px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-mono text-xs rounded-lg focus:outline-none focus:border-cyan-500"
          >
            {seasons.map(s => (
              <option key={s} value={s}>{s} Season</option>
            ))}
          </select>
        </div>

        {/* Grand Prix Round Selector */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            GRAND PRIX ROUND
          </label>
          <select
            value={selectedRound}
            onChange={(e) => onSelectRound(e.target.value)}
            disabled={loadingRounds || rounds.length === 0}
            className="w-full px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-mono text-xs rounded-lg focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          >
            {loadingRounds ? (
              <option value="">Loading Grand Prix Schedule...</option>
            ) : rounds.length === 0 ? (
              <option value="">No rounds available</option>
            ) : (
              rounds.map(r => (
                <option key={r.round} value={r.round}>
                  R{r.round} — {r.raceName} ({r.date}) {r.hasSprint ? '🏎️ [SPRINT WEEKEND]' : ''}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Session Type Toggles */}
        <div className="flex flex-col">
          <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            SESSION {hasSprint ? <span className="text-amber-400 font-black ml-1">(SPRINT WEEKEND)</span> : ''}
          </label>
          <div 
            style={{ backgroundColor: '#0D121F' }}
            className="flex flex-wrap items-center p-1 border-2 border-slate-700 rounded-lg gap-1 shadow-inner"
          >
            {availableSessions.map(s => {
              const labelMap = {
                race: 'RACE 🏁',
                quali: 'QUALIFYING ⏱️',
                sprint_quali: 'SPRINT QUALI ⏱️',
                sprint: 'SPRINT RACE 🏎️'
              };
              const tooltipMap = {
                race: 'Full lap-by-lap race replay & timing.',
                quali: 'Q1, Q2, Q3 timed lap replay.',
                sprint_quali: 'Sprint shootout / Sprint qualifying replay.',
                sprint: 'Sprint race replay.'
              };
              const isActive = sessionType === s;
              return (
                <button
                  key={s}
                  onClick={() => onSelectSessionType(s)}
                  title={tooltipMap[s]}
                  className={`px-3 py-1 text-[11px] font-mono font-black rounded transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {labelMap[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Load Replay Button */}
        <div className="flex flex-col self-end">
          <button
            onClick={onLoadSession}
            disabled={loadingSession || !selectedRound}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono font-black text-xs uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loadingSession ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>LOADING...</span>
              </>
            ) : (
              <>
                <span>LOAD REPLAY</span>
                <span>▶</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Session Error / Data Unavailable Message */}
      {sessionError && (
        <div className="mt-3 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-300 font-mono text-xs flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span>{sessionError}</span>
        </div>
      )}
    </div>
  );
};
