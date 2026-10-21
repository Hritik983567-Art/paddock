"use client";

import { DriverPredictionEntry } from "../../lib/racePredictorService";

interface PredictionHistoryComparisonProps {
  predictions: DriverPredictionEntry[];
  actualResults: Record<string, number>; // driverCode -> actual finish
  actualWinnerCode?: string;
  isCompletedRace: boolean;
  onToggleCompare: () => void;
  showComparison: boolean;
}

export default function PredictionHistoryComparison({
  predictions,
  actualResults,
  actualWinnerCode,
  isCompletedRace,
  onToggleCompare,
  showComparison,
}: PredictionHistoryComparisonProps) {
  if (!isCompletedRace) return null;

  const topPredictedDriver = predictions[0];
  const isTop1Hit =
    actualWinnerCode && topPredictedDriver?.driverCode === actualWinnerCode;

  // Top 3 Podium Coverage Check
  const top3Predicted = predictions.slice(0, 3).map((d) => d.driverCode);
  const isTop3Hit = actualWinnerCode
    ? top3Predicted.includes(actualWinnerCode)
    : false;

  return (
    <section
      aria-label="Pre-Race Forecast vs Official Results Audit"
      className="relative z-10 bg-[#0C1017] border border-[#2E3746] rounded-xl p-4 sm:p-6 mb-8 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2E3746]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Official Race Results Audit
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/30">
              Completed Grand Prix
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Compare immutable pre-race forecast against official Grand Prix
            finishing positions.
          </p>
        </div>

        <button
          onClick={onToggleCompare}
          aria-label={
            showComparison
              ? "Hide finishing position comparison column from table"
              : "Show finishing position comparison column in table"
          }
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFE0] shadow-sm ${showComparison ? "bg-[#FF1801] text-white border-[#FF1801] hover:bg-[#FF351F]" : "bg-[#141923] text-gray-200 border-[#2E3746] hover:border-[#00FFE0]/50 hover:text-white"}`}
        >
          <span>
            {showComparison ? "Hide Table Comparison" : "Show In Table"}
          </span>
        </button>
      </div>

      {/* Metrics Audit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
        {/* Top-1 Accuracy */}
        <div className="bg-[#141923] border border-[#2E3746] rounded-lg p-3.5 shadow-md">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-300 block mb-1">
            Top-1 Winner Pick
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-white">
              {topPredictedDriver ? topPredictedDriver.driverCode : "N/A"}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${isTop1Hit ? "bg-[#00F090]/20 text-[#00F090] border border-[#00F090]/40" : "bg-[#FF1801]/20 text-[#FF1801] border border-[#FF1801]/40"}`}
            >
              {isTop1Hit ? "✅ Winner Hit" : "❌ Missed Winner"}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 mt-1.5 block">
            Actual Winner:{" "}
            <strong className="text-white font-bold">
              {actualWinnerCode || "Classified P1"}
            </strong>
            {Object.keys(actualResults).length > 0 && (
              <span className="text-[10px] text-slate-400 ml-1">
                ({Object.keys(actualResults).length} classified)
              </span>
            )}
          </span>
        </div>

        {/* Top-3 Podium Coverage */}
        <div className="bg-[#141923] border border-[#2E3746] rounded-lg p-3.5 shadow-md">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-300 block mb-1">
            Top-3 Coverage
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-white">
              {top3Predicted.join(", ")}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${isTop3Hit ? "bg-[#00FFE0]/20 text-[#00FFE0] border border-[#00FFE0]/40" : "bg-[#1F2937] text-gray-300"}`}
            >
              {isTop3Hit ? "🥉 In Top-3" : "Outside Top-3"}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 mt-1.5 block">
            Actual winner appeared in top 3 predicted candidates.
          </span>
        </div>

        {/* Immutability Note */}
        <div className="bg-[#141923] border border-[#2E3746] rounded-lg p-3.5 shadow-md">
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-300 block mb-1">
            Integrity Ledger
          </span>
          <span className="text-xs font-bold text-white block">
            Pre-Race Snapshot Preserved
          </span>
          <p className="text-[10px] text-slate-300 mt-1.5 leading-normal">
            Forecast snapshots are locked after qualifying and never overwritten
            with post-race knowledge.
          </p>
        </div>
      </div>
    </section>
  );
}
