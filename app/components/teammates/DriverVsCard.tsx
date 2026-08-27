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
    const borderColor = isCyan ? '#38BDF8' : '#F59E0B';

    return (
      <div
        style={{ borderColor }}
        className="w-24 h-24 rounded-full bg-[#0D121F] border-4 flex flex-col items-center justify-center shadow-xl relative"
      >
        <span className="text-2xl font-black text-white tracking-widest font-mono">
          {initials}
        </span>
        {number && (
          <span className="text-xs font-mono font-extrabold text-cyan-400 mt-0.5">
            #{number}
          </span>
        )}
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
