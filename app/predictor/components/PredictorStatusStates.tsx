"use client";

interface QualifyingNotCompletedProps {
  raceName: string;
  season: string;
  round: string;
  onViewHistory?: () => void;
}

export function QualifyingNotCompletedState({
  raceName,
  season,
  round,
  onViewHistory,
}: QualifyingNotCompletedProps) {
  return (
    <div className="relative z-10 stitch-card-machined rounded-2xl p-6 sm:p-10 shadow-2xl my-6">
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-6 text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#FFB800]" />
          <span className="text-white font-bold tracking-wider uppercase">
            Qualifying Grid In Progress
          </span>
        </div>
        <span className="stitch-data-chip text-[9px] text-amber-400 border-amber-500/30 font-bold">
          AWAITING SATURDAY QUALIFYING
        </span>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-[#101722] border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(255,184,0,0.15)]">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <span className="stitch-data-chip text-xs text-amber-400 border-amber-400/40 inline-flex items-center gap-2 mb-3 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          SESSION STATUS: PRE-QUALIFYING (GRID PENDING)
        </span>

        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Qualifying Not Yet Completed
        </h3>

        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-6 font-sans">
          The Paddock Race Predictor operates strictly after official Saturday
          qualifying. Predictions for{" "}
          <strong className="text-white font-mono">
            {raceName} ({season} Round {round})
          </strong>{" "}
          will unlock as soon as the FIA finalizes the 20-car starting grid and
          penalties.
        </p>

        {/* 3 Telemetry Clarification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6 text-left">
          <div className="bg-[#101722] border border-amber-500/20 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-1.5 text-amber-400">
              <span className="text-base">🚦</span>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Starting Grid Pending
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Driver positions (P1–P20) cannot be known before Saturday.
              Qualifying crashes, mechanical issues, or engine penalties change
              the starting order.
            </p>
          </div>

          <div className="bg-[#101722] border border-[#00F0FF]/20 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-1.5 text-[#00F0FF]">
              <span className="text-base">🎯</span>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Why Positions are Held
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              In modern F1, starting on the front row dictates over 75% of race
              outcomes. Predicting before qualifying produces speculative
              guesswork.
            </p>
          </div>

          <div className="bg-[#101722] border border-[#00FF9C]/20 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-1.5 text-[#00FF9C]">
              <span className="text-base">⚡</span>
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Unlocks Post-Quali
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Once Saturday concludes, the full 20-driver starting grid, flying
              lap deltas to pole, and calibrated win probabilities unlock
              immediately.
            </p>
          </div>
        </div>

        {/* Explore Past Records Link */}
        {onViewHistory && (
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={onViewHistory}
              aria-label="View past Grand Prix prediction records and accuracy ledger"
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#131A26] hover:bg-[#1A2333] active:scale-[0.98] text-slate-200 hover:text-white border border-white/10 hover:border-[#00F0FF]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <span>View Past Grand Prix Records & Accuracy Ledger 📜</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PredictorLoadingSkeleton() {
  return (
    <div className="space-y-6 my-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-28 rounded-2xl stitch-card-machined border-white/10" />

      {/* Hero winner skeleton */}
      <div className="h-44 rounded-2xl stitch-card-machined border-white/10" />

      {/* Table skeleton */}
      <div className="h-96 rounded-2xl stitch-card-machined border-white/10 p-6 space-y-4">
        <div className="h-6 w-1/3 bg-[#131A26] rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#131A26]/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PredictorErrorProps {
  message?: string;
  onRetry: () => void;
}

export function PredictorErrorState({ message, onRetry }: PredictorErrorProps) {
  return (
    <div className="stitch-card-machined border-[#FF3366]/40 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(255,51,102,0.15)] my-6">
      <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-2 mb-5 text-[10px] font-mono tracking-wider text-slate-400">
        <span className="w-2 h-2 rounded-full bg-[#FF3366] shadow-[0_0_8px_#FF3366]" />
        <span className="text-white font-bold tracking-wider uppercase">
          Telemetry Stream Offline
        </span>
      </div>

      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#FF3366]/10 flex items-center justify-center text-[#FF3366]">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Prediction Feed Offline
      </h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed font-sans">
        {message ||
          "Unable to load predictions at this moment. Please check your connection and retry."}
      </p>

      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF3366] hover:bg-[#FF4D7A] text-white transition-all shadow-[0_0_16px_rgba(255,51,102,0.3)] active:scale-[0.98]"
      >
        RETRY CONNECTION ↻
      </button>
    </div>
  );
}

export function ProvisionalDataNotice() {
  return (
    <div className="bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2 mb-4 font-mono">
      <svg
        className="w-4 h-4 flex-shrink-0 text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>
        <strong className="text-white font-bold">
          Provisional Starting Grid:
        </strong>{" "}
        Technical or steward penalties may still be under FIA review.
      </span>
    </div>
  );
}
