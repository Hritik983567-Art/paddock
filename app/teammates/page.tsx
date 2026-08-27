'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import {
  fetchSeasonTeams,
  loadTeammateComparison,
  TeamOption,
  TeammateComparisonData,
  DriverInfo
} from '../lib/teammateDataService';

// Import Modular Teammates Workstation Sub-Components
import { TeammateHeader } from '../components/teammates/TeammateHeader';
import { DriverVsCard } from '../components/teammates/DriverVsCard';
import { H2HScorecard } from '../components/teammates/H2HScorecard';
import { TeammateBattleOverview } from '../components/teammates/TeammateBattleOverview';
import { QualifyingH2H } from '../components/teammates/QualifyingH2H';
import { RaceH2H } from '../components/teammates/RaceH2H';
import { PointsProgressionChart } from '../components/teammates/PointsProgressionChart';
import { PositionHistoryCharts } from '../components/teammates/PositionHistoryCharts';
import { RecentForm } from '../components/teammates/RecentForm';
import { TeammateGaps } from '../components/teammates/TeammateGaps';
import { CircuitPerformance } from '../components/teammates/CircuitPerformance';
import { ReliabilityDNFs } from '../components/teammates/ReliabilityDNFs';
import { RaceByRaceTable } from '../components/teammates/RaceByRaceTable';

export default function TeammatesPage() {
  const { selectedSeason, setSelectedSeason } = useSeason();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [mode, setMode] = useState<'current' | 'historical'>('current');

  const [customDriverAId, setCustomDriverAId] = useState<string>('');
  const [customDriverBId, setCustomDriverBId] = useState<string>('');

  const [data, setData] = useState<TeammateComparisonData | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // 1. Load Teams for Season
  useEffect(() => {
    async function loadTeams() {
      setLoadingTeams(true);
      setError('');
      setData(null);
      setCustomDriverAId('');
      setCustomDriverBId('');

      try {
        const teamList = await fetchSeasonTeams(selectedSeason);
        setTeams(teamList);

        if (teamList.length > 0) {
          // Default to McLaren or first team
          const mclaren = teamList.find(t => t.constructorId === 'mclaren') || teamList[0];
          setSelectedTeamId(mclaren.constructorId);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch constructor team list.');
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, [selectedSeason]);

  // 2. Load Teammate Comparison Dataset
  useEffect(() => {
    async function loadData() {
      if (!selectedTeamId) return;

      setLoadingData(true);
      setError('');

      try {
        const compData = await loadTeammateComparison(
          selectedSeason,
          selectedTeamId,
          customDriverAId || undefined,
          customDriverBId || undefined
        );
        setData(compData);
      } catch (err: any) {
        setError(err.message || 'Unable to load teammate comparison data.');
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [selectedSeason, selectedTeamId, customDriverAId, customDriverBId]);

  // Extract all available drivers in current team or season for historical selection
  const allDriversInTeam = teams.find(t => t.constructorId === selectedTeamId)?.drivers || [];
  const allSeasonDrivers: DriverInfo[] = teams.flatMap(t => t.drivers);

  return (
    <section className="min-h-screen bg-[#050810] text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Workstation Header */}
        <TeammateHeader
          season={selectedSeason}
          onSelectSeason={setSelectedSeason}
          teams={teams}
          selectedTeamId={selectedTeamId}
          onSelectTeam={(tId) => {
            setSelectedTeamId(tId);
            setCustomDriverAId('');
            setCustomDriverBId('');
          }}
          mode={mode}
          onToggleMode={setMode}
        />

        {/* Loading Indicator */}
        {(loadingTeams || loadingData) && (
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-12 text-center border-2 border-slate-700/80 rounded-xl shadow-2xl font-mono mb-4"
          >
            <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              LOADING TEAMMATE COMPARISON DATA...
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fetching real historical F1 race results, qualifying classifications, and driver standings.
            </p>
          </div>
        )}

        {/* Error / Empty State */}
        {error && !loadingData && (
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 font-mono text-xs mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Active Workstation View */}
        {data && !loadingData && (
          <div>
            {/* 1. Driver A vs Driver B Header Card */}
            <DriverVsCard
              driverA={data.driverA}
              driverB={data.driverB}
              allDrivers={allSeasonDrivers}
              selectedDriverAId={customDriverAId || data.driverA.driverId}
              selectedDriverBId={customDriverBId || data.driverB.driverId}
              onSelectDriverA={setCustomDriverAId}
              onSelectDriverB={setCustomDriverBId}
              teamColor={data.teamColor}
              mode={mode}
            />

            {/* 2. Immediate Teammate Battle Overview */}
            <TeammateBattleOverview data={data} />

            {/* 3. Central Head-to-Head Scorecard */}
            <H2HScorecard data={data} />

            {/* 4. Qualifying H2H & Race H2H Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QualifyingH2H data={data} />
              <RaceH2H data={data} />
            </div>

            {/* 5. Championship Points Progression SVG Chart */}
            <PointsProgressionChart data={data} />

            {/* 6. Race-by-Race Qualifying & Finish Position Charts */}
            <PositionHistoryCharts data={data} />

            {/* 7. Recent Form (Last 5 Races) & Teammate Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RecentForm data={data} />
              <TeammateGaps data={data} />
            </div>

            {/* 8. Circuit Performance & Reliability / DNFs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CircuitPerformance data={data} />
              <ReliabilityDNFs data={data} />
            </div>

            {/* 10. Expandable Sortable Race-by-Race Table */}
            <RaceByRaceTable data={data} />
          </div>
        )}
      </div>
    </section>
  );
}
