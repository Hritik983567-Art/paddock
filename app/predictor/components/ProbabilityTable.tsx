"use client";

import React, { useState, useMemo } from "react";
import { DriverPredictionEntry } from "../../lib/racePredictorService";
import { getDriverMediaProfile } from "../../lib/driverMediaService";
import { getTeamColor } from "../../utils/api";

interface ProbabilityTableProps {
  predictions: DriverPredictionEntry[];
  seasonYear: number;
  actualResults?: Record<string, number>; // driverCode -> actual finishing position
}

type SortField = "prob" | "grid" | "quali" | "name" | "rank";

export default function ProbabilityTable({
  predictions,
  seasonYear,
  actualResults,
}: ProbabilityTableProps) {
  const [sortField, setSortField] = useState<SortField>("prob");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // Probabilities & ranks default to descending/ascending appropriately
      setSortAsc(field === "grid" || field === "quali" || field === "rank");
    }
  };

  // Filtered & Sorted Drivers
  const filteredAndSortedDrivers = useMemo(() => {
    let list = [...predictions];

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.driverCode.toLowerCase().includes(q) ||
          d.driverId.toLowerCase().includes(q) ||
          d.constructorName.toLowerCase().includes(q),
      );
    }

    // Sort
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
      }
      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [predictions, searchQuery, sortField, sortAsc]);

  // Max probability for relative bar scaling
  const maxProb = useMemo(() => {
    if (predictions.length === 0) return 1.0;
    return Math.max(...predictions.map((p) => p.winProbability));
  }, [predictions]);

  return (
    <section
      aria-label="Field Win Probability Standings"
      className="stitch-card-machined relative z-10 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl overflow-hidden"
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C] animate-pulse"></span>
          <span className="font-bold text-white tracking-wider uppercase">
            Driver Win Probabilities
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="data-chip px-2.5 py-0.5 text-[10px] text-emerald-300 font-bold border-emerald-500/30">
            {predictions.length} ENTRANTS CLASSIFIED
          </span>
        </div>
      </div>

      {/* Table Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Official Field Win Probability Rankings</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Normalized race-level win distribution based on finalized starting
            grid.
          </p>
        </div>

        {/* Search Input & Sort Info */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
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
            Showing {filteredAndSortedDrivers.length} of {predictions.length}{" "}
            classified entrants
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

      {/* Desktop & Laptop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2E3746] text-slate-200 uppercase tracking-wider text-[11px] font-bold bg-[#141923]/90">
              <th
                className="py-3 px-3 cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-[#00FFE0] select-none"
                role="button"
                tabIndex={0}
                aria-label="Sort by predicted rank"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("rank");
                  }
                }}
                onClick={() => handleSort("rank")}
              >
                Rank {sortField === "rank" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className="py-3 px-3 cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-[#00FFE0] select-none"
                role="button"
                tabIndex={0}
                aria-label="Sort by driver code"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("name");
                  }
                }}
                onClick={() => handleSort("name")}
              >
                Driver {sortField === "name" && (sortAsc ? "↑" : "↓")}
              </th>
              <th className="py-3 px-3 select-none">Constructor</th>
              <th
                className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-[#00FFE0] select-none"
                role="button"
                tabIndex={0}
                aria-label="Sort by starting grid position"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("grid");
                  }
                }}
                onClick={() => handleSort("grid")}
              >
                Grid {sortField === "grid" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-center cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-[#00FFE0] select-none"
                role="button"
                tabIndex={0}
                aria-label="Sort by qualifying pace position"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("quali");
                  }
                }}
                onClick={() => handleSort("quali")}
              >
                Quali {sortField === "quali" && (sortAsc ? "↑" : "↓")}
              </th>
              <th
                className="py-2.5 px-3 font-semibold w-1/3 cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-[#00FFE0] select-none"
                role="button"
                tabIndex={0}
                aria-label="Sort by win probability percentage"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("prob");
                  }
                }}
                onClick={() => handleSort("prob")}
              >
                Win Probability {sortField === "prob" && (sortAsc ? "↑" : "↓")}
              </th>
              {actualResults && (
                <th className="py-2.5 px-3 font-semibold text-center select-none">
                  Race Finish
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]/50">
            {filteredAndSortedDrivers.map((driver) => {
              const activeSeasonStr =
                seasonYear && seasonYear >= 2025 ? String(seasonYear) : "2026";
              const profile = getDriverMediaProfile(
                driver.driverId,
                activeSeasonStr,
              );
              const teamColor =
                profile.teamColor ||
                getTeamColor(profile.teamId || driver.constructorId);
              const actualFinish = actualResults
                ? actualResults[driver.driverCode]
                : undefined;
              const isActualWinner = actualFinish === 1;

              return (
                <tr
                  key={driver.driverId}
                  className={`hover:bg-[#141923]/60 transition-colors ${driver.predictedRank === 1 ? "bg-[#FF1801]/5" : ""}`}
                >
                  {/* Rank */}
                  <td className="py-3 px-3 font-mono font-bold text-gray-300">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded ${driver.predictedRank === 1 ? "bg-[#FF1801] text-white font-black" : driver.predictedRank <= 3 ? "bg-[#1F2937] text-[#00FFE0]" : "text-gray-400"}`}
                    >
                      {driver.predictedRank}
                    </span>
                  </td>

                  {/* Driver Identity */}
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
                          {profile.nationality || driver.driverCode}{" "}
                          {profile.flag || ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Constructor */}
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

                  {/* Grid Position with Penalties */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${driver.gridPosition === 1 ? "bg-[#FFC000] text-black font-black" : "bg-[#141923] text-gray-200 border border-[#2E3746]"}`}
                      >
                        P{driver.gridPosition}
                      </span>
                      {driver.gridPenaltyDelta !== 0 && (
                        <span
                          className={`text-[9px] font-mono mt-0.5 ${driver.gridPenaltyDelta > 0 ? "text-[#FF1801]" : "text-[#00F090]"}`}
                        >
                          {driver.gridPenaltyDelta > 0
                            ? `+${driver.gridPenaltyDelta} grid`
                            : `${driver.gridPenaltyDelta} grid`}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quali Position */}
                  <td className="py-3 px-3 text-center font-mono text-gray-400">
                    P{driver.qualiPosition}
                  </td>

                  {/* Win Probability Bar */}
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
                      <span className="w-16 text-right font-mono font-bold text-gray-100 text-xs">
                        {driver.winProbabilityPct.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Completed Comparison Column */}
                  {actualResults && (
                    <td className="py-3 px-3 text-center">
                      {actualFinish !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${isActualWinner ? "bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/40" : actualFinish <= 3 ? "bg-[#FFC000]/20 text-[#FFC000]" : "text-gray-400"}`}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Compact Row Cards View */}
      <div className="md:hidden space-y-2.5">
        {filteredAndSortedDrivers.map((driver) => {
          const activeSeasonStr =
            seasonYear && seasonYear >= 2025 ? String(seasonYear) : "2026";
          const profile = getDriverMediaProfile(
            driver.driverId,
            activeSeasonStr,
          );
          const teamColor =
            profile.teamColor ||
            getTeamColor(profile.teamId || driver.constructorId);
          const actualFinish = actualResults
            ? actualResults[driver.driverCode]
            : undefined;

          return (
            <div
              key={driver.driverId}
              className="bg-[#141923] border border-[#2E3746] rounded-xl p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${driver.predictedRank === 1 ? "bg-[#FF1801] text-white" : "bg-[#05070A] text-gray-300 border border-[#2E3746]"}`}
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
                    Grid:{" "}
                    <strong className="text-white">
                      P{driver.gridPosition}
                    </strong>{" "}
                    (Q: P{driver.qualiPosition})
                  </div>
                </div>
              </div>

              {/* Progress bar on mobile */}
              <div className="w-full bg-[#05070A] h-2 rounded-full overflow-hidden border border-[#2E3746]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, (driver.winProbability / maxProb) * 100)}%`,
                    backgroundColor: teamColor || "#00FFE0",
                  }}
                />
              </div>

              {actualFinish !== undefined && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2E3746]/50">
                  <span className="text-gray-400">Official Result:</span>
                  <span
                    className={`font-mono font-bold ${actualFinish === 1 ? "text-[#00F090]" : "text-gray-200"}`}
                  >
                    {actualFinish === 1
                      ? "🏆 Winner (P1)"
                      : `Finished P${actualFinish}`}
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
