'use client';

import React from 'react';
import { ToolId, LAB_TOOLS, RoundItem, DriverResultItem } from '../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface LabHeaderProps {
  activeTool: ToolId;
  onSelectTool: (id: ToolId) => void;
  rounds: RoundItem[];
  selectedRound: string;
  onSelectRound: (round: string) => void;
  drivers: DriverResultItem[];
  driverA: string;
  onSelectDriverA: (id: string) => void;
  driverB: string;
  onSelectDriverB: (id: string) => void;
  isLoadingRounds: boolean;
}

export const LabHeader: React.FC<LabHeaderProps> = ({
  activeTool,
  onSelectTool,
  rounds,
  selectedRound,
  onSelectRound,
  drivers,
  driverA,
  onSelectDriverA,
  driverB,
  onSelectDriverB,
  isLoadingRounds,
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Tool Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LAB_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                isActive
                  ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-950/30'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <Badge variant={isActive ? 'red' : 'zinc'} size="sm">
                  {tool.badge}
                </Badge>
              </div>
              <h3 className="text-sm font-bold font-mono text-zinc-100 mb-1">{tool.name}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{tool.shortDesc}</p>
            </div>
          );
        })}
      </div>

      {/* Control Bar for Session / Round / Drivers */}
      <Card variant="glass" padding="md" className="flex flex-wrap items-center justify-between gap-4">
        {/* Round Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">Grand Prix Round:</span>
          {isLoadingRounds ? (
            <span className="text-xs text-zinc-500 font-mono animate-pulse">Loading season rounds...</span>
          ) : (
            <select
              value={selectedRound}
              onChange={(e) => onSelectRound(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-red-500"
            >
              {rounds.map((r) => (
                <option key={r.round} value={r.round}>
                  R{r.round} — {r.raceName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Driver Selectors for Comparison Tools */}
        {(activeTool === 'pace' || activeTool === 'telemetry') && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Driver 1:</span>
              <select
                value={driverA}
                onChange={(e) => onSelectDriverA(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-red-400 font-mono font-bold focus:outline-none focus:border-red-500"
              >
                {drivers.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.code || d.familyName} ({d.constructorName})
                  </option>
                ))}
              </select>
            </div>

            {activeTool === 'pace' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">vs Driver 2:</span>
                <select
                  value={driverB}
                  onChange={(e) => onSelectDriverB(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                >
                  {drivers.map((d) => (
                    <option key={d.driverId} value={d.driverId}>
                      {d.code || d.familyName} ({d.constructorName})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
