'use client';

import React from 'react';
import { GrandPrixSummary, RoundItem, DriverResultItem } from '../types';
import { getTeamColor } from '../../utils/api';

interface GrandPrixSummaryBarProps {
  summary: GrandPrixSummary | null;
  rounds: RoundItem[];
  selectedRound: string;
  onSelectRound: (round: string) => void;
  isLoadingRounds: boolean;
  drivers: DriverResultItem[];
  driverA: string;
  onSelectDriverA: (id: string) => void;
  driverB: string;
  onSelectDriverB: (id: string) => void;
  showDriverSelectors?: boolean;
}

export const GrandPrixSummaryBar: React.FC<GrandPrixSummaryBarProps> = ({
  summary,
  rounds,
  selectedRound,
  onSelectRound,
  isLoadingRounds,
  drivers,
  driverA,
  onSelectDriverA,
  driverB,
  onSelectDriverB,
  showDriverSelectors = true
}) => {
  const driverAObj = drivers.find((d) => d.driverId === driverA);
  const driverBObj = drivers.find((d) => d.driverId === driverB);
  const driverAColor = driverAObj?.constructorId ? getTeamColor(driverAObj.constructorId) : '#00F0FF';
  const driverBColor = driverBObj?.constructorId ? getTeamColor(driverBObj.constructorId) : '#FF2A55';

  return (
    <div className="mb-5 rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md shadow-xl overflow-hidden">
      {/* Session Controls & Head-to-Head Driver Comparator */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-800/60 bg-zinc-900/40">
        {/* Left: Round & Circuit Context */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/60">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-red-500">
              ROUND
            </span>
            {isLoadingRounds ? (
              <span className="animate-pulse font-mono text-xs text-cyan-400">Loading...</span>
            ) : (
              <select
                value={selectedRound}
                onChange={(e) => onSelectRound(e.target.value)}
                aria-label="Select Grand Prix Round"
                className="cursor-pointer bg-transparent font-mono text-xs font-bold text-zinc-100 focus:outline-none"
              >
                {rounds.map((r) => (
                  <option key={r.round} value={r.round} className="bg-zinc-900 text-zinc-100">
                    R{r.round} • {r.raceName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {summary && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-sans">
              <span className="text-zinc-600">/</span>
              <span className="truncate max-w-[260px] sm:max-w-none text-zinc-300">
                📍 {summary.circuitName} {summary.country ? `(${summary.country})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Right: Driver 1 vs Driver 2 Comparator */}
        {showDriverSelectors && drivers.length > 0 && (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-zinc-900/80 transition-colors"
              style={{ borderColor: `${driverAColor}70` }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: driverAColor }}
              />
              <span className="font-mono text-[10px] font-black tracking-wider text-zinc-400">
                D1:
              </span>
              <select
                value={driverA}
                onChange={(e) => onSelectDriverA(e.target.value)}
                aria-label="Select Driver 1"
                className="cursor-pointer bg-transparent font-mono text-xs font-bold text-zinc-100 focus:outline-none"
              >
                {drivers.map((d) => (
                  <option key={`da-${d.driverId}`} value={d.driverId} className="bg-zinc-900 text-zinc-100">
                    {d.code} ({d.constructorName})
                  </option>
                ))}
              </select>
            </div>

            <span className="font-mono text-[11px] font-black text-zinc-400 px-1">VS</span>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-zinc-900/80 transition-colors"
              style={{ borderColor: `${driverBColor}70` }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: driverBColor }}
              />
              <span className="font-mono text-[10px] font-black tracking-wider text-zinc-400">
                D2:
              </span>
              <select
                value={driverB}
                onChange={(e) => onSelectDriverB(e.target.value)}
                aria-label="Select Driver 2"
                className="cursor-pointer bg-transparent font-mono text-xs font-bold text-zinc-100 focus:outline-none"
              >
                {drivers.map((d) => (
                  <option key={`db-${d.driverId}`} value={d.driverId} className="bg-zinc-900 text-zinc-100">
                    {d.code} ({d.constructorName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* High-Signal Telemetry Strip */}
      {summary && (
        <div className="grid grid-cols-2 divide-x divide-zinc-800/60 sm:grid-cols-4 px-2 py-2 sm:px-4 bg-zinc-950/60 text-xs">
          {/* Winner */}
          <div className="px-3 py-1 flex flex-col justify-center">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              WINNER
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 truncate">
              <span className="font-sans font-bold text-zinc-100 text-xs sm:text-sm truncate">
                {summary.winner ? summary.winner.name : '—'}
              </span>
              {summary.winner && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                  P1
                </span>
              )}
            </div>
          </div>

          {/* Completed Laps */}
          <div className="px-3 py-1 flex flex-col justify-center">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              RACE DISTANCE
            </span>
            <div className="mt-0.5 font-mono font-bold text-zinc-100 text-xs sm:text-sm">
              {summary.totalRaceLaps} <span className="text-zinc-400 font-normal text-[11px]">Laps</span>
            </div>
          </div>

          {/* Pole Position */}
          <div className="px-3 py-1 flex flex-col justify-center">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              POLE POSITION
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 truncate">
              <span className="font-sans font-bold text-zinc-100 text-xs sm:text-sm truncate">
                {summary.polePosition ? summary.polePosition.driverName : 'Grid P1'}
              </span>
              {summary.polePosition?.time && (
                <span className="font-mono text-[11px] text-cyan-400 shrink-0">
                  {summary.polePosition.time}
                </span>
              )}
            </div>
          </div>

          {/* Fastest Lap */}
          <div className="px-3 py-1 flex flex-col justify-center">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              FASTEST LAP
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 truncate">
              <span className="font-mono font-bold text-purple-400 text-xs sm:text-sm shrink-0">
                {summary.fastestLap ? summary.fastestLap.time : '—'}
              </span>
              {summary.fastestLap?.code && (
                <span className="text-[10px] font-mono text-zinc-300">
                  ({summary.fastestLap.code})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
