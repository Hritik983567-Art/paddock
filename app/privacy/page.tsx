'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      {/* Legal Review Warning Header */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs font-mono">
        <div className="font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>LEGAL REVIEW NOTICE</span>
        </div>
        <p>
          This Privacy Policy accurately documents the technical data practices implemented within the Paddock codebase. Official business entity details, operating jurisdiction, and formal legal notices must be reviewed and finalized by qualified legal counsel prior to enterprise publishing.
        </p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // PRIVACY POLICY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Codebase Version 0.1.0
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Data Controller &amp; Application Scope
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            This Privacy Policy governs the collection, storage, and processing of personal information by the <strong>Paddock Telemetry Analytics</strong> web application. Paddock provides real-time and historical Formula 1 telemetry, lap timing, driver statistics, and pit strategy modeling.
          </p>
        </section>

        {/* Section 2: Data Collected */}
        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Verified Data Collection Inventory
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            We collect only the essential technical data required to operate user authentication, persist interface team themes, and serve race telemetry:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-2">
            <li><strong>Account Credentials</strong>: User display name, email address, and hashed authentication secrets stored via Supabase Authentication or local database proxy.</li>
            <li><strong>Session Authentication Tokens</strong>: JSON Web Tokens (JWT) stored in browser LocalStorage (`paddock_auth_token`) to maintain authenticated pit-wall sessions.</li>
            <li><strong>Interface Preferences</strong>: Selected F1 team livery color themes (`paddock_theme`) stored in LocalStorage.</li>
            <li><strong>Server Access Logs</strong>: Anonymized IP address, user-agent, and route timestamps collected for security auditing and API rate limiting.</li>
          </ul>
        </section>

        {/* Section 3: Third-Party Data Processors */}
        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Third-Party Telemetry Services &amp; APIs
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock proxies open Formula 1 telemetry and timing data from the following third-party infrastructure providers:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-2">
            <li><strong>Jolpica / Ergast F1 Open Data API</strong>: Source for historical standings, lap splits, qualifying results, and driver profiles.</li>
            <li><strong>Supabase Inc.</strong>: Cloud authentication infrastructure and session token verification (where configured).</li>
          </ul>
        </section>

        {/* Section 4: Cookies & Tracking */}
        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. Cookies &amp; Browser LocalStorage
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock uses <strong>zero third-party advertising cookies, zero cross-site tracking pixels, and zero marketing scripts</strong>. Browser LocalStorage is used exclusively for essential functional purposes (session authentication and team theme selection). For full details, review our <Link href="/cookies" className="text-cyan-400 underline">Cookie Policy</Link>.
          </p>
        </section>

        {/* Section 5: Data Retention & Account Deletion */}
        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            5. User Rights &amp; Account Deletion
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Users retain full control over their account data. You may update your profile or submit an account deletion request at any time via <Link href="/account" className="text-cyan-400 underline">Account Settings</Link>. Upon deletion confirmation, your user credentials and preference records are permanently purged from database storage.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            6. Privacy Inquiries &amp; Contact
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            For privacy inquiries, technical data requests, or security vulnerability disclosures, please visit our <Link href="/support" className="text-cyan-400 underline">Support Desk</Link> or inspect our <Link href="/security" className="text-cyan-400 underline">Security Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
