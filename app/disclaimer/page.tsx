'use client';

import React from 'react';

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // TRADEMARK &amp; DATA DISCLAIMER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            F1 Open Data &amp; Trademark Disclaimer
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Non-Affiliation Statement
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            <strong>Paddock Telemetry Analytics</strong> is an independent, non-commercial fan application built for sports statistics exploration and educational pit-wall telemetry modeling. <strong>Paddock is NOT associated, affiliated, endorsed, sponsored, or connected in any official capacity with Formula 1, Formula One Management, Formula One Licensing B.V., the Fédération Internationale de l&apos;Automobile (FIA), or any Formula 1 racing team or constructor.</strong>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Trademark Attributions
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Formula 1, F1, FORMULA ONE, GRAND PRIX, PADDOCK CLUB, and related marks are registered trademarks owned by <strong>Formula One Licensing B.V.</strong> All team names, logos, driver names, circuit names, and sponsor mentions referenced within this software are used purely for nominative, descriptive, and educational identification under fair use principles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Telemetry &amp; Open Data Precision
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Race timing, sector splits, speed trap figures, and pit strategy simulations are generated from public open telemetry proxies (Jolpica / Ergast F1 data proxy). While we strive for high precision, timing metrics are provided for informational and analytical entertainment purposes only and should not be relied upon for official timing adjudication.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. Limitation of Liability
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock and its developers shall not be held liable for any inaccuracies in proxied telemetry feeds, server downtime, or third-party data API interruptions.
          </p>
        </section>
      </div>
    </div>
  );
}
