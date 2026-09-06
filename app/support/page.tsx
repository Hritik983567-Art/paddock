'use client';

import React from 'react';
import Link from 'next/link';

export default function SupportHelpCenterPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');

  const faqs = [
    {
      category: 'telemetry',
      question: 'How often is live telemetry updated during F1 sessions?',
      answer: 'Live session telemetry updates in real-time via WebSocket and cached server polling at 240 FPS data resolution for speed, throttle, brake, and gear telemetry.',
    },
    {
      category: 'telemetry',
      question: 'Where does Paddock source Formula 1 timing and standings data?',
      answer: 'All historical standings, lap times, qualifying splits, and driver telemetry are sourced via the Jolpica and Ergast open F1 data proxies, synchronized with official FIA timing logs.',
    },
    {
      category: 'features',
      question: 'What is the Circuit Specialist comparison tool?',
      answer: 'The Circuit Specialist tool allows you to compare driver sector times, speed trap benchmarks, and cornering telemetry side-by-side across any historic or modern Grand Prix circuit.',
    },
    {
      category: 'features',
      question: 'How do I simulate pit-stop strategy in the Strategy Lab?',
      answer: 'Navigate to Strategy Lab (/lab), pick a Grand Prix circuit, select tyre compounds (Soft, Medium, Hard, Intermediate, Wet), adjust fuel load degradation curves, and model undercut vs overcut lap times.',
    },
    {
      category: 'account',
      question: 'How do I change my F1 Team theme accent colors?',
      answer: 'Open the header dropdown or go to Account Settings (/account) to switch between Scuderia Ferrari, Red Bull, Mercedes, McLaren, Aston Martin, and Pit-Wall Red themes.',
    },
    {
      category: 'troubleshooting',
      question: 'What should I do if telemetry charts stall or show an offline banner?',
      answer: 'Check your network connection. Paddock automatically detects connectivity losses and serves local session caches. Click the "Reconnect 🔄" button on the offline banner once reconnected.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-slate-200">
      {/* Hero Title */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 rounded-full font-mono text-[11px] font-black uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md">
          SUPPORT &amp; HELP CENTER
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white uppercase mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          Pit-Wall Knowledge Base &amp; FAQ
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Learn how to analyze live telemetry, simulate pit strategies, inspect driver 3D hologram pods, and troubleshoot data connections.
        </p>

        {/* Search Bar */}
        <div className="mt-6 max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search telemetry guides, strategy lab, keyboard shortcuts..."
            className="w-full px-5 py-3.5 bg-slate-950/90 border-2 border-slate-700 rounded-2xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-2xl backdrop-blur-xl ring-1 ring-cyan-500/20"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8 font-mono text-xs">
        {[
          { id: 'all', label: 'All Guides' },
          { id: 'telemetry', label: '📡 Telemetry & Timing' },
          { id: 'features', label: '🏎️ Tools & Simulators' },
          { id: 'account', label: '👤 Account & Themes' },
          { id: 'troubleshooting', label: '🛠️ Troubleshooting' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2.5 rounded-xl border transition-all backdrop-blur-xl ${
              activeCategory === tab.id
                ? 'border-cyan-400 bg-cyan-500/30 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50'
                : 'border-slate-700/80 bg-slate-950/85 text-slate-200 hover:text-white hover:bg-slate-900 hover:border-slate-500 shadow-lg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordion Grid */}
      <div className="space-y-4 mb-12">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl hover:border-cyan-500/40 transition-all"
            >
              <h3 className="text-sm font-black font-mono text-white mb-2 flex items-center gap-2">
                <span className="text-cyan-400">Q:</span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-slate-200 font-sans leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300">
            No matching help documentation found for &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-12">
        <h2 className="text-sm font-black font-mono text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>⌨️</span>
          <span>Pit-Wall Keyboard Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-200">Toggle Drawer Menu</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-cyan-500/40 font-bold text-[10px] shadow-sm">M</kbd>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-200">Refresh Telemetry</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-cyan-500/40 font-bold text-[10px] shadow-sm">R</kbd>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-200">Focus Driver Search</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-cyan-500/40 font-bold text-[10px] shadow-sm">/</kbd>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-200">Return to Pit Wall</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-cyan-500/40 font-bold text-[10px] shadow-sm">Esc</kbd>
          </div>
        </div>
      </div>

      {/* Contact Channel Notice */}
      <div className="p-6 rounded-3xl bg-slate-950/95 border border-slate-800 text-center shadow-2xl backdrop-blur-xl">
        <h3 className="text-sm font-black font-mono text-white uppercase mb-2">Still Need Technical Support?</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
          For technical issues, bug reports, or vulnerability disclosures, please review our security policy or contact our engineering desk.
        </p>
        <div className="flex justify-center gap-3 font-mono text-xs">
          <Link
            href="/security"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            Security &amp; Bug Disclosure →
          </Link>
          <Link
            href="/privacy"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            Privacy Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
