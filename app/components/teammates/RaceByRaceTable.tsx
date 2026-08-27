import React, { useState } from 'react';
import { TeammateComparisonData, RaceRoundResult } from '../../lib/teammateDataService';

interface RaceByRaceTableProps {
  data: TeammateComparisonData;
}

type SortKey = 'round' | 'raceName' | 'qualiA' | 'qualiB' | 'raceA' | 'raceB' | 'pointsA' | 'pointsB';

export const RaceByRaceTable: React.FC<RaceByRaceTableProps> = ({ data }) => {
  const { rounds, driverA, driverB } = data;
  const [sortKey, setSortKey] = useState<SortKey>('round');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!rounds || rounds.length === 0) return null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedRounds = [...rounds].sort((a: any, b: any) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (valA === null || valA === undefined) valA = 999;
    if (valB === null || valB === undefined) valB = 999;

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-3 mb-3 border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            RACE-BY-RACE CLASSIFICATION TABLE
          </h3>
        </div>
        <button className="text-slate-400 hover:text-white font-bold text-xs">
          {isExpanded ? 'COLLAPSE ▲' : 'EXPAND ▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th
                  onClick={() => handleSort('round')}
                  className="py-2.5 px-3 cursor-pointer hover:text-cyan-400"
                >
                  ROUND {sortKey === 'round' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('raceName')}
                  className="py-2.5 px-3 cursor-pointer hover:text-cyan-400"
                >
                  GRAND PRIX {sortKey === 'raceName' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('qualiA')}
                  className="py-2.5 px-3 cursor-pointer text-cyan-400 hover:underline"
                >
                  QUALI {driverA.code} {sortKey === 'qualiA' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('qualiB')}
                  className="py-2.5 px-3 cursor-pointer text-amber-400 hover:underline"
                >
                  QUALI {driverB.code} {sortKey === 'qualiB' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('raceA')}
                  className="py-2.5 px-3 cursor-pointer text-cyan-400 hover:underline"
                >
                  RACE {driverA.code} {sortKey === 'raceA' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('raceB')}
                  className="py-2.5 px-3 cursor-pointer text-amber-400 hover:underline"
                >
                  RACE {driverB.code} {sortKey === 'raceB' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('pointsA')}
                  className="py-2.5 px-3 text-right cursor-pointer text-cyan-400 hover:underline"
                >
                  PTS {driverA.code} {sortKey === 'pointsA' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('pointsB')}
                  className="py-2.5 px-3 text-right cursor-pointer text-amber-400 hover:underline"
                >
                  PTS {driverB.code} {sortKey === 'pointsB' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRounds.map((r) => {
                const isDnfA = r.statusA !== 'Finished' && !r.statusA.includes('+') && !r.statusA.includes('Laps') && r.statusA !== 'N/A';
                const isDnfB = r.statusB !== 'Finished' && !r.statusB.includes('+') && !r.statusB.includes('Laps') && r.statusB !== 'N/A';

                return (
                  <tr
                    key={`trow-${r.round}`}
                    className="border-b border-slate-800/60 hover:bg-[#0D121F] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-400">R{r.round}</td>
                    <td className="py-2.5 px-3 font-black text-white">{r.raceName}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{r.qualiStrA}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">{r.qualiStrB}</td>
                    <td className={`py-2.5 px-3 font-black ${isDnfA ? 'text-red-400' : 'text-cyan-300'}`}>
                      {isDnfA ? 'DNF' : r.raceA ? `P${r.raceA}` : 'N/A'}
                    </td>
                    <td className={`py-2.5 px-3 font-black ${isDnfB ? 'text-red-400' : 'text-amber-300'}`}>
                      {isDnfB ? 'DNF' : r.raceB ? `P${r.raceB}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-400">+{r.pointsA}</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-400">+{r.pointsB}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
