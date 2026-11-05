"use client";

import React, { useState } from "react";
import { ExplanatoryFactor, CircuitHeritageSummary } from "../../lib/racePredictorService";

interface ExplanationsPanelProps {
  factors: ExplanatoryFactor[];
  modelVersion?: string;
  circuitHeritage?: CircuitHeritageSummary;
}

const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  grid_position: "Starting Grid Position",
  driver_rolling_10_avg_finish: "Driver 10-Race Form",
  constructor_rolling_10_avg_finish: "Constructor Form & Reliability",
  quali_pos: "Qualifying Pace Position",
  quali_time_delta_to_pole: "Qualifying Delta to Pole",
  relative_quali_pace_pct: "Qualifying Speed Relative to Pole",
  circuit_historical_pole_win_rate: "Circuit Pole-to-Win Rate",
  driver_circuit_experience: "Circuit Starts & Venue Experience",
  driver_circuit_win_rate: "Driver Track Win Rate",
  constructor_circuit_win_rate: "Constructor Track Win Rate",
  driver_rolling_10_podium_rate: "Podium Consistency (Last 10)",
  constructor_rolling_10_podium_rate: "Team Podium Track Record",
  driver_rolling_5_avg_finish: "Recent 5-Race Momentum",
  driver_rolling_5_podium_rate: "Recent 5-Race Podium Rate",
  driver_rolling_5_win_rate: "Recent 5-Race Win Rate",
  driver_rolling_10_win_rate: "10-Race Win Rate",
};

function formatFeatureTitle(raw: string): string {
  if (FEATURE_DISPLAY_NAMES[raw]) return FEATURE_DISPLAY_NAMES[raw];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type DomainKey = "all" | "quali" | "heritage" | "form";

interface DomainDefinition {
  key: "quali" | "heritage" | "form";
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  description: string;
}

const DOMAINS: DomainDefinition[] = [
  {
    key: "quali",
    icon: "🚦",
    title: "Current Qualification Scenario",
    subtitle: "Starting grid positions, penalties, & single-lap pace delta",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-950/40 text-emerald-300",
    description:
      "Captures the official starting grid order after qualifying penalties and the raw time delta to pole position.",
  },
  {
    key: "heritage",
    icon: "🏁",
    title: "Track Heritage (Last 5–10 Races)",
    subtitle: "Venue DNA, pole conversion rates, & track mastery",
    accentColor: "text-[#FFB800]",
    borderColor: "border-[#FFB800]/30",
    badgeBg: "bg-amber-950/40 text-amber-300",
    description:
      "Evaluates historical race winners, pole conversion percentage, and driver track record at this specific circuit.",
  },
  {
    key: "form",
    icon: "📈",
    title: "Rolling Momentum & Team Form",
    subtitle: "5-race and 10-race moving averages & constructor pace",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-950/40 text-cyan-300",
    description:
      "Measures driver consistency and constructor development trajectory across the most recent 5 to 10 Grands Prix.",
  },
];

function classifyFactorDomain(feature: string): "quali" | "heritage" | "form" {
  if (
    feature === "grid_position" ||
    feature === "quali_pos" ||
    feature === "quali_time_delta_to_pole" ||
    feature === "relative_quali_pace_pct"
  ) {
    return "quali";
  }
  if (feature.includes("circuit")) {
    return "heritage";
  }
  return "form";
}

export default function ExplanationsPanel({
  factors,
  circuitHeritage,
}: ExplanationsPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeDomain, setActiveDomain] = useState<DomainKey>("all");

  const categorizedFactors = {
    quali: factors.filter((f) => classifyFactorDomain(f.feature) === "quali"),
    heritage: factors.filter((f) => classifyFactorDomain(f.feature) === "heritage"),
    form: factors.filter((f) => classifyFactorDomain(f.feature) === "form"),
  };

  return (
    <section
      aria-label="Key Performance Determinants"
      className="relative z-10 stitch-card-machined rounded-2xl p-5 sm:p-6 mb-8 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="stitch-live-dot" />
          <span className="text-white font-bold tracking-wider uppercase">
            Model Explanation &amp; Performance Drivers
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="stitch-data-chip text-[9px] text-cyan-400 border-cyan-500/30">
            {factors.length} SHAP DETERMINANTS
          </span>
          <span className="stitch-data-chip text-[9px] text-emerald-400 border-emerald-500/30 hidden sm:inline-flex">
            CALIBRATED INFERENCE
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
            <span>Key Performance Factors</span>
            <span className="stitch-data-chip text-[10px] text-[#00F0FF] border-[#00F0FF]/30 font-bold">
              Feature Determinants
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            How the model synthesizes current qualification scenarios with 5–10 races of track heritage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="inline-flex p-1 bg-[#090E17] border border-white/10 rounded-xl text-xs font-mono">
            <button
              onClick={() => setActiveDomain("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeDomain === "all"
                  ? "bg-white/15 text-white border border-white/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Domains
            </button>
            <button
              onClick={() => setActiveDomain("quali")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeDomain === "quali"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚦 Quali Scenario
            </button>
            <button
              onClick={() => setActiveDomain("heritage")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeDomain === "heritage"
                  ? "bg-amber-950 text-amber-300 border border-amber-600/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏁 Track Heritage
            </button>
            <button
              onClick={() => setActiveDomain("form")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeDomain === "form"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-600/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📈 Form
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="explanations-factors-grid"
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 bg-[#131A26] hover:bg-[#1A2333] active:scale-[0.98] text-slate-200 hover:text-white border border-white/10 hover:border-[#00F0FF]/50 flex items-center gap-1.5 shadow-md"
          >
            <span>{isOpen ? "COLLAPSE ▲" : "EXPAND ▼"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="explanations-factors-grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {DOMAINS.filter(
              (d) => activeDomain === "all" || activeDomain === d.key,
            ).map((domain) => {
              const domainFactors = categorizedFactors[domain.key];

              return (
                <div
                  key={domain.key}
                  className={`bg-[#0D1420] border ${domain.borderColor} rounded-xl p-4 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{domain.icon}</span>
                        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                          {domain.title}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-white/10 ${domain.badgeBg}`}
                      >
                        {domainFactors.length} FACTORS
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                      {domain.description}
                    </p>

                    <div className="space-y-2.5">
                      {domainFactors.length > 0 ? (
                        domainFactors.map((factor) => {
                          const isPrimary = factor.rank === 1;
                          return (
                            <div
                              key={factor.feature}
                              className={`p-2.5 rounded-lg border transition-all ${
                                isPrimary
                                  ? "bg-[#141C2B] border-[#FFB800]/40 shadow-sm"
                                  : "bg-[#090E17] border-white/5 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono font-bold text-slate-300">
                                  #{factor.rank} {formatFeatureTitle(factor.feature)}
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                    isPrimary
                                      ? "bg-[#FFB800]/20 text-[#FFB800]"
                                      : "bg-white/10 text-slate-300"
                                  }`}
                                >
                                  {(factor.mean_abs_shap * 100).toFixed(1)}% WEIGHT
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">
                                {factor.description}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-[#090E17] border border-white/5 rounded-lg p-3 text-center">
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            {domain.key === "heritage"
                              ? "Historical circuit metrics (starts, wins, podiums, and pole win rate) serve as baseline priors before qualifying weights are applied."
                              : "Domain telemetry integrated into calibrated multi-factor distribution."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {domain.key === "heritage" && circuitHeritage && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] font-mono text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pole-To-Win Rate:</span>
                        <span className="text-[#00FF9C] font-bold">
                          {circuitHeritage.poleWinRatePct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Winner Grid:</span>
                        <span className="text-[#FFB800] font-bold">
                          P{circuitHeritage.avgWinnerGrid.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {domain.key === "quali" && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Source: Official FIA Grid</span>
                      <span className="text-emerald-400 font-bold">Penalties Factored</span>
                    </div>
                  )}

                  {domain.key === "form" && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Window: 5–10 Grands Prix</span>
                      <span className="text-cyan-400 font-bold">Rolling Momentum</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-[#0A0E15] border border-white/10 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <svg
                className="w-4 h-4 text-cyan-400"
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
              <span>Synthesis of Qualifying Scenario &amp; Track Heritage</span>
            </h4>

            <div className="text-xs text-slate-300 leading-relaxed space-y-1.5 font-sans">
              <p>
                <strong className="text-white font-mono">Qualifying vs. Heritage Balance: </strong>
                Starting grid position and single-lap qualifying delta determine initial track positioning, while the circuit&apos;s historical pole-to-win conversion rate and past winners indicate how readily overtaking occurs at this venue.
              </p>
              <p>
                <strong className="text-white font-mono">Race Day Dynamics: </strong>
                In-race factors such as tyre degradation degradation rates, pit stop execution, safety cars, and ambient track temperatures dynamically decide the final Grand Prix result once lights go out.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
