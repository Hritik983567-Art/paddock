'use client';

import React from 'react';

export default function OfflineState() {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    // Initialize state
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-600 text-slate-950 px-4 py-2 text-center text-xs font-mono font-black shadow-2xl flex items-center justify-center gap-2 border-b border-amber-400">
      <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></span>
      <span>⚠️ TELEMETRY CONNECTION OFFLINE — DISPLAYING CACHED SESSION DATA</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-3 px-2 py-0.5 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded text-[10px] uppercase font-bold tracking-wider"
      >
        RECONNECT 🔄
      </button>
    </div>
  );
}
