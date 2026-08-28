import React from 'react';
import { DriverInfo } from '../../lib/teammateDataService';

interface DriverVsCardProps {
  driverA: DriverInfo;
  driverB: DriverInfo;
  allDrivers: DriverInfo[];
  selectedDriverAId: string;
  selectedDriverBId: string;
  onSelectDriverA: (id: string) => void;
  onSelectDriverB: (id: string) => void;
  teamColor: string;
  mode: 'current' | 'historical';
}

export const DriverVsCard: React.FC<DriverVsCardProps> = ({
  driverA,
  driverB,
  allDrivers,
  selectedDriverAId,
  selectedDriverBId,
  onSelectDriverA,
  onSelectDriverB,
  teamColor,
  mode
}) => {
  const renderInitialsAvatar = (name: string, code: string, number?: string, isCyan?: boolean) => {
    const initials = code || name.split(' ').map(n => n[0]).join('').slice(0, 3);
    const mainColor = isCyan ? '#38BDF8' : '#F59E0B';

    return (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`helmGlow-${code}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#050810" stopOpacity="0.95"/>
            </linearGradient>
            <linearGradient id={`visRef-${code}`} x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.75"/>
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8"/>
            </linearGradient>
          </defs>

          {/* Platform Glow */}
          <ellipse cx="60" cy="128" rx="40" ry="7" fill="#000000" opacity="0.5"/>
          <ellipse cx="60" cy="128" rx="36" ry="5" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.7"/>

          {/* Collar */}
          <path d="M 28 116 C 36 100 84 100 92 116 C 96 122 24 122 28 116 Z" fill="#0F172A" stroke="#334155" strokeWidth="1.5"/>
          <path d="M 38 102 L 82 102 L 78 114 L 42 114 Z" fill={mainColor} opacity="0.85"/>

          {/* Helmet Shell */}
          <path d="M 26 66 C 26 28 42 14 60 14 C 78 14 94 28 94 66 C 94 88 88 104 60 104 C 32 104 26 88 26 66 Z" fill={`url(#helmGlow-${code})`} stroke="#475569" strokeWidth="2"/>

          {/* Crown Stripe */}
          <path d="M 52 15 L 68 15 L 66 45 L 54 45 Z" fill="#FFFFFF" opacity="0.85"/>

          {/* Visor */}
          <path d="M 32 46 C 45 42 75 42 88 46 C 94 64 92 78 84 82 C 60 86 36 84 36 82 C 28 78 26 64 32 46 Z" fill={`url(#visRef-${code})`} stroke="#00F0FF" strokeWidth="1.5"/>
          
          {/* Driver Code Badge inside Visor */}
          <text x="60" y="68" fill="#FFFFFF" fontFamily="monospace" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="1">{initials}</text>
          
          {/* Permanent Number Badge */}
          {number && (
            <text x="60" y="98" fill={mainColor} fontFamily="monospace" fontSize="11" fontWeight="900" textAnchor="middle">#{number}</text>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
        {/* DRIVER A CARD (3 Columns on Desktop) */}
        <div className="md:col-span-3 bg-[#0D121F] p-5 rounded-xl border-2 border-cyan-500/60 shadow-xl flex flex-col sm:flex-row items-center gap-4">
          {renderInitialsAvatar(driverA.name, driverA.code, driverA.permanentNumber, true)}
          <div className="flex-1 text-center sm:text-left">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              DRIVER A (PRIMARY)
            </span>
            <h2 className="text-xl font-black text-white mt-1 uppercase font-display">
              {driverA.name}
            </h2>
            <div className="text-xs text-slate-300 font-bold space-y-0.5 mt-1">
              <p>PERMANENT NUMBER: <span className="text-cyan-400 font-black">#{driverA.permanentNumber || 'N/A'}</span></p>
              <p>NATIONALITY: <span className="text-white font-extrabold">{driverA.nationality || 'N/A'}</span></p>
              <p>TEAM: <span className="text-amber-400 font-black">{driverA.teamName}</span></p>
            </div>

            {mode === 'historical' && (
              <select
                value={selectedDriverAId}
                onChange={(e) => onSelectDriverA(e.target.value)}
                className="mt-3 w-full bg-[#050810] border border-slate-700 text-white font-bold text-xs p-1.5 rounded"
              >
                {allDrivers.map(d => (
                  <option key={`a-${d.driverId}`} value={d.driverId}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* VS CENTRAL BADGE (1 Column on Desktop) */}
        <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
          <div className="w-14 h-14 rounded-full bg-[#0D121F] border-2 border-slate-700 flex items-center justify-center shadow-2xl">
            <span className="text-xl font-black italic bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
              VS
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase mt-1">
            HEAD-TO-HEAD
          </span>
        </div>

        {/* DRIVER B CARD (3 Columns on Desktop) */}
        <div className="md:col-span-3 bg-[#0D121F] p-5 rounded-xl border-2 border-amber-500/60 shadow-xl flex flex-col sm:flex-row items-center gap-4">
          {renderInitialsAvatar(driverB.name, driverB.code, driverB.permanentNumber, false)}
          <div className="flex-1 text-center sm:text-left">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-950 text-amber-400 border border-amber-800">
              DRIVER B (COMPARISON)
            </span>
            <h2 className="text-xl font-black text-white mt-1 uppercase font-display">
              {driverB.name}
            </h2>
            <div className="text-xs text-slate-300 font-bold space-y-0.5 mt-1">
              <p>PERMANENT NUMBER: <span className="text-amber-400 font-black">#{driverB.permanentNumber || 'N/A'}</span></p>
              <p>NATIONALITY: <span className="text-white font-extrabold">{driverB.nationality || 'N/A'}</span></p>
              <p>TEAM: <span className="text-cyan-400 font-black">{driverB.teamName}</span></p>
            </div>

            {mode === 'historical' && (
              <select
                value={selectedDriverBId}
                onChange={(e) => onSelectDriverB(e.target.value)}
                className="mt-3 w-full bg-[#050810] border border-slate-700 text-white font-bold text-xs p-1.5 rounded"
              >
                {allDrivers.map(d => (
                  <option key={`b-${d.driverId}`} value={d.driverId}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
