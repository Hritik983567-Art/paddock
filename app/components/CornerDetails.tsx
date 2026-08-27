'use client';

import React from 'react';
import { CircuitCorner } from '../lib/circuitCornersData';

interface CornerDetailsProps {
  corner: CircuitCorner;
  circuitName: string;
}

export const CornerDetails: React.FC<CornerDetailsProps> = ({ corner, circuitName }) => {
  const tech = corner.technical || {};
  const racing = corner.racing || {};

  return (
    <div className="flex flex-col gap-4 bg-[#070A10] border-2 border-slate-700/90 rounded-xl p-5 shadow-2xl backdrop-blur-2xl">
      {/* Corner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-widest text-red-500 font-extrabold uppercase">
              {circuitName}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-cyan-400 font-extrabold uppercase">
              {corner.turns || 'RECONNAISSANCE SECTOR'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {corner.name}
          </h2>
        </div>

        {/* Profile Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {corner.direction && (
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white font-extrabold shadow">
              🧭 {corner.direction}
            </span>
          )}
          {corner.type && (
            <span className="px-3 py-1 rounded-lg bg-red-950 border border-red-600 text-xs font-mono text-red-200 font-black shadow">
              ⚡ {corner.type}
            </span>
          )}
        </div>
      </div>

      {/* Description Paragraphs — 100% High Contrast Pure White Text */}
      <div className="text-sm font-sans leading-relaxed text-white space-y-2.5 bg-[#0D121F] p-4 rounded-xl border border-slate-700 shadow-lg">
        {corner.description ? (
          corner.description.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="font-semibold text-slate-100 text-[14.5px]">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="italic text-slate-300 font-mono text-xs">
            DATA UNAVAILABLE — Reconnaissance description pending telemetry verification.
          </p>
        )}
      </div>

      {/* Technical Telemetry Specs Grid — 100% Solid Cards & High Contrast Labels */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <span>⚙️ TECHNICAL TELEMETRY</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-200 uppercase bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-700">
            PADDOCK-DERIVED ANALYSIS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">ENTRY SPEED</span>
            <span className="text-base font-mono font-black text-white">
              {tech.entrySpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">APEX SPEED</span>
            <span className="text-base font-mono font-black text-red-400">
              {tech.apexSpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">EXIT SPEED</span>
            <span className="text-base font-mono font-black text-emerald-400">
              {tech.exitSpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">TYPICAL GEAR</span>
            <span className="text-base font-mono font-black text-amber-400">
              {tech.typicalGear || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">BRAKING FORCE</span>
            <span className="text-xs font-mono font-extrabold text-white">
              {tech.brakingIntensity || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">ELEVATION</span>
            <span className="text-xs font-mono font-extrabold text-white">
              {tech.elevationChange || 'N/A'}
            </span>
          </div>

          <div className="col-span-2 bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">DRS STATUS</span>
            <span className="text-xs font-mono font-extrabold text-cyan-300">
              {tech.drs || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Racing Dynamics Grid — High Contrast Crisp Text */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
            <span>🏎️ RACING DYNAMICS</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-200 uppercase bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-700">
            STRATEGY INTELLIGENCE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] text-cyan-400 font-black uppercase mb-1">OVERTAKING POTENTIAL</span>
            <span className="font-black text-white text-sm">
              {racing.overtakingPotential || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] text-cyan-400 font-black uppercase mb-1">BRAKING ZONE</span>
            <span className="font-black text-white text-sm">
              {racing.brakingZone || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] text-cyan-400 font-black uppercase mb-1">RACING LINE STRATEGY</span>
            <span className="font-extrabold text-slate-100">
              {racing.racingLine || 'N/A'}
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border-2 border-slate-700/80 shadow-md">
            <span className="block text-[11px] text-cyan-400 font-black uppercase mb-1">TRACK LIMITS</span>
            <span className="font-extrabold text-slate-100">
              {racing.trackLimits || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* History Section — Pure White Text */}
      {corner.history && (
        <div className="bg-[#0D121F] p-4 rounded-xl border border-slate-700 text-xs shadow-md">
          <h3 className="font-mono font-black uppercase text-amber-400 mb-1.5 flex items-center gap-1.5 text-xs">
            <span>📜 CORNER HISTORY &amp; HERITAGE</span>
          </h3>
          <p className="font-sans text-slate-100 font-medium leading-relaxed text-[14px]">
            {corner.history}
          </p>
        </div>
      )}
    </div>
  );
};
