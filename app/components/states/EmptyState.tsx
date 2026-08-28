'use client';

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No Data Available',
  description = 'There is currently no telemetry or timing data recorded for this section.',
  icon = '📡',
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse">
        {icon}
      </div>
      
      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono uppercase mb-2">
        {title}
      </h3>
      
      <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <span>{actionLabel}</span>
          <span>→</span>
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <span>{actionLabel}</span>
          <span>🔄</span>
        </button>
      )}
    </div>
  );
}
