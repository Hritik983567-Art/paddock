"use client";

import React, { useState, useMemo } from "react";
import { DriverPredictionEntry, CircuitHeritageSummary } from "../../lib/racePredictorService";
import { getDriverMediaProfile } from "../../lib/driverMediaService";
import { getTeamColor } from "../../utils/api";

interface ProbabilityTableProps {
  predictions: DriverPredictionEntry[];
  seasonYear: number;
  actualResults?: Record<string, number>;
  circuitHeritage?: CircuitHeritageSummary;
  rankingOrderSemantic?: string;
  hybridFormulaVersion?: string;
  experimentalStatus?: string;
}

type SortField = "prob" | "grid" | "quali" | "name" | "rank" | "delta" | "trackWins" | "trackAvg";
type ViewMode = "all" | "quali" | "heritage" | "fusion";

function getSynthesisSummary(driver: DriverPredictionEntry, poleWinRate?: number): string {
  const isPole = driver.gridPosition === 1;
  const wins = driver.circuitWins || 0;
  const starts = driver.circuitStarts || 0;
  const avgFinish = driver.circuitAvgFinish;
  const poleRate = poleWinRate ?? 40;
  const delta = driver.qualiDeltaToPole;

  if (isPole && wins > 0) {
    return `Starting on pole with ${wins} past win${wins > 1 ? "s" : ""} at this track (${starts} starts). High conversion potential given ${poleRate.toFixed(0)}% track pole-to-win rate.`;
  }
  if (isPole) {
    return `Starting on pole with qualifying pace advantage (+0.000s). Pole-to-win baseline at this venue is ${poleRate.toFixed(0)}%.`;
  }
  if (driver.gridPosition <= 3 && wins > 0) {
    return `Front row launch (P${driver.gridPosition}) paired with prior venue victory (${wins} win${wins > 1 ? "s" : ""}). Strong historical overtaking candidate.`;
  }
  if (driver.gridPosition <= 5 && avgFinish && avgFinish <= 4) {
    return `Top-5 grid start (P${driver.gridPosition}) bolstered by stellar track average finish (P${avgFinish.toFixed(1)}). Consistent venue performer.`;
  }
  if (wins > 0 && driver.gridPosition > 3) {
    return `Prior track winner (${wins} win${wins > 1 ? "s" : ""}) starting from P${driver.gridPosition}. Venue heritage counters grid deficit.`;
  }
  if (delta != null && delta < 0.3) {
    return `Tight single-lap pace (+${delta.toFixed(3)}s to pole) starting P${driver.gridPosition}. Competitive pre-race package.`;
  }
  if (avgFinish && avgFinish <= 6) {
    return `Solid venue pedigree with P${avgFinish.toFixed(1)} historical average finish across ${starts} starts at this track.`;
  }
  return `Starting P${driver.gridPosition} (Q: P${driver.qualiPosition}). Pre-race win probability calibrated by grid position and recent momentum.`;
}

export default function ProbabilityTable({
  predictions,
  seasonYear,
  actualResults,
  circuitHeritage,
  rankingOrderSemantic,
  hybridFormulaVersion: _hybridFormulaVersion,
  experimentalStatus: _experimentalStatus,
}: ProbabilityTableProps) {
  const [sortField, setSortField] = useState<SortField>("prob");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const hasHybridProbs = useMemo(() => {
    return predictions.some(
      (p) =>
        p.grid_baseline_probability !== undefined ||
        p.gridBaselineProbability !== undefined ||
        p.ml_win_probability !== undefined ||
        p.mlWinProbability !== undefined
    );
  }, [predictions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(
        field === "grid" ||
          field === "quali" ||
          field === "rank" ||
          field === "delta" ||
          field === "trackAvg",
      );
    }
  };

  const filteredAndSortedDrivers = useMemo(() => {
    let list = [...predictions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.driverCode.toLowerCase().includes(q) ||
          d.driverId.toLowerCase().includes(q) ||
          d.constructorName.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "prob":
          comparison = a.winProbability - b.winProbability;
          break;
        case "grid":
          comparison = a.gridPosition - b.gridPosition;
          break;
        case "quali":
          comparison = a.qualiPosition - b.qualiPosition;
          break;
        case "rank":
          comparison = a.predictedRank - b.predictedRank;
          break;
        case "name":
          comparison = a.driverCode.localeCompare(b.driverCode);
          break;
        case "delta":
          comparison = (a.qualiDeltaToPole ?? 99) - (b.qualiDeltaToPole ?? 99);
          break;
        case "trackWins":
          comparison = (a.circuitWins ?? 0) - (b.circuitWins ?? 0);
          break;
        case "trackAvg":
          comparison = (a.circuitAvgFinish ?? 99) - (b.circuitAvgFinish ?? 99);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [predictions, searchQuery, sortField, sortAsc]);

  const maxProb = useMemo(() => {
    if (predictions.length === 0) return 1.0;
    return Math.max(...predictions.map((p) => p.winProbability));
  }, [predictions]);

  return (
    <section
      aria-label="Field Win Probability Standings"
      className="stitch-card-machined relative z-10 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-white/10 text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C] animate-pulse"></span>
          <span className="font-bold text-white tracking-wider uppercase">
            Driver Win Probabilities
          </span>
          <span className="data-chip px-2 py-0.5 text-[10px] text-cyan-300 font-mono border-cyan-500/30">
            {rankingOrderSemantic || "Predicted Win Probability Order"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasHybridProbs && (
            <span className="data-chip px-2.5 py-0.5 text-[10px] text-amber-300 font-bold border-amber-500/30">
              GEOMETRIC HYBRID (w=0.20)
            </span>
          )}
          <span className="data-chip px-2.5 py-0.5 text-[10px] text-emerald-300 font-bold border-emerald-500/30">
            {predictions.length} ENTRANTS CLASSIFIED
          </span>
        </div>
      </div>

      {circuitHeritage && (
        <div className="mb-5 bg-[#090E17] border border-white/10 rounded-xl p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></span>
                <span className="font-bold text-cyan-400">Track Heritage DNA</span>
                <span>•</span>
                <span>Last {circuitHeritage.totalRacesAnalyzed} Races Analyzed</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {circuitHeritage.circuitName}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="bg-[#101723] border border-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Pole-To-Win Rate
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-[#00FF9C]">
                  {circuitHeritage.poleWinRatePct.toFixed(1)}%
                </div>
              </div>

              <div className="bg-[#101723] border border-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Avg Winner Grid
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-[#FFB800]">
                  P{circuitHeritage.avgWinnerGrid.toFixed(1)}
                </div>
              </div>

              <div className="bg-[#101723] border border-white/10 rounded-lg px-3 py-1.5 text-center">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Track Profile
                </div>
                <div className="text-[10px] font-mono font-bold text-cyan-300">
                  {circuitHeritage.poleWinRatePct >= 50
                    ? "POLE DOMINANT"
                    : "HIGH OVERTAKING"}
                </div>
              </div>
            </div>
          </div>

          {circuitHeritage.pastWinners && circuitHeritage.pastWinners.length > 0 && (
            <div className="pt-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Recent Venue Winners (Grid Position &amp; Team):
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {circuitHeritage.pastWinners.map((winner, idx) => (
                  <div
                    key={`${winner.year}-${winner.winnerCode}-${idx}`}
                    className="inline-flex items-center gap-1.5 bg-[#121927] hover:bg-[#182133] border border-white/10 rounded-md px-2 py-1 text-[11px] font-mono transition-colors"
                  >
                    <span className="text-slate-400 font-bold">{winner.year}</span>
                    <span className="text-white font-extrabold">{winner.winnerCode}</span>
                    <span className="text-[10px] text-[#00FFE0] bg-cyan-950/60 border border-cyan-800/40 px-1 py-0.2 rounded font-bold">
                      Grid P{winner.startedGrid}
                    </span>
                    <span className="text-slate-400 text-[10px] hidden sm:inline">
                      {winner.constructorName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Official Field Win Probability Rankings</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Calibrated race-level win distribution synthesizing qualifying pace and historical track heritage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="inline-flex p-1 bg-[#090E17] border border-white/10 rounded-xl text-xs font-mono">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "all"
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setViewMode("quali")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "quali"
                  ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Quali Scenario
            </button>
            <button
              onClick={() => setViewMode("heritage")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "heritage"
                  ? "bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Track Heritage
            </button>
            {hasHybridProbs && (
              <button
                onClick={() => setViewMode("fusion")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "fusion"
                    ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Model Fusion
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-52">
            <input
              type="text"
              aria-label="Filter drivers or constructors by name"
              placeholder="Search driver or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090E16] text-xs text-white placeholder-slate-400 rounded-lg pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-colors shadow-inner font-mono"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="text-xs text-slate-300 mb-3 flex items-center justify-between">
          <span>
            Showing {filteredAndSortedDrivers.length} of {predictions.length} classified entrants
          </span>
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear active driver filter"
            className="text-[#00FFE0] hover:text-[#33FFF0] hover:underline text-xs font-semibold py-1 px-2 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00FFE0]"
          >
            Clear filter
          </button>
        </div>
      )}

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2E3746] text-slate-200 uppercase tracking-wider text-[11px] font-bold bg-[#141923]/90">
              <th
                className="py-3 px-3 cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("rank")}
              >
                Rank {sortField === "rank" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("name")}
              >
                Driver {sortField === "name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="py-3 px-3 select-none">Constructor</th>
              <th
                className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("grid")}
              >
                Grid {sortField === "grid" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("quali")}
              >
                Quali {sortField === "quali" && (sortAsc ? "↑" : "↓")}
              </th>

              {(viewMode === "all" || viewMode === "quali") && (
                <th
                  className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort("delta")}
                >
                  Delta to Pole {sortField === "delta" && (sortAsc ? "↑" : "↓")}
                </th>
              )}

              {(viewMode === "all" || viewMode === "heritage") && (
                <>
                  <th
                    className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("trackWins")}
                  >
                    Track Record {sortField === "trackWins" && (sortAsc ? "↑" : "↓")}
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("trackAvg")}
                  >
                    Track Avg {sortField === "trackAvg" && (sortAsc ? "↑" : "↓")}
                  </th>
                </>
              )}

              {viewMode === "fusion" && (
                <>
                  <th className="py-2.5 px-3 font-semibold text-center select-none text-amber-300">
                    Grid Base (80%)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center select-none text-cyan-300">
                    ML Model (20%)
                  </th>
                </>
              )}

              <th
                className="py-2.5 px-3 font-semibold w-1/4 cursor-pointer hover:text-white select-none"
                onClick={() => handleSort("prob")}
              >
                Win Probability {hasHybridProbs ? "(Hybrid)" : ""} {sortField === "prob" && (sortAsc ? "↑" : "↓")}
              </th>

              {actualResults && (
                <th className="py-2.5 px-3 font-semibold text-center select-none">
                  Race Finish
                </th>
              )}

              <th className="py-2.5 px-2 text-center select-none">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]/50">
            {filteredAndSortedDrivers.map((driver) => {
              const activeSeasonStr =
                seasonYear && seasonYear >= 2025 ? String(seasonYear) : "2026";
              const profile = getDriverMediaProfile(driver.driverId, activeSeasonStr);
              const teamColor =
                profile.teamColor || getTeamColor(profile.teamId || driver.constructorId);
              const actualFinish = actualResults ? actualResults[driver.driverCode] : undefined;
              const isActualWinner = actualFinish === 1;
              const isExpanded = expandedDriverId === driver.driverId;
              const delta = driver.qualiDeltaToPole;

              return (
                <React.Fragment key={driver.driverId}>
                  <tr
                    onClick={() => setExpandedDriverId(isExpanded ? null : driver.driverId)}
                    className={`cursor-pointer hover:bg-[#141923]/80 transition-colors ${
                      driver.predictedRank === 1 ? "bg-[#FF1801]/5" : ""
                    } ${isExpanded ? "bg-[#141E2E]/60 border-l-2 border-l-[#00F0FF]" : ""}`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-gray-300">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                          driver.predictedRank === 1
                            ? "bg-[#FF1801] text-white font-black"
                            : driver.predictedRank <= 3
                              ? "bg-[#1F2937] text-[#00FFE0]"
                              : "text-gray-400"
                        }`}
                      >
                        {driver.predictedRank}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full overflow-hidden border bg-[#05070A] flex-shrink-0"
                          style={{ borderColor: teamColor }}
                        >
                          {profile.headshotUrl ? (
                            <img
                              src={profile.headshotUrl}
                              alt={profile.name || driver.driverCode}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                              {driver.driverCode}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{profile.name || driver.driverCode}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              #{driver.driverNumber || profile.number}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {profile.nationality || driver.driverCode} {profile.flag || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: teamColor }}
                        />
                        <span className="text-gray-200 font-medium">
                          {profile.teamName || driver.constructorName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            driver.gridPosition === 1
                              ? "bg-[#FFC000] text-black font-black"
                              : "bg-[#141923] text-gray-200 border border-[#2E3746]"
                          }`}
                        >
                          P{driver.gridPosition}
                        </span>
                        {driver.gridPenaltyDelta !== 0 && (
                          <span
                            className={`text-[9px] font-mono mt-0.5 ${
                              driver.gridPenaltyDelta > 0 ? "text-[#FF1801]" : "text-[#00F090]"
                            }`}
                          >
                            {driver.gridPenaltyDelta > 0
                              ? `+${driver.gridPenaltyDelta} grid`
                              : `${driver.gridPenaltyDelta} grid`}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-gray-400">
                      P{driver.qualiPosition}
                    </td>

                    {(viewMode === "all" || viewMode === "quali") && (
                      <td className="py-3 px-3 text-center font-mono">
                        {delta != null ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                delta === 0
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                                  : delta < 0.25
                                    ? "text-cyan-300"
                                    : "text-slate-300"
                              }`}
                            >
                              {delta === 0 ? "POLE" : `+${delta.toFixed(3)}s`}
                            </span>
                            {driver.qualiTime && (
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                {driver.qualiTime}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    )}

                    {(viewMode === "all" || viewMode === "heritage") && (
                      <>
                        <td className="py-3 px-3 text-center font-mono">
                          {driver.circuitStarts && driver.circuitStarts > 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-bold text-slate-200 text-xs">
                                {driver.circuitWins ? `${driver.circuitWins}W` : "0W"} /{" "}
                                {driver.circuitPodiums ? `${driver.circuitPodiums}P` : "0P"}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                {driver.circuitStarts} start{driver.circuitStarts > 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No starts</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {driver.circuitAvgFinish ? (
                            <span
                              className={`font-bold text-xs ${
                                driver.circuitAvgFinish <= 3
                                  ? "text-[#FFB800]"
                                  : driver.circuitAvgFinish <= 6
                                    ? "text-cyan-300"
                                    : "text-slate-300"
                              }`}
                            >
                              P{driver.circuitAvgFinish.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">—</span>
                          )}
                        </td>
                      </>
                    )}

                    {viewMode === "fusion" && (
                      <>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-300">
                          {(((driver.grid_baseline_probability ?? driver.gridBaselineProbability) || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-cyan-300">
                          {(((driver.ml_win_probability ?? driver.mlWinProbability) || 0) * 100).toFixed(1)}%
                        </td>
                      </>
                    )}

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#05070A] h-2.5 rounded-full overflow-hidden border border-[#2E3746]/80">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.max(1, (driver.winProbability / maxProb) * 100)}%`,
                              backgroundColor: teamColor || "#00FFE0",
                            }}
                          />
                        </div>
                        <div className="w-16 text-right font-mono font-bold text-gray-100 text-xs">
                          {driver.winProbabilityPct.toFixed(2)}%
                        </div>
                      </div>
                    </td>

                    {actualResults && (
                      <td className="py-3 px-3 text-center">
                        {actualFinish !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isActualWinner
                                ? "bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/40"
                                : actualFinish <= 3
                                  ? "bg-[#FFC000]/20 text-[#FFC000]"
                                  : "text-gray-400"
                            }`}
                          >
                            {isActualWinner ? "🏆 Won (P1)" : `P${actualFinish}`}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[10px] font-mono">
                            DNF / Ret
                          </span>
                        )}
                      </td>
                    )}

                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={(e) => {
                           e.stopPropagation();
                           setExpandedDriverId(isExpanded ? null : driver.driverId);
                        }}
                        aria-label="Toggle telemetry breakdown"
                        className="text-slate-400 hover:text-white font-mono text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#0B1019] border-y border-white/10">
                      <td
                        colSpan={
                          7 +
                          (viewMode === "all" ? 3 : viewMode === "quali" ? 1 : viewMode === "heritage" ? 2 : 2) +
                          (actualResults ? 1 : 0)
                        }
                        className="p-4"
                      >
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${hasHybridProbs ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
                          <div className="bg-[#101723] border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                              <span>🚦</span>
                              <span>Qualification Scenario</span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Starting Grid:</span>
                                <span className="font-mono font-bold text-white">
                                  P{driver.gridPosition}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Qualifying Pos:</span>
                                <span className="font-mono text-slate-300">
                                  P{driver.qualiPosition}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Grid Penalties:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    driver.gridPenaltyDelta > 0
                                      ? "text-[#FF1801]"
                                      : driver.gridPenaltyDelta < 0
                                        ? "text-emerald-400"
                                        : "text-slate-400"
                                  }`}
                                >
                                  {driver.gridPenaltyDelta > 0
                                    ? `+${driver.gridPenaltyDelta} grid drop`
                                    : driver.gridPenaltyDelta < 0
                                      ? `${driver.gridPenaltyDelta} promoted`
                                      : "None (Clean Grid)"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Quali Lap Time:</span>
                                <span className="font-mono text-cyan-300">
                                  {driver.qualiTime || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Gap to Pole:</span>
                                <span className="font-mono font-bold text-emerald-300">
                                  {delta != null
                                    ? delta === 0
                                    ? "0.000s (Pole)"
                                    : `+${delta.toFixed(3)}s`
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#101723] border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#FFB800] font-bold">
                              <span>🏁</span>
                              <span>Venue Track Heritage</span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Venue Starts:</span>
                                <span className="font-mono font-bold text-white">
                                  {driver.circuitStarts ?? 0} starts
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Venue Wins:</span>
                                <span className="font-mono font-bold text-[#FFB800]">
                                  {driver.circuitWins ?? 0} wins (
                                  {(driver.circuitWinRatePct ?? 0).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Venue Podiums:</span>
                                <span className="font-mono text-slate-300">
                                  {driver.circuitPodiums ?? 0} podiums
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Avg Finish at Track:</span>
                                <span className="font-mono font-bold text-cyan-300">
                                  {driver.circuitAvgFinish
                                    ? `P${driver.circuitAvgFinish.toFixed(1)}`
                                    : "No Prior Finish"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Circuit Pole-To-Win:</span>
                                <span className="font-mono text-slate-300">
                                  {circuitHeritage
                                    ? `${circuitHeritage.poleWinRatePct.toFixed(1)}%`
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#101723] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                                <span>📈</span>
                                <span>Momentum &amp; Synthesis</span>
                              </div>
                              <div className="space-y-1.5 text-xs mb-3">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Last 5 Races Avg:</span>
                                  <span className="font-mono text-slate-200">
                                    {driver.rolling5AvgFinish
                                      ? `P${driver.rolling5AvgFinish.toFixed(1)}`
                                      : "—"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Last 10 Races Avg:</span>
                                  <span className="font-mono text-slate-200">
                                    {driver.rolling10AvgFinish
                                      ? `P${driver.rolling10AvgFinish.toFixed(1)}`
                                      : "—"}{" "}
                                    ({(driver.rolling10WinRatePct ?? 0).toFixed(0)}% wins)
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#080C14] border border-white/10 rounded-lg p-2 text-[11px] text-slate-300 leading-relaxed font-sans">
                              {getSynthesisSummary(
                                driver,
                                circuitHeritage?.poleWinRatePct,
                              )}
                            </div>
                          </div>

                          {hasHybridProbs && (
                            <div className="bg-[#101723] border border-cyan-500/20 rounded-xl p-3 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                                  <span>⚖️</span>
                                  <span>Model Fusion Breakdown</span>
                                </div>
                                <div className="space-y-2 text-xs mb-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Grid Base (80%):</span>
                                    <span className="font-mono font-bold text-amber-300">
                                      {(((driver.grid_baseline_probability ?? driver.gridBaselineProbability) || 0) * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">ML Model (20%):</span>
                                    <span className="font-mono font-bold text-cyan-300">
                                      {(((driver.ml_win_probability ?? driver.mlWinProbability) || 0) * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1.5 border-t border-white/10">
                                    <span className="text-white font-semibold">Geometric Hybrid:</span>
                                    <span className="font-mono font-black text-[#00FF9C]">
                                      {(((driver.hybrid_win_probability ?? driver.hybridWinProbability ?? driver.winProbability) || 0) * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-[#080C14] border border-white/10 rounded-lg p-2 text-[10px] text-slate-400 font-mono">
                                Formula: P_grid^0.80 × P_ML^0.20 (Laplace α=1.0)
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2.5">
        {filteredAndSortedDrivers.map((driver) => {
          const activeSeasonStr =
            seasonYear && seasonYear >= 2025 ? String(seasonYear) : "2026";
          const profile = getDriverMediaProfile(driver.driverId, activeSeasonStr);
          const teamColor =
            profile.teamColor || getTeamColor(profile.teamId || driver.constructorId);
          const actualFinish = actualResults ? actualResults[driver.driverCode] : undefined;
          const isExpanded = expandedDriverId === driver.driverId;
          const delta = driver.qualiDeltaToPole;

          return (
            <div
              key={driver.driverId}
              className="bg-[#141923] border border-[#2E3746] rounded-xl p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                      driver.predictedRank === 1
                        ? "bg-[#FF1801] text-white"
                        : "bg-[#05070A] text-gray-300 border border-[#2E3746]"
                    }`}
                  >
                    #{driver.predictedRank}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1">
                      <span>{profile.name || driver.driverCode}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        ({driver.driverCode})
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span>{profile.teamName || driver.constructorName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-[#00FFE0]">
                    {driver.winProbabilityPct.toFixed(1)}%
                  </span>
                  <div className="text-[10px] font-mono text-gray-400">
                    Grid: <strong className="text-white">P{driver.gridPosition}</strong>{" "}
                    (Q: P{driver.qualiPosition})
                  </div>
                </div>
              </div>

              <div className="w-full bg-[#05070A] h-2 rounded-full overflow-hidden border border-[#2E3746]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, (driver.winProbability / maxProb) * 100)}%`,
                    backgroundColor: teamColor || "#00FFE0",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#090E17] border border-white/5 rounded-lg p-2">
                <div>
                  <span className="text-slate-400">Gap to Pole: </span>
                  <span className="text-cyan-300 font-bold">
                    {delta != null
                      ? delta === 0
                        ? "POLE"
                        : `+${delta.toFixed(3)}s`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Track Record: </span>
                  <span className="text-amber-300 font-bold">
                    {driver.circuitWins ? `${driver.circuitWins}W` : "0W"} /{" "}
                    {driver.circuitStarts || 0} starts
                  </span>
                </div>
              </div>

              {hasHybridProbs && (
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-[#090E17] border border-white/5 rounded-lg p-2 text-center">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Grid Base (80%)</span>
                    <span className="text-amber-300 font-bold">
                      {(((driver.grid_baseline_probability ?? driver.gridBaselineProbability) || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">ML Model (20%)</span>
                    <span className="text-cyan-300 font-bold">
                      {(((driver.ml_win_probability ?? driver.mlWinProbability) || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Hybrid Win</span>
                    <span className="text-[#00FF9C] font-black">
                      {(((driver.hybrid_win_probability ?? driver.hybridWinProbability ?? driver.winProbability) || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpandedDriverId(isExpanded ? null : driver.driverId)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 self-center py-1"
              >
                {isExpanded ? "▲ Hide Telemetry Details" : "▼ Expand Telemetry & Track Heritage"}
              </button>

              {isExpanded && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-2">
                  <div className="bg-[#0C121D] rounded-lg p-2.5 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Track Avg Finish:</span>
                      <span className="text-white font-bold">
                        {driver.circuitAvgFinish
                          ? `P${driver.circuitAvgFinish.toFixed(1)}`
                          : "No Prior Finish"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recent 10-Race Avg:</span>
                      <span className="text-white">
                        {driver.rolling10AvgFinish
                          ? `P${driver.rolling10AvgFinish.toFixed(1)}`
                          : "—"}
                      </span>
                    </div>
                    {driver.qualiTime && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quali Time:</span>
                        <span className="text-cyan-300">{driver.qualiTime}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-[#080C14] p-2 rounded-lg border border-white/5">
                    {getSynthesisSummary(
                      driver,
                      circuitHeritage?.poleWinRatePct,
                    )}
                  </p>
                </div>
              )}

              {actualFinish !== undefined && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2E3746]/50">
                  <span className="text-gray-400">Official Result:</span>
                  <span
                    className={`font-mono font-bold ${
                      actualFinish === 1 ? "text-[#00F090]" : "text-gray-200"
                    }`}
                  >
                    {actualFinish === 1 ? "🏆 Winner (P1)" : `Finished P${actualFinish}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
