'use client';

import React from 'react';
import { QuestionId, QUESTION_WORKSPACES } from '../types';

interface LabHeaderProps {
  activeQuestion: QuestionId;
  onSelectQuestion: (id: QuestionId) => void;
}

export const LabHeader: React.FC<LabHeaderProps> = ({
  activeQuestion,
  onSelectQuestion
}) => {
  return (
    <div className="mb-5 space-y-4">
      {/* Title & Cockpit Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-tight text-red-500">
              ///
            </span>
            <span className="font-display text-[11px] font-black uppercase tracking-widest text-red-500">
              PADDOCK TELEMETRY
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              TACTICAL STRATEGY COCKPIT
            </span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            RACE INSIGHTS &amp; STRATEGY LAB
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 font-sans">
            Empirical telemetry analysis: pit stop execution, lap pace loss, tyre stint degradation, and track characteristics.
          </p>
        </div>
      </div>

      {/* Sleek Cockpit Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-800/80 backdrop-blur-md shadow-lg">
        {QUESTION_WORKSPACES.map((q) => {
          const isActive = activeQuestion === q.id;
          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              type="button"
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-zinc-900 border border-cyan-500/70 text-white shadow-md shadow-cyan-950/30'
                  : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <span className="text-xl shrink-0 transition-transform group-hover:scale-110">
                {q.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-[11px] font-black uppercase tracking-wider truncate ${
                    isActive ? 'text-cyan-400' : 'text-zinc-300'
                  }`}>
                    {q.title}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {q.id === 'pit_stop_review' && 'Stops & Undercut Windows'}
                  {q.id === 'time_lost' && 'Lap-by-Lap Delta Traces'}
                  {q.id === 'tyre_stints' && 'Compound Degradation Fits'}
                  {q.id === 'circuit_strengths' && 'Aero vs Speed Demands'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
