import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface H2HScorecardProps {
  data: TeammateComparisonData;
}

export const H2HScorecard: React.FC<H2HScorecardProps> = ({ data }) => {
  const { scorecard, driverA, driverB } = data;

  const rows = [
    { label: 'CHAMPIONSHIP POSITION', valA: `P${scorecard.posA || 'N/A'}`, valB: `P${scorecard.posB || 'N/A'}`, better: scorecard.posA < scorecard.posB ? 'A' : scorecard.posB < scorecard.posA ? 'B' : 'equal' },
    { label: 'CHAMPIONSHIP POINTS', valA: scorecard.pointsA, valB: scorecard.pointsB, better: scorecard.pointsA > scorecard.pointsB ? 'A' : scorecard.pointsB > scorecard.pointsA ? 'B' : 'equal' },
    { label: 'GRAND PRIX WINS', valA: scorecard.winsA, valB: scorecard.winsB, better: scorecard.winsA > scorecard.winsB ? 'A' : scorecard.winsB > scorecard.winsA ? 'B' : 'equal' },
    { label: 'PODIUM FINISHES', valA: scorecard.podiumsA, valB: scorecard.podiumsB, better: scorecard.podiumsA > scorecard.podiumsB ? 'A' : scorecard.podiumsB > scorecard.podiumsA ? 'B' : 'equal' },
    { label: 'POLE POSITIONS', valA: scorecard.polesA, valB: scorecard.polesB, better: scorecard.polesA > scorecard.polesB ? 'A' : scorecard.polesB > scorecard.polesA ? 'B' : 'equal' },
    { label: 'FASTEST LAPS', valA: scorecard.fastestLapsA, valB: scorecard.fastestLapsB, better: scorecard.fastestLapsA > scorecard.fastestLapsB ? 'A' : scorecard.fastestLapsB > scorecard.fastestLapsA ? 'B' : 'equal' },
    { label: 'RELIABILITY & DNFs', valA: `${scorecard.dnfsA} DNFs`, valB: `${scorecard.dnfsB} DNFs`, better: scorecard.dnfsA < scorecard.dnfsB ? 'A' : scorecard.dnfsB < scorecard.dnfsA ? 'B' : 'equal' },
  ];

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            HEAD-TO-HEAD SCORECARD
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
          SEASON TOTALS
        </span>
      </div>

      {/* Header Bar */}
      <div className="grid grid-cols-3 p-3 bg-[#0D121F] rounded-lg font-black text-xs border-2 border-slate-700 mb-2">
        <div className="text-left text-cyan-400">
          {driverA.code} ({driverA.givenName})
        </div>
        <div className="text-center text-slate-400 uppercase">
          METRIC
        </div>
        <div className="text-right text-amber-400">
          {driverB.code} ({driverB.givenName})
        </div>
      </div>

      {/* Scorecard Rows */}
      <div className="space-y-1.5 text-xs">
        {rows.map((r, idx) => {
          const isWinnerA = r.better === 'A';
          const isWinnerB = r.better === 'B';

          return (
            <div
              key={`sc-${idx}`}
              className="grid grid-cols-3 p-3 bg-[#050810] rounded-lg border border-slate-800/80 items-center transition-colors hover:border-slate-700"
            >
              <div className="text-left font-black">
                <span className={isWinnerA ? 'text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-700' : 'text-white'}>
                  {r.valA} {isWinnerA ? '👑' : ''}
                </span>
              </div>
              <div className="text-center font-bold text-slate-300 text-[11px] uppercase">
                {r.label}
              </div>
              <div className="text-right font-black">
                <span className={isWinnerB ? 'text-amber-300 bg-amber-950/80 px-2 py-1 rounded border border-amber-700' : 'text-white'}>
                  {isWinnerB ? '👑 ' : ''}{r.valB}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
