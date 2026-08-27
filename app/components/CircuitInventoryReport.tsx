'use client';

import React, { useState } from 'react';
import { getCircuitInventoryReport } from '../lib/circuitCornersData';

export const CircuitInventoryReport: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const items = getCircuitInventoryReport();

  const totalCorners = items.length;
  const verifiedCount = items.filter((i) => i.hasRealPhoto).length;
  const missingCount = totalCorners - verifiedCount;

  return (
    <div className="my-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700/80 rounded-xl font-mono text-xs text-white transition-all shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-extrabold text-white uppercase tracking-widest text-xs">
            CORNER INVENTORY &amp; RECONNAISSANCE AUDIT REPORT
          </span>
          <span className="px-2.5 py-1 rounded-md text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500 font-extrabold shadow">
            {verifiedCount} / {totalCorners} VERIFIED REAL PHOTOS
          </span>
        </div>
        <span className="text-cyan-400 font-extrabold text-xs">
          {isOpen ? '▲ CLOSE' : '▼ VIEW INVENTORY DATABASE'}
        </span>
      </button>

      {/* Report Modal / Panel Body — Opaque High-Contrast Background */}
      {isOpen && (
        <div className="mt-3 bg-[#070A10] border-2 border-slate-700/90 rounded-xl p-5 font-mono text-xs shadow-2xl space-y-4 backdrop-blur-2xl">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/95 p-3 rounded-lg border border-slate-700 shadow-md">
              <span className="block text-[11px] font-bold text-slate-300 uppercase mb-1">TOTAL CORNERS</span>
              <span className="text-lg font-black text-white">{totalCorners}</span>
            </div>
            <div className="bg-emerald-950 p-3 rounded-lg border border-emerald-600/90 shadow-md">
              <span className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">VERIFIED REAL PHOTOS</span>
              <span className="text-lg font-black text-emerald-300">✓ {verifiedCount}</span>
            </div>
            <div className="bg-red-950 p-3 rounded-lg border border-red-700/90 shadow-md">
              <span className="block text-[11px] font-bold text-red-400 uppercase mb-1">REAL PHOTO UNAVAILABLE</span>
              <span className="text-lg font-black text-red-300">⚠ {missingCount}</span>
            </div>
          </div>

          {/* Detailed Inventory Table — 100% High Contrast Pure White Text */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-700 rounded-lg shadow-xl">
            <table className="w-full text-left border-collapse text-[11.5px]">
              <thead className="bg-[#111622] sticky top-0 border-b-2 border-slate-700 text-cyan-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-3">Circuit</th>
                  <th className="p-3">Corner Name</th>
                  <th className="p-3">Turn</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Primary License</th>
                  <th className="p-3">Source / Attribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#070A10] text-slate-100">
                {items.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className={`${idx % 2 === 0 ? 'bg-[#090D17]' : 'bg-[#0C101D]'} hover:bg-slate-800/80 transition-colors`}
                  >
                    <td className="p-3 font-extrabold text-amber-400 uppercase">{item.circuitId}</td>
                    <td className="p-3 font-extrabold text-white">{item.cornerName}</td>
                    <td className="p-3 font-bold text-slate-300">{item.turns}</td>
                    <td className="p-3">
                      {item.hasRealPhoto ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10.5px] font-extrabold shadow">
                          ✓ {item.status} ({item.photoCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-700 text-[10.5px] font-extrabold shadow">
                          ⚠ UNAVAILABLE
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-cyan-300">{item.primaryLicense}</td>
                    <td className="p-3 font-medium text-slate-200 font-mono">
                      {item.primarySource} ({item.primaryAttribution})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
