'use client';

import React from 'react';

export default function AcceptableUsePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // SYSTEM GOVERNANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Acceptable Use Policy
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Purpose &amp; Governance
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            This Acceptable Use Policy defines the permitted usage standards for accessing the Paddock Telemetry Analytics platform, authentication endpoints, and background open telemetry proxies (`/api/f1/*`).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Prohibited System Activities
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Users and automated clients are strictly prohibited from performing any of the following activities:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2 font-mono">
            <li><strong>Automated API Scraping Abuse</strong>: Launching high-frequency automated scraping scripts that overload background Jolpica/Ergast F1 proxy endpoints.</li>
            <li><strong>Credential Brute-Forcing</strong>: Attempting brute-force authentication attacks against `/api/auth/login` or password recovery endpoints.</li>
            <li><strong>Security Circumvention</strong>: Probing or attempting to exploit authentication tokens, Supabase JWT keys, or server headers.</li>
            <li><strong>Malicious Code Injection</strong>: Injecting cross-site scripting (XSS), SQL injection payloads, or malicious scripts into profile or support forms.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Rate Limits &amp; Infrastructure Preservation
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            To ensure fair bandwidth distribution across all motorsport analysts, Paddock enforces automated server rate-limiting on API routes. Requests exceeding burst rate thresholds will receive standard `429 Too Many Requests` responses.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. Enforcement &amp; Account Suspension
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Failure to comply with this Acceptable Use Policy may result in temporary IP rate limiting, account session termination, or permanent IP blocklisting.
          </p>
        </section>
      </div>
    </div>
  );
}
