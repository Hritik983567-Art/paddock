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
  const DRIVER_HOLOGRAM_IMAGES: Record<string, string> = {
    hulkenberg: '/images/holograms/hulkenberg.jpg',
    verstappen: '/images/holograms/verstappen.jpg',
    hamilton: '/images/holograms/hamilton.jpg',
    leclerc: '/images/holograms/leclerc.jpg',
    bortoleto: '/images/holograms/bortoleto.jpg',
    albon: '/images/holograms/albon.jpg',
  };

  const renderInitialsAvatar = (name: string, code: string, number?: string, isCyan?: boolean) => {
    const surname = (name.split(' ').pop() || name).toUpperCase();
    const numDisplay = number && number !== '—' ? `#${number}` : '#00';
    const key = (code || surname).toLowerCase();
    const imgSrc = DRIVER_HOLOGRAM_IMAGES[key] || '/images/holograms/default.jpg';

    return (
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.4)] border-2 border-cyan-400/80 bg-slate-950 group hover:scale-105 transition-all duration-300 ring-1 ring-cyan-500/50">
        <img 
          src={imgSrc} 
          alt={surname} 
          className="w-full h-full object-cover rounded-xl contrast-[1.18] brightness-[1.05] saturate-[1.2] drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]" 
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        <div className="absolute top-0 inset-x-0 h-0.5 bg-cyan-400 opacity-90 shadow-[0_0_8px_#00f0ff]"></div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/90 backdrop-blur-md text-[10px] font-black text-cyan-300 tracking-widest font-mono shadow-xl flex items-center gap-1 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{surname}</span>
          <span className="text-amber-400 font-bold">{numDisplay}</span>
        </div>
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
