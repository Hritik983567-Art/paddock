'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // TERMS OF SERVICE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Acceptance of Terms
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            By accessing, browsing, or registering an account on the <strong>Paddock Telemetry Analytics</strong> application, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must discontinue access immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Service Description &amp; Open Data Disclaimer
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock provides non-commercial Formula 1 fan analytics, session replay, telemetry visualization, and pit strategy simulation tools. Race telemetry data is proxied from public open data APIs (Jolpica / Ergast). Telemetry and timing benchmarks are provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis without warranty of uninterrupted precision.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Account Responsibilities &amp; Security
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Users are responsible for maintaining the confidentiality of their authentication credentials and session tokens. You agree not to attempt unauthorized access to API proxies, bypass rate limits, or engage in automated scraping. See our <Link href="/acceptable-use" className="text-cyan-400 underline">Acceptable Use Policy</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. Trademark &amp; Intellectual Property
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Formula 1, F1, FORMULA ONE, GRAND PRIX, and related marks are trademarks of Formula One Licensing B.V. Paddock is an independent, non-official fan telemetry application and is not affiliated with, endorsed by, or sponsored by Formula 1, the FIA, or any F1 constructor. For full trademark disclosures, view our <Link href="/disclaimer" className="text-cyan-400 underline">Disclaimer</Link>.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            5. Termination &amp; Service Modifications
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            We reserve the right to suspend or terminate user sessions, update telemetry features, or modify server proxy routes at any time to preserve system security and bandwidth performance.
          </p>
        </section>
      </div>
    </div>
  );
}
