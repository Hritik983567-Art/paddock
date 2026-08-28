'use client';

import React from 'react';
import ErrorState from './components/states/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors safely
    console.error('Unhandled Paddock Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <ErrorState
        title="Critical Telemetry Fault"
        message="An unhandled error interrupted the Paddock rendering pipeline."
        errorDetails={error}
        correlationId={error.digest || `FAULTRUN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
        onRetry={reset}
      />
    </div>
  );
}
