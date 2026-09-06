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
    <div className="flex flex-col gap-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Subtle ambient glow overlay */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Corner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono tracking-widest text-red-500 font-black uppercase">
              {circuitName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-cyan-400 font-extrabold uppercase tracking-wider">
              {corner.turns || 'RECONNAISSANCE SECTOR'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
            {corner.name}
          </h2>
        </div>

        {/* Profile Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {corner.direction && (
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 font-bold shadow-sm flex items-center gap-1.5">
              <span>🧭</span> {corner.direction}
            </span>
          )}
          {corner.type && (
            <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/80 text-xs font-mono text-red-300 font-black shadow-[0_0_12px_rgba(239,68,68,0.25)] flex items-center gap-1.5">
              <span>⚡</span> {corner.type}
            </span>
          )}
        </div>
      </div>

      {/* Description Paragraphs */}
      <div className="text-sm font-sans leading-relaxed text-slate-100 space-y-2.5 bg-slate-900/70 p-4.5 rounded-xl border border-slate-800/80 shadow-md">
        {corner.description ? (
          corner.description.split('\n\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="font-normal text-slate-200 text-[15px] leading-relaxed">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="italic text-slate-400 font-mono text-xs">
            DATA UNAVAILABLE — Reconnaissance description pending telemetry verification.
          </p>
        )}
      </div>

      {/* Key Characteristics Spec Banner */}
      {corner.characteristics && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 p-4 rounded-xl border border-cyan-500/30 shadow-lg relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[11px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              CORNER CHARACTERISTICS &amp; TELEMETRY PROFILE
            </span>
          </div>
          <p className="text-sm font-sans font-semibold text-white tracking-wide leading-snug">
            {corner.characteristics}
          </p>
        </div>
      )}

      {/* Technical Telemetry Specs Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>TECHNICAL TELEMETRY</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700/80">
            PADDOCK-DERIVED ANALYSIS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-cyan-500/50 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">ENTRY SPEED</span>
            <span className="text-base font-mono font-black text-white">
              {tech.entrySpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-red-500/50 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">APEX SPEED</span>
            <span className="text-base font-mono font-black text-red-400">
              {tech.apexSpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-emerald-500/50 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">EXIT SPEED</span>
            <span className="text-base font-mono font-black text-emerald-400">
              {tech.exitSpeed || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-amber-500/50 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">TYPICAL GEAR</span>
            <span className="text-sm font-mono font-black text-amber-400">
              {tech.typicalGear || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-slate-700 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">BRAKING FORCE</span>
            <span className="text-xs font-mono font-extrabold text-white">
              {tech.brakingIntensity || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-slate-700 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">ELEVATION</span>
            <span className="text-xs font-mono font-extrabold text-white">
              {tech.elevationChange || 'N/A'}
            </span>
          </div>

          <div className="col-span-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md hover:border-cyan-500/40 transition-all duration-200">
            <span className="block text-[10.5px] font-mono font-black text-cyan-400 uppercase tracking-wider mb-1">DRS STATUS</span>
            <span className="text-xs font-mono font-extrabold text-cyan-300">
              {tech.drs || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Racing Dynamics Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>RACING DYNAMICS</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700/80">
            STRATEGY INTELLIGENCE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md">
            <span className="block text-[10.5px] text-cyan-400 font-black uppercase mb-1">OVERTAKING POTENTIAL</span>
            <span className="font-black text-white text-sm">
              {racing.overtakingPotential || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md">
            <span className="block text-[10.5px] text-cyan-400 font-black uppercase mb-1">BRAKING ZONE</span>
            <span className="font-black text-white text-sm">
              {racing.brakingZone || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md">
            <span className="block text-[10.5px] text-cyan-400 font-black uppercase mb-1">RACING LINE STRATEGY</span>
            <span className="font-bold text-slate-200 text-[12.5px]">
              {racing.racingLine || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 shadow-md">
            <span className="block text-[10.5px] text-cyan-400 font-black uppercase mb-1">TRACK LIMITS</span>
            <span className="font-bold text-slate-200 text-[12.5px]">
              {racing.trackLimits || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* History Section */}
      {corner.history && (
        <div className="bg-slate-900/80 p-4.5 rounded-xl border border-slate-800/80 text-xs shadow-md relative z-10">
          <h3 className="font-mono font-black uppercase text-amber-400 mb-2 flex items-center gap-1.5 text-xs tracking-wider">
            <span>📜 CORNER HISTORY &amp; HERITAGE</span>
          </h3>
          <p className="font-sans text-slate-200 font-normal leading-relaxed text-[14.5px]">
            {corner.history}
          </p>
        </div>
      )}
    </div>
  );
};
