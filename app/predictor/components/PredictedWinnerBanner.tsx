"use client";

import { getDriverMediaProfile } from "../../lib/driverMediaService";
import { getTeamColor } from "../../utils/api";

interface PredictedWinnerProps {
  winner: {
    driverId: string;
    driverCode: string;
    winProbability: number;
    winProbabilityPct: number;
    constructorName: string;
    gridPosition: number;
  };
  seasonYear: number;
  circuitName: string;
}

export default function PredictedWinnerBanner({
  winner,
  seasonYear,
  circuitName,
}: PredictedWinnerProps) {
  const activeSeasonStr =
    seasonYear && seasonYear >= 2025 ? String(seasonYear) : "2026";
  const profile = getDriverMediaProfile(winner.driverId, activeSeasonStr);
  const teamColor =
    profile.teamColor ||
    getTeamColor(
      profile.teamId ||
        winner.constructorName.toLowerCase().replace(/\s+/g, "_"),
    );

  return (
    <section
      aria-label="Predicted Grand Prix Winner"
      className="stitch-card-machined relative z-10 overflow-hidden rounded-2xl p-5 sm:p-7 mb-8 shadow-2xl"
    >
      {/* Background Accent Glow */}
      <div
        className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: teamColor || "#FF1801" }}
      />

      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse"></span>
          <span className="font-bold text-white tracking-wider uppercase">
            Projected Race Winner
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="data-chip px-2.5 py-0.5 text-[10px] text-cyan-300 font-bold border-cyan-500/30">
            {circuitName || "GRAND PRIX"}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Driver Visual & Identity */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full md:w-auto">
          {/* Driver Portrait */}
          <div className="relative">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 bg-[#05070A] shadow-inner flex items-center justify-center transition-transform hover:scale-105"
              style={{
                borderColor: teamColor || "#FF1801",
                boxShadow: `0 0 20px ${teamColor}35`,
              }}
            >
              {profile.headshotUrl ? (
                <img
                  src={profile.headshotUrl}
                  alt={profile.name || winner.driverCode}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-3xl font-black text-white font-mono">
                  {winner.driverCode}
                </span>
              )}
            </div>

            {/* Grid Position Badge */}
            <span
              className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase text-black shadow-lg font-mono"
              style={{ backgroundColor: "#FFB800" }}
            >
              P{winner.gridPosition}
            </span>
          </div>

          {/* Name & Constructor */}
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="data-chip px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 border-white/10">
                Paddock Top Projected Winner
              </span>
              <span className="text-xs">{profile.flag || "🏁"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {profile.name || winner.driverCode}
              <span className="text-cyan-400 text-lg font-mono ml-2 font-bold">
                #{profile.number || ""}
              </span>
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: teamColor || "#FF1801" }}
              />
              <span className="text-sm font-semibold text-gray-200">
                {profile.teamName || winner.constructorName}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="data-chip px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border-amber-500/30">
                {winner.gridPosition === 1
                  ? "Pole Sitter"
                  : `Starting P${winner.gridPosition}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Win Probability Gauge & Forecast Disclaimer */}
        <div className="flex flex-col items-center md:items-end w-full md:w-auto text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Win Probability Forecast
          </span>

          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl sm:text-5xl font-black font-mono tracking-tight"
              style={{
                color: "#00F0FF",
                textShadow: "0 0 20px rgba(0, 240, 255, 0.4)",
              }}
            >
              {winner.winProbabilityPct.toFixed(1)}%
            </span>
          </div>

          <div className="w-full sm:w-48 bg-[#05070A] h-2.5 rounded-full overflow-hidden mt-2 mb-2 border border-white/10 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(5, winner.winProbabilityPct))}%`,
                background: `linear-gradient(90deg, #00FF9C, ${teamColor || "#00F0FF"})`,
                boxShadow: "0 0 10px rgba(0, 240, 255, 0.5)",
              }}
            />
          </div>

          {/* Causal Disclaimer Note */}
          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed font-sans">
            <strong className="text-slate-200 font-semibold">
              Statistical Forecast:
            </strong>{" "}
            Derived from post-qualifying pace differentials, starting track
            position, and rolling form. Final outcome depends on race-day tyre
            degradation, engine reliability, and pit strategy.
          </p>
        </div>
      </div>
    </section>
  );
}
