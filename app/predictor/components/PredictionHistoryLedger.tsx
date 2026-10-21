"use client";

import { useState, useEffect } from "react";
import {
  getHistoricalAccuracyLedger,
  RaceAccuracyAudit,
} from "../../lib/raceResultsService";

interface PredictionHistoryLedgerProps {
  onSelectRound: (season: string, round: string) => void;
  selectedRound?: string;
  selectedSeason?: string;
  onReturnToActive: () => void;
  isViewingHistory: boolean;
}

export default function PredictionHistoryLedger({
  onSelectRound,
  selectedRound,
  selectedSeason,
  onReturnToActive,
  isViewingHistory,
}: PredictionHistoryLedgerProps) {
  const [completedRaces, setCompletedRaces] = useState<RaceAccuracyAudit[]>(
    () => getHistoricalAccuracyLedger(),
  );

  useEffect(() => {
    setCompletedRaces(getHistoricalAccuracyLedger());
  }, []);

  const verifiedRaces = completedRaces.filter((r) => r.isCompleted);
  const totalVerified = verifiedRaces.length;
  const winnerHits = verifiedRaces.filter(
    (r) => r.accuracyVerdict === "winner_hit",
  ).length;
  const podiumHits = verifiedRaces.filter(
    (r) =>
      r.accuracyVerdict === "winner_hit" || r.accuracyVerdict === "podium_hit",
  ).length;

  const top1AccuracyPct =
    totalVerified > 0 ? Math.round((winnerHits / totalVerified) * 100) : 0;
  const top3AccuracyPct =
    totalVerified > 0 ? Math.round((podiumHits / totalVerified) * 100) : 0;

  return (
    <section
      aria-label="Prediction History and Accuracy Ledger"
      className="relative z-10 stitch-card-machined rounded-2xl p-5 sm:p-7 mb-8 shadow-2xl"
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="stitch-live-dot" />
          <span className="text-white font-bold tracking-wider uppercase">
            Prediction Accuracy History
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="stitch-data-chip text-[9px] text-[#00FF9C] border-[#00FF9C]/30">
            OFFICIAL FIA RESULTS VERIFIED
          </span>
        </div>
      </div>

      {/* Header and Aggregate Accuracy Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Prediction History &amp; Accuracy Records
            </h2>
            <span className="stitch-data-chip text-[11px] text-[#00F0FF] border-[#00F0FF]/30 font-bold">
              Origin: Round 19 (Austin)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Historical audit records initiate starting from this race (United
            States Grand Prix). As this Grand Prix and future races finish,
            predictions and official FIA classifications will be recorded here
            to track accuracy over time.
          </p>
        </div>

        {/* Global Performance Calibration Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#101722] border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] shadow-md">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Top-1 Accuracy
            </span>
            <span className="text-base sm:text-xl font-black text-[#00FF9C] font-mono tracking-tight drop-shadow-[0_0_8px_rgba(0,255,156,0.3)]">
              {totalVerified > 0 ? `${top1AccuracyPct}%` : "—"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {totalVerified > 0
                ? `(${winnerHits}/${totalVerified} Hits)`
                : "(Starts from Austin)"}
            </span>
          </div>

          <div className="bg-[#101722] border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] shadow-md">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Podium Coverage
            </span>
            <span className="text-base sm:text-xl font-black text-[#00F0FF] font-mono tracking-tight drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">
              {totalVerified > 0 ? `${top3AccuracyPct}%` : "—"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block">
              {totalVerified > 0
                ? `(${podiumHits}/${totalVerified} in Top-3)`
                : "(Round 19 Origin)"}
            </span>
          </div>

          {isViewingHistory && (
            <button
              onClick={onReturnToActive}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-[#00F0FF] hover:bg-[#33F5FF] text-black transition-all shadow-[0_0_16px_rgba(0,240,255,0.3)] flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            >
              <span>← RETURN TO AUSTIN</span>
            </button>
          )}
        </div>
      </div>

      {/* Historical Ledger Table / Cards */}
      <div className="space-y-3">
        {completedRaces.map((race: RaceAccuracyAudit) => {
          const isCurrentSelected =
            isViewingHistory &&
            selectedRound === race.round &&
            selectedSeason === race.season;

          return (
            <div
              key={`${race.season}_${race.round}`}
              className={`p-4 rounded-xl border transition-all ${
                isCurrentSelected
                  ? "bg-[#15202E] border-[#00F0FF] ring-1 ring-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  : "bg-[#101722] hover:bg-[#141C29] border-white/10"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Race Identity */}
                <div className="flex items-start sm:items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#090D14] border border-white/10 flex items-center justify-center font-mono font-black text-xs text-[#00F0FF] shadow-inner flex-shrink-0">
                    R{race.round}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                        {race.raceName}
                      </h3>
                      <span className="stitch-data-chip text-[9px] text-slate-400">
                        {race.season}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {race.circuitName} •{" "}
                      <span className="font-mono text-slate-300">
                        {race.date}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Model Prediction vs Actual Winner */}
                <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 text-left">
                  {/* Predicted Pick */}
                  <div className="bg-[#090D14] border border-white/10 rounded-lg p-2.5">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">
                      Forecast Pick
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                      <span>
                        {race.predictedWinner?.driverCode ||
                          (race.isCompleted ? "—" : "Pending Quali")}
                      </span>
                      {race.predictedWinner?.winProbabilityPct != null && (
                        <span className="text-[11px] text-[#00F0FF] font-mono font-bold">
                          ({race.predictedWinner.winProbabilityPct}%)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate font-sans">
                      {race.predictedWinner?.constructorName ||
                        (race.isCompleted
                          ? "Unclassified"
                          : "Saturday Shootout")}
                    </span>
                  </div>

                  {/* Official Winner */}
                  <div className="bg-[#090D14] border border-white/10 rounded-lg p-2.5">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">
                      Official Winner
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                      {race.actualWinner?.driverCode ? (
                        <span>🏆 {race.actualWinner.driverCode}</span>
                      ) : (
                        <span className="text-amber-400">⏱️ Awaiting Flag</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate font-sans">
                      {race.actualWinner?.driverName ||
                        (race.isCompleted
                          ? "Official Results"
                          : "Scheduled Race")}
                    </span>
                  </div>

                  {/* Accuracy Verdict */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
                      Audit Result
                    </span>
                    {race.accuracyVerdict === "winner_hit" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/40 shadow-[0_0_10px_rgba(0,255,156,0.15)] w-fit">
                        <span>✅ Winner Hit (P1)</span>
                      </span>
                    ) : race.accuracyVerdict === "podium_hit" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.15)] w-fit">
                        <span>🥉 Podium Hit (P2/P3)</span>
                      </span>
                    ) : race.accuracyVerdict === "upset" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/40 w-fit">
                        <span>⚠️ Race Upset</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                        <span>Tracking Origin (Pending)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Inspect Action */}
                <div className="flex items-center justify-end w-full md:w-auto">
                  <button
                    onClick={() => {
                      if (!race.isCompleted) {
                        onReturnToActive();
                      } else {
                        onSelectRound(race.season, race.round);
                      }
                    }}
                    aria-label={`Inspect prediction and telemetry data for ${race.raceName} ${race.season}`}
                    className={`min-h-[44px] w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] shadow-sm ${
                      isCurrentSelected
                        ? "bg-[#00F0FF] hover:bg-[#33F5FF] text-black border-[#00F0FF] font-black shadow-[0_0_14px_rgba(0,240,255,0.3)]"
                        : "bg-[#131A26] hover:bg-[#1A2333] text-slate-200 hover:text-white border-white/10 hover:border-[#00F0FF]/50"
                    }`}
                  >
                    {!race.isCompleted
                      ? "Active Race View 🎯"
                      : isCurrentSelected
                        ? "Active in View 👁️"
                        : "Inspect Full Data 🔍"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
