"use client";

import { RacePredictionResponse } from "../../lib/racePredictorService";

export interface CalendarRaceInfo {
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  date: string;
}

interface PredictorHeaderProps {
  currentRace: CalendarRaceInfo;
  nextRace?: CalendarRaceInfo;
  predictionData: RacePredictionResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  isQualifyingCompleted?: boolean;
  isCompletedRace?: boolean;
  onToggleHistoryLedger?: () => void;
  isViewingHistory?: boolean;
  onReturnToUpcoming?: () => void;
}

export default function PredictorHeader({
  currentRace,
  nextRace,
  predictionData,
  isLoading,
  onRefresh,
  isQualifyingCompleted = false,
  isCompletedRace = false,
  onToggleHistoryLedger,
  isViewingHistory = false,
  onReturnToUpcoming,
}: PredictorHeaderProps) {
  return (
    <header className="stitch-card-machined relative z-10 p-5 sm:p-6 rounded-2xl mb-8 shadow-2xl overflow-hidden">
      {/* Telemetry Header Strip */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_8px_#00FF9C] animate-pulse"></span>
          <span className="font-bold text-white tracking-wider uppercase">
            AI Race Prediction Engine
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-cyan-400 font-medium">
            Calibrated Telemetry Model
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="data-chip px-2.5 py-0.5 text-[10px] text-emerald-300 font-bold border-emerald-500/40">
            FIA LIVE TELEMETRY
          </span>
          <span className="data-chip px-2.5 py-0.5 text-[10px] text-amber-400 font-bold border-amber-500/40 hidden md:inline-flex">
            VERIFIED SESSION
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Active Grand Prix Spotlight */}
        <div>
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {!isViewingHistory ? (
              <span className="data-chip inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider uppercase bg-[#00FF9C]/15 text-[#00FF9C] border-[#00FF9C]/30 shadow-sm">
                <span className="stitch-live-dot" />
                Active Upcoming Race Focus
              </span>
            ) : (
              <span className="data-chip inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider uppercase bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                Historical Accuracy Audit Record
              </span>
            )}

            <span className="data-chip px-2.5 py-1 text-xs font-mono font-bold text-gray-200">
              Round {currentRace?.round || "19"} of 24
            </span>

            {isCompletedRace ? (
              <span className="data-chip px-2.5 py-1 text-xs font-semibold bg-[#00FF9C]/15 text-[#00FF9C] border-[#00FF9C]/40">
                Official Results Classified
              </span>
            ) : isQualifyingCompleted ? (
              <span className="data-chip px-2.5 py-1 text-xs font-semibold bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40">
                Starting Grid Finalized
              </span>
            ) : (
              <span className="data-chip px-2.5 py-1 text-xs font-semibold bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40 animate-pulse">
                Awaiting Saturday Qualifying
              </span>
            )}
          </div>

          {/* Grand Prix Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{currentRace?.raceName || "United States Grand Prix"}</span>
            <span className="data-chip px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider uppercase text-[#00F0FF] border-[#00F0FF]/40 shadow-sm">
              {currentRace?.circuitId === "americas"
                ? "USA"
                : currentRace?.country === "Mexico"
                  ? "MEX"
                  : currentRace?.country || "USA"}
            </span>
          </h1>

          {/* Circuit & Session Details */}
          <div className="mt-2 text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              Venue:{" "}
              <strong className="text-white font-semibold">
                {predictionData?.circuitName ||
                  currentRace?.circuitName ||
                  "Circuit of the Americas"}
              </strong>
            </span>
            <span className="text-gray-500">•</span>
            <span>
              Location:{" "}
              <strong className="text-white font-semibold">
                {currentRace?.circuitId === "americas"
                  ? "Austin, Texas, USA"
                  : currentRace?.country || "USA"}
              </strong>
            </span>
            <span className="text-gray-500">•</span>
            <span>
              Status:{" "}
              <strong
                className={
                  isCompletedRace
                    ? "text-[#00FF9C] font-semibold"
                    : isQualifyingCompleted
                      ? "text-[#00F0FF] font-semibold"
                      : "text-[#FFB800] font-semibold"
                }
              >
                {isCompletedRace
                  ? "Completed Grand Prix (Results Verified)"
                  : isQualifyingCompleted
                    ? "Starting Grid Finalized"
                    : "Pre-Qualifying (Starting Grid Pending Saturday Shootout)"}
              </strong>
            </span>
          </div>

          {/* Automatic Transition Notice Banner (When on upcoming race) */}
          {!isViewingHistory && nextRace && (
            <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E1520]/90 border border-white/10 text-xs text-slate-300 shadow-inner">
              <span className="text-[#FFB800] font-bold font-mono tracking-wider uppercase text-[11px]">
                Next Grand Prix:
              </span>
              <span>
                Round {nextRace?.round} —{" "}
                <strong className="text-white">{nextRace?.raceName}</strong> (
                {nextRace?.country})
              </span>
              <span className="hidden sm:inline text-gray-500">•</span>
              <span className="hidden sm:inline text-[11px] text-gray-400">
                Automatic Progression: Switches as soon as this Grand Prix
                concludes
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions & Historical Records Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          {/* Refresh Real Telemetry Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh starting grid telemetry and recalculate win probabilities"
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#101724] hover:bg-[#1A253A] active:scale-[0.98] text-gray-100 hover:text-white border border-white/10 hover:border-[#00F0FF]/60 hover:glow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] flex items-center justify-center gap-2 transition-all duration-200 shadow-md disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00F0FF]" : "text-[#00F0FF]"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isLoading ? "Recalculating..." : "Refresh Telemetry"}</span>
          </button>

          {/* Toggle Past Records History Ledger */}
          {onToggleHistoryLedger && (
            <button
              onClick={onToggleHistoryLedger}
              aria-label={
                isViewingHistory
                  ? "Close past accuracy records"
                  : "Open past accuracy records and audit ledger"
              }
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 border shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] ${isViewingHistory ? "bg-[#00F0FF] text-black border-[#00F0FF] font-black hover:bg-[#33FFF0] glow-primary" : "bg-[#101724] hover:bg-[#1A253A] text-gray-100 hover:text-white border-white/10 hover:border-[#00F0FF]/50"}`}
            >
              <span>
                {isViewingHistory
                  ? "Viewing History 📜"
                  : "Past Records & Accuracy 📜"}
              </span>
            </button>
          )}

          {/* Return to Upcoming Austin Race if viewing history */}
          {isViewingHistory && onReturnToUpcoming && (
            <button
              onClick={onReturnToUpcoming}
              aria-label="Return to upcoming United States Grand Prix focus"
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF1801] hover:bg-[#FF351F] active:scale-[0.98] text-white transition-all duration-200 shadow-lg shadow-[#FF1801]/30 hover:shadow-[#FF1801]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center justify-center gap-1.5"
            >
              <span>← Return to Austin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
