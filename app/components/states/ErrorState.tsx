'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  errorDetails?: string | Error;
  correlationId?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Telemetry Processing Error',
  message = 'An unexpected error occurred while communicating with the pit-wall telemetry server or data proxy.',
  errorDetails,
  correlationId = `ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  onRetry,
}: ErrorStateProps) {
  const [showTechnical, setShowTechnical] = React.useState(false);
  const detailStr = typeof errorDetails === 'object' && errorDetails !== null ? errorDetails.message : errorDetails;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-red-950/40 border border-red-800/60 shadow-2xl backdrop-blur-md max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
        🚨
      </div>

      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono uppercase mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mb-4">
        {message}
      </p>

      <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 bg-red-950/60 px-3 py-1 rounded border border-red-800/80 mb-6">
        <span>Correlation ID:</span>
        <span className="font-bold text-white select-all">{correlationId}</span>
      </div>

      {detailStr && (
        <div className="w-full mb-6 text-left">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 underline mb-2 flex items-center gap-1"
          >
            <span>{showTechnical ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics'}</span>
            <span>{showTechnical ? '▲' : '▼'}</span>
          </button>
          
          {showTechnical && (
            <pre className="p-3 bg-black/80 rounded-lg border border-red-900/60 text-[10px] font-mono text-red-300 overflow-x-auto whitespace-pre-wrap max-h-36">
              {detailStr}
            </pre>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <span>RETRY TELEMETRY FETCH</span>
            <span>🔄</span>
          </button>
        )}

        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          RETURN TO PIT WALL
        </Link>
        
        <Link
          href="/support"
          className="px-4 py-2.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
        >
          Help Center
        </Link>
      </div>
    </div>
  );
}
