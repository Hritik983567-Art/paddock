'use client';

import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            LEGAL DISCLOSURE // STORAGE &amp; COOKIE POLICY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Cookie &amp; Browser Storage Policy
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Essential Functional LocalStorage Policy
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            The Paddock application uses browser <strong>LocalStorage</strong> strictly for essential functional purposes. We do <strong>NOT</strong> store advertising cookies, marketing trackers, or third-party behavioral analytics cookies.
          </p>
        </section>

        {/* LocalStorage Inventory Table */}
        <section className="space-y-3">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Verified LocalStorage Key Inventory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950 text-cyan-400 border-b border-slate-800">
                  <th className="p-3">Storage Key</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">paddock_auth_token</td>
                  <td className="p-3 text-emerald-400">Strictly Essential</td>
                  <td className="p-3">Stores encrypted JWT session token to keep analyst logged into pit wall.</td>
                  <td className="p-3 text-slate-400">Session / Persistent until logout</td>
                </tr>
                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">paddock_theme</td>
                  <td className="p-3 text-cyan-400">Functional Preference</td>
                  <td className="p-3">Persists user&apos;s selected F1 team livery color theme (e.g. Ferrari, Red Bull, McLaren).</td>
                  <td className="p-3 text-slate-400">Persistent</td>
                </tr>
                <tr className="hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-white">sb-*-auth-token</td>
                  <td className="p-3 text-emerald-400">Strictly Essential</td>
                  <td className="p-3">Supabase client SDK session state for OAuth callback verification.</td>
                  <td className="p-3 text-slate-400">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. How to Clear Browser Storage
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            You can clear or block LocalStorage at any time through your browser settings:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-2 font-mono">
            <li><strong>Chrome / Edge</strong>: Settings → Privacy and Security → Site Settings → Storage → Clear data.</li>
            <li><strong>Firefox</strong>: Settings → Privacy &amp; Security → Cookies and Site Data → Clear Data.</li>
            <li><strong>Safari</strong>: Preferences → Privacy → Manage Website Data → Remove All.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. ePrivacy &amp; GDPR Compliance Note
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Under the EU ePrivacy Directive and GDPR guidelines, functional storage strictly required to deliver user-requested services (session authentication and team theme selection) does not require explicit cookie banner consent. Zero tracking or marketing cookies are deployed.
          </p>
        </section>
      </div>
    </div>
  );
}
