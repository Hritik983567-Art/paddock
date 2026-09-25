'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, ALL_F1_SEASONS } from '../utils/api';

interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    permanentNumber?: string;
    nationality?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
}

export default function StandingsPage() {
  const { selectedSeason, setSelectedSeason } = useSeason();
  const seasons = ALL_F1_SEASONS;

  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roundInfo, setRoundInfo] = useState('');

  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      setError('');
      try {
        const [dRes, cRes] = await Promise.all([
          getJSON(`${API_BASE}/${selectedSeason}/driverStandings.json`),
          getJSON(`${API_BASE}/${selectedSeason}/constructorStandings.json`)
        ]);

        const dObj = dRes as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ round: string; DriverStandings: DriverStanding[] }> } } } | null;
        const cObj = cRes as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ round: string; ConstructorStandings: ConstructorStanding[] }> } } } | null;

        const dTable = dObj?.MRData?.StandingsTable?.StandingsLists?.[0];
        const cTable = cObj?.MRData?.StandingsTable?.StandingsLists?.[0];

        if (!dTable || !cTable) {
          throw new Error('No standings records found for this season.');
        }

        setRoundInfo(`ROUND ${dTable.round}`);
        setDrivers(dTable.DriverStandings || []);
        setConstructors(cTable.ConstructorStandings || []);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || 'Could not fetch championship standings feed.');
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, [selectedSeason]);

  const maxDriverPts = Math.max(...drivers.map(d => parseFloat(d.points) || 0), 1);
  const maxConstructorPts = Math.max(...constructors.map(c => parseFloat(c.points) || 0), 1);

  return (
    <section className="min-h-screen bg-[#050810] text-slate-100 p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* HEADER BAR */}
        <header 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-red-600/30 border-2 border-red-500 text-red-400 font-mono font-black text-sm tracking-wider shadow-lg">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1">
                  <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                  <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                    CHAMPIONSHIP TALLY
                  </span>
                </span>
                <span className="text-slate-700 font-sans text-xs">•</span>
                <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                  {selectedSeason} {roundInfo}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
                PADDOCK STANDINGS
              </h1>
              <p className="text-xs font-sans text-slate-400 mt-0.5 leading-relaxed">
                Official FIA Formula 1 World Championship Standings &amp; Points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Season Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-cyan-400 uppercase">SEASON:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-black text-xs rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {seasons.map(s => (
                  <option key={s} value={s}>{s} Season</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <div 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-3 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 flex flex-wrap items-center gap-2"
        >
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all uppercase text-center ${
              activeTab === 'drivers'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            DRIVERS&apos; CHAMPIONSHIP 🏆
          </button>
          <button
            onClick={() => setActiveTab('constructors')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all uppercase text-center ${
              activeTab === 'constructors'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            CONSTRUCTORS&apos; CHAMPIONSHIP 🏎️
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-12 text-center border-2 border-slate-700/80 rounded-xl shadow-2xl font-mono"
          >
            <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              LOADING CHAMPIONSHIP STANDINGS…
            </h2>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* DRIVERS TAB */}
        {!loading && !error && activeTab === 'drivers' && (
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-3 sm:p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 overflow-x-auto"
          >
            <div className="min-w-[560px] space-y-2">
              <div className="grid grid-cols-12 p-3 bg-[#0D121F] rounded-lg font-black text-[11px] text-slate-400 border border-slate-700 mb-2">
              <span className="col-span-1 text-center">POS</span>
              <span className="col-span-4">DRIVER</span>
              <span className="col-span-3">TEAM</span>
              <span className="col-span-2 text-center">WINS</span>
              <span className="col-span-2 text-right">POINTS</span>
            </div>

            {drivers.map((d) => {
              const pts = parseFloat(d.points) || 0;
              const barWidth = (pts / maxDriverPts) * 100;
              const teamColor = getTeamColor(d.Constructors[0]?.constructorId || '');

              return (
                <div
                  key={d.Driver.driverId}
                  className="p-3 bg-[#0D121F] rounded-lg border border-slate-800 flex flex-col gap-2 transition-all hover:border-slate-700"
                >
                  <div className="grid grid-cols-12 items-center text-xs font-bold">
                    <span className="col-span-1 font-black text-cyan-300 text-center text-sm">
                      P{d.position}
                    </span>
                    <div className="col-span-4 flex items-center gap-2">
                      <span style={{ backgroundColor: teamColor }} className="w-1.5 h-4 rounded"></span>
                      <span className="font-black text-white">{d.Driver.givenName} {d.Driver.familyName}</span>
                      {d.Driver.permanentNumber && (
                        <span className="text-[10px] text-slate-500 font-mono">#{d.Driver.permanentNumber}</span>
                      )}
                    </div>
                    <span className="col-span-3 text-amber-400 font-semibold">{d.Constructors[0]?.name || 'F1 Team'}</span>
                    <span className="col-span-2 text-center text-slate-300 font-black">{d.wins || '0'}</span>
                    <span className="col-span-2 text-right font-black text-emerald-400 text-sm">{d.points} PTS</span>
                  </div>

                  {/* Visual Points Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
                      className="h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* CONSTRUCTORS TAB */}
        {!loading && !error && activeTab === 'constructors' && (
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-3 sm:p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 overflow-x-auto"
          >
            <div className="min-w-[540px] space-y-2">
              <div className="grid grid-cols-12 p-3 bg-[#0D121F] rounded-lg font-black text-[11px] text-slate-400 border border-slate-700 mb-2">
              <span className="col-span-1 text-center">POS</span>
              <span className="col-span-6">CONSTRUCTOR TEAM</span>
              <span className="col-span-3 text-center">RACE WINS</span>
              <span className="col-span-2 text-right">POINTS</span>
            </div>

            {constructors.map((c) => {
              const pts = parseFloat(c.points) || 0;
              const barWidth = (pts / maxConstructorPts) * 100;
              const teamColor = getTeamColor(c.Constructor.constructorId);

              return (
                <div
                  key={c.Constructor.constructorId}
                  className="p-3 bg-[#0D121F] rounded-lg border border-slate-800 flex flex-col gap-2 transition-all hover:border-slate-700"
                >
                  <div className="grid grid-cols-12 items-center text-xs font-bold">
                    <span className="col-span-1 font-black text-amber-300 text-center text-sm">
                      P{c.position}
                    </span>
                    <div className="col-span-6 flex items-center gap-2">
                      <span style={{ backgroundColor: teamColor }} className="w-2 h-4 rounded"></span>
                      <span className="font-black text-white text-sm">{c.Constructor.name}</span>
                    </div>
                    <span className="col-span-3 text-center text-slate-300 font-black">{c.wins || '0'}</span>
                    <span className="col-span-2 text-right font-black text-emerald-400 text-sm">{c.points} PTS</span>
                  </div>

                  {/* Visual Points Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
                      className="h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
