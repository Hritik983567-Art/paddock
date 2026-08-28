'use client';

import React from 'react';

export default function SecurityPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // SECURITY CONTROLS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Security &amp; Vulnerability Disclosure Policy
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Security Architecture &amp; Data Protection
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock employs industry-standard security practices to protect user sessions and server infrastructure:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-2 font-mono">
            <li><strong>Transport Security (TLS/HTTPS)</strong>: All communication between client browsers, API proxies, and Supabase database services is encrypted in transit using TLS 1.3 encryption.</li>
            <li><strong>Password Security</strong>: Passwords are hashed using salted cryptographic algorithms (Bcrypt / Argon2) prior to storage. Plaintext passwords are never logged or stored.</li>
            <li><strong>JWT Token Verification</strong>: Authenticated routes verify single-use or expiring JSON Web Tokens to prevent unauthorized session hijacking.</li>
            <li><strong>Input Sanitization</strong>: Form inputs and search filters are sanitized to prevent SQL injection and cross-site scripting (XSS) attacks.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Responsible Vulnerability Disclosure Program
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            We welcome security researchers and analysts to report potential security vulnerabilities responsibly. If you discover a vulnerability, please follow our responsible disclosure guidelines:
          </p>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
            <span className="text-emerald-400 font-bold block">✓ Responsible Disclosure Guidelines:</span>
            <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
              <li>Do not access, modify, or delete user data that does not belong to your test account.</li>
              <li>Do not perform Denial of Service (DoS/DDoS) attacks against telemetry endpoints.</li>
              <li>Provide sufficient technical reproduction steps in your report.</li>
              <li>Allow reasonable time for our engineering team to patch the issue before public disclosure.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Reporting Vulnerabilities
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            To report a security finding, please log your vulnerability details through our Support Desk or contact our security engineering team.
          </p>
        </section>
      </div>
    </div>
  );
}
