"use client";

import React, { useState } from "react";
import { ExplanatoryFactor } from "../../lib/racePredictorService";

interface ExplanationsPanelProps {
  factors: ExplanatoryFactor[];
  modelVersion?: string;
}

// Convert backend snake_case ML features to clean F1 terminology
const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  grid_position: "Starting Grid Position",
  driver_rolling_10_avg_finish: "Driver 10-Race Form",
  constructor_rolling_10_avg_finish: "Constructor Form & Reliability",
  quali_pos: "Qualifying Pace Differential",
  driver_rolling_10_podium_rate: "Podium Consistency",
  constructor_rolling_10_podium_rate: "Team Podium Track Record",
  driver_rolling_5_avg_finish: "Recent 5-Race Momentum",
  driver_rolling_5_podium_rate: "Recent 5-Race Podium Rate",
  driver_rolling_5_win_rate: "Recent 5-Race Win Rate",
  driver_rolling_10_win_rate: "10-Race Win Rate",
  driver_circuit_experience: "Circuit Track Experience",
  relative_quali_pace_pct: "Qualifying Speed Relative to Pole",
};

function formatFeatureTitle(raw: string): string {
  if (FEATURE_DISPLAY_NAMES[raw]) return FEATURE_DISPLAY_NAMES[raw];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExplanationsPanel({ factors }: ExplanationsPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <section
      aria-label="Key Performance Determinants"
      className="relative z-10 stitch-card-machined rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl"
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="stitch-live-dot" />
          <span className="text-white font-bold tracking-wider uppercase">
            Key Performance Factors
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="stitch-data-chip text-[9px] text-cyan-400 border-cyan-500/30">
            6 EVALUATED METRICS
          </span>
          <span className="stitch-data-chip text-[9px] text-emerald-400 border-emerald-500/30 hidden sm:inline-flex">
            CALIBRATED MODEL
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>Key Performance Factors</span>
            <span className="stitch-data-chip text-[10px] text-[#00F0FF] border-[#00F0FF]/30 font-bold">
              Telemetry Drivers
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Top telemetry and form metrics influencing race probability before
            lights out.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="explanations-factors-grid"
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 bg-[#131A26] hover:bg-[#1A2333] active:scale-[0.98] text-slate-200 hover:text-white border border-white/10 hover:border-[#00F0FF]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <span>{isOpen ? "COLLAPSE FACTORS ▲" : "EXPAND FACTORS ▼"}</span>
        </button>
      </div>

      {isOpen && (
        <div id="explanations-factors-grid">
          {/* Grid of Factors with Stitch Machined Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
            {factors.slice(0, 6).map((factor) => {
              const isPrimary = factor.rank === 1;
              const isHigh = factor.rank <= 3;
              const impactLabel = isPrimary
                ? "Primary Factor"
                : isHigh
                  ? "High Impact"
                  : "Key Factor";
              const impactColor = isPrimary
                ? "text-[#FFB800] border-[#FFB800]/40 bg-[#FFB800]/10 shadow-[0_0_12px_rgba(255,184,0,0.15)]"
                : isHigh
                  ? "text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                  : "text-[#00FF9C] border-[#00FF9C]/30 bg-[#00FF9C]/10";

              return (
                <div
                  key={factor.feature}
                  className={`rounded-xl p-4 flex flex-col justify-between transition-all duration-200 border ${
                    isPrimary
                      ? "bg-gradient-to-b from-[#16202E] to-[#0E1520] border-[#FFB800]/30 shadow-lg"
                      : "bg-[#101722] hover:bg-[#141C29] border-white/10"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isPrimary ? "bg-[#FFB800]" : isHigh ? "bg-[#00F0FF]" : "bg-[#00FF9C]"}`}
                        />
                        FACTOR #{factor.rank}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${impactColor}`}
                      >
                        {impactLabel}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {formatFeatureTitle(factor.feature)}
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {factor.description}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">DATA FEED</span>
                    <span className="text-[#00F0FF] font-semibold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#00F0FF] animate-ping" />
                      Session Telemetry
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Race Dynamics Note */}
          <div className="bg-[#0A0E15] border border-white/10 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Race Day Dynamics &amp; Live Variables</span>
            </h4>

            <div className="text-xs text-slate-300 leading-relaxed space-y-1.5 font-sans">
              <p>
                <strong className="text-white font-mono">
                  Pre-Race Conditions:
                </strong>{" "}
                These factors reflect driver form, constructor strength, and
                starting grid positions after official qualifying.
              </p>
              <p>
                <strong className="text-white font-mono">
                  In-Race Dynamics:
                </strong>{" "}
                Live racing events like tyre degradation, pit stop execution,
                safety cars, and changing weather conditions cannot be known
                before lights out and will directly shape the final Grand Prix
                result.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
