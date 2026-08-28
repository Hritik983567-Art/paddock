'use client';

import React from 'react';

export default function AccessibilityStatementPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            ACCESSIBILITY DISCLOSURE // WCAG GUIDELINES
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white uppercase">
            Accessibility Statement
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Effective Date: August 29, 2026 • Version 0.1.0
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            1. Our Accessibility Commitment
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Paddock Telemetry Analytics is committed to ensuring digital accessibility for sports fans, telemetry analysts, and users of all abilities. We continuously improve the user experience for everyone by applying relevant WCAG 2.1 accessibility guidelines across our web interfaces.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            2. Verified Accessibility Features Implemented
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">⌨️ Full Keyboard Navigation</span>
              <span className="text-slate-400 text-[11px]">All interactive navigation menus, team selectors, and driver search inputs support full keyboard tab order and focus rings.</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">🎨 High-Contrast Livery Themes</span>
              <span className="text-slate-400 text-[11px]">Dark high-contrast color palettes designed to meet WCAG AA contrast ratio thresholds for text legibility.</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">📢 Screen Reader ARIA Labels</span>
              <span className="text-slate-400 text-[11px]">Includes explicit ARIA landmarks (`aria-label`, `aria-hidden`, `sr-only`) on header controls and drawer menus.</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">🖼️ Alt Text on 3D Renders</span>
              <span className="text-slate-400 text-[11px]">Descriptive alt labels attached to all driver 3D Hologram Pod Bust renders and circuit track maps.</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            3. Known Technical Limitations
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            While we strive for comprehensive accessibility, complex real-time canvas chart renders (such as 240 FPS telemetry graphs) are inherently visual tools. We provide tabular data alternatives for key timing tables where available.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-wider">
            4. Accessibility Feedback &amp; Assistance
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            If you encounter accessibility barriers while using Paddock or require assistance in accessing telemetry data in an alternative format, please let us know via our Support Desk.
          </p>
        </section>
      </div>
    </div>
  );
}
