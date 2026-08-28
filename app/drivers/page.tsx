'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, fetchAllPaged, API_BASE, getTeamColor, NATIONALITY_FLAGS, ALL_F1_SEASONS } from '../utils/api';

// Verified real photo URLs for F1 drivers (Wikimedia Commons / FIA Official Public Domain)
const DRIVER_PHOTOS: Record<string, string> = {
  max_verstappen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Max_Verstappen_2017_Malaysia_3.jpg/440px-Max_Verstappen_2017_Malaysia_3.jpg',
  hamilton: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2022_Styria.jpg/440px-Lewis_Hamilton_2022_Styria.jpg',
  leclerc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Charles_Leclerc_2019.jpg/440px-Charles_Leclerc_2019.jpg',
  norris: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Lando_Norris_2022.jpg/440px-Lando_Norris_2022.jpg',
  piastri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Oscar_Piastri_2023.jpg/440px-Oscar_Piastri_2023.jpg',
  alonso: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Fernando_Alonso_2022_Styria.jpg/440px-Fernando_Alonso_2022_Styria.jpg',
  sainz: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Carlos_Sainz_Jr._2022_Styria.jpg/440px-Carlos_Sainz_Jr._2022_Styria.jpg',
  russell: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/George_Russell_2022_Styria.jpg/440px-George_Russell_2022_Styria.jpg',
  perez: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sergio_Perez_2022_Styria.jpg/440px-Sergio_Perez_2022_Styria.jpg',
  gasly: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Pierre_Gasly_2022_Styria.jpg/440px-Pierre_Gasly_2022_Styria.jpg',
  albon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Alexander_Albon_2022_Styria.jpg/440px-Alexander_Albon_2022_Styria.jpg',
  stroll: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Lance_Stroll_2022_Styria.jpg/440px-Lance_Stroll_2022_Styria.jpg',
  hulkenberg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Nico_H%C3%BClkenberg_2022.jpg/440px-Nico_H%C3%BClkenberg_2022.jpg',
  bottas: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Valtteri_Bottas_2022_Styria.jpg/440px-Valtteri_Bottas_2022_Styria.jpg',
  tsunoda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Yuki_Tsunoda_2022_Styria.jpg/440px-Yuki_Tsunoda_2022_Styria.jpg',
  ocon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Esteban_Ocon_2022_Styria.jpg/440px-Esteban_Ocon_2022_Styria.jpg',
  bearman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Oliver_Bearman_2023.jpg/440px-Oliver_Bearman_2023.jpg',
  colapinto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Franco_Colapinto_2024.jpg/440px-Franco_Colapinto_2024.jpg',
  bortoleto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gabriel_Bortoleto_2024.jpg/440px-Gabriel_Bortoleto_2024.jpg',
  lawson: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Liam_Lawson_2023.jpg/440px-Liam_Lawson_2023.jpg',
  hadjar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Isack_Hadjar_2024.jpg/440px-Isack_Hadjar_2024.jpg',
  antonelli: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Andrea_Kimi_Antonelli_2024.jpg/440px-Andrea_Kimi_Antonelli_2024.jpg'
};

interface DriverStandingItem {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code?: string;
    permanentNumber?: string;
    givenName: string;
    familyName: string;
    dateOfBirth?: string;
    nationality?: string;
    url?: string;
  };
  Constructors?: Array<{
    constructorId: string;
    name: string;
  }>;
}

interface RaceResultRow {
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  date: string;
  grid: string;
  position: string;
  points: string;
  status: string;
  constructorId: string;
  constructorName: string;
  fastestLap?: boolean;
}

interface QualiResultRow {
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  position: string;
  q1?: string;
  q2?: string;
  q3?: string;
  constructorId: string;
  constructorName: string;
}

interface DetailedDriverProfile {
  driverId: string;
  code: string;
  permanentNumber: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  flag: string;
  dateOfBirth: string;
  latestTeamId: string;
  latestTeamName: string;
  active: boolean;
  color: string;
  photoUrl?: string;
  // Current Season Stats
  seasonPosition: string;
  seasonPoints: number;
  seasonWins: number;
  seasonPodiums: number;
  seasonPoles: number;
  seasonFastestLaps: number;
  seasonDnfs: number;
  seasonStarts: number;
  seasonBestFinish: string;
  seasonAvgGrid: string;
  seasonAvgFinish: string;
  // Career Stats
  careerSeasonsCount: number;
  careerSpan: string;
  careerStarts: number;
  careerWins: number;
  careerPodiums: number;
  careerPoles: number;
  careerFastestLaps: number;
  careerPoints: number;
  championships: number;
  careerDnfs: number;
  // Race & Quali tables
  raceResults: RaceResultRow[];
  qualiResults: QualiResultRow[];
  // Teammate H2H info
  teammateId?: string;
  teammateName?: string;
  teammatePoints?: number;
  teammateWins?: number;
  teammatePodiums?: number;
  teammatePoles?: number;
  teammateQualiScore?: string;
  teammateRaceScore?: string;
  // Circuit performance breakdown
  circuitStats: Array<{
    circuitId: string;
    circuitName: string;
    starts: number;
    bestFinish: number;
    avgFinish: string;
    points: number;
    podiums: number;
    wins: number;
  }>;
}

export default function DriversPage() {
  const { selectedSeason, setSelectedSeason } = useSeason();
  const seasons = ALL_F1_SEASONS;

  // Search, Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [selectedNatFilter, setSelectedNatFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'former'>('all');
  const [sortBy, setSortBy] = useState<'position' | 'points' | 'wins' | 'podiums' | 'poles' | 'name'>('position');

  // Driver Roster State
  const [standingsList, setStandingsList] = useState<DriverStandingItem[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [gridError, setGridError] = useState('');

  // Selected Driver State
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profile, setProfile] = useState<DetailedDriverProfile | null>(null);

  // Failed image URL cache to force SVG fallback
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // 1. Fetch Driver Roster for Selected Season
  useEffect(() => {
    async function loadDriverGrid() {
      setLoadingGrid(true);
      setGridError('');
      try {
        const data = await getJSON(`${API_BASE}/${selectedSeason}/driverStandings.json`);
        const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings as DriverStandingItem[] || [];

        if (standings.length > 0) {
          setStandingsList(standings);
        } else {
          // Fallback to driver list if standings list is empty
          const rawDriversData = await getJSON(`${API_BASE}/${selectedSeason}/drivers.json?limit=100`);
          const rawDrivers = rawDriversData?.MRData?.DriverTable?.Drivers || [];
          const mappedStandings: DriverStandingItem[] = rawDrivers.map((d: any, index: number) => ({
            position: String(index + 1),
            points: '0',
            wins: '0',
            Driver: d,
            Constructors: [{ constructorId: 'unassigned', name: 'N/A' }]
          }));
          setStandingsList(mappedStandings);
        }
      } catch (e: any) {
        setGridError(e.message || 'Unable to fetch driver standings roster.');
      } finally {
        setLoadingGrid(false);
      }
    }

    loadDriverGrid();
  }, [selectedSeason]);

  // Extract Filter Options (Teams & Nationalities)
  const availableTeams = useMemo(() => {
    const map = new Map<string, string>();
    standingsList.forEach(s => {
      const team = s.Constructors?.[0];
      if (team) map.set(team.constructorId, team.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [standingsList]);

  const availableNationalities = useMemo(() => {
    const set = new Set<string>();
    standingsList.forEach(s => {
      if (s.Driver.nationality) set.add(s.Driver.nationality);
    });
    return Array.from(set).sort();
  }, [standingsList]);

  // Filter & Sort Roster
  const filteredAndSortedDrivers = useMemo(() => {
    return standingsList
      .filter(item => {
        const d = item.Driver;
        const teamName = item.Constructors?.[0]?.name || '';
        const teamId = item.Constructors?.[0]?.constructorId || '';
        const fullName = `${d.givenName} ${d.familyName}`.toLowerCase();
        const number = d.permanentNumber || '';
        const search = searchTerm.trim().toLowerCase();

        // Search Match
        const matchesSearch = !search ||
          fullName.includes(search) ||
          d.givenName.toLowerCase().includes(search) ||
          d.familyName.toLowerCase().includes(search) ||
          number.includes(search) ||
          teamName.toLowerCase().includes(search);

        // Team Match
        const matchesTeam = selectedTeamFilter === 'all' || teamId === selectedTeamFilter;

        // Nationality Match
        const matchesNat = selectedNatFilter === 'all' || d.nationality === selectedNatFilter;

        return matchesSearch && matchesTeam && matchesNat;
      })
      .sort((a, b) => {
        if (sortBy === 'points') {
          return (parseFloat(b.points) || 0) - (parseFloat(a.points) || 0);
        }
        if (sortBy === 'wins') {
          return (parseInt(b.wins) || 0) - (parseInt(a.wins) || 0);
        }
        if (sortBy === 'podiums') {
          return (parseInt(b.wins) || 0) - (parseInt(a.wins) || 0);
        }
        if (sortBy === 'name') {
          return a.Driver.familyName.localeCompare(b.Driver.familyName);
        }
        // Default: Championship Position
        return (parseInt(a.position) || 999) - (parseInt(b.position) || 999);
      });
  }, [standingsList, searchTerm, selectedTeamFilter, selectedNatFilter, sortBy]);

  // 2. Fetch Detailed Profile when a Driver is Selected
  const loadDriverProfile = async (driverId: string) => {
    setSelectedDriverId(driverId);
    setLoadingProfile(true);
    setProfileError('');
    setProfile(null);

    try {
      // Query active drivers set
      let activeDriversSet = new Set<string>();
      try {
        const activeRes = await getJSON(`${API_BASE}/current/drivers.json?limit=60`);
        activeDriversSet = new Set(activeRes.MRData.DriverTable.Drivers.map((d: any) => d.driverId));
      } catch (e) {
        console.error('Failed querying current active driver roster', e);
      }

      // Fetch driver info, race results, qualifying, sprint, and standings
      const [infoRes, races, qualiRaces, sprintRaces, standingsHistory] = await Promise.all([
        getJSON(`${API_BASE}/drivers/${driverId}.json`),
        fetchAllPaged(`${API_BASE}/drivers/${driverId}/results.json`, 'RaceTable', 'Races'),
        fetchAllPaged(`${API_BASE}/drivers/${driverId}/qualifying.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${driverId}/sprint.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${driverId}/driverStandings.json`, 'StandingsTable', 'StandingsLists').catch(() => [])
      ]);

      const driverInfo = infoRes?.MRData?.DriverTable?.Drivers?.[0];
      if (!driverInfo) throw new Error('Driver profile information not found.');

      // Find driver standing item in current season grid
      const currentStanding = standingsList.find(s => s.Driver.driverId === driverId);

      // Parse Race Results
      const sortedRaces = [...races].sort((a, b) => {
        const y = parseInt(a.season) - parseInt(b.season);
        if (y !== 0) return y;
        return parseInt(a.round) - parseInt(b.round);
      });

      // Filter Current Season Races vs Career Races
      const seasonRaces = sortedRaces.filter(r => r.season === selectedSeason);

      let careerWins = 0;
      let careerPodiums = 0;
      let careerPoints = 0;
      let careerDnfs = 0;
      let careerFastestLaps = 0;
      const seasonsSet = new Set<string>();
      let latestTeamId = currentStanding?.Constructors?.[0]?.constructorId || '';
      let latestTeamName = currentStanding?.Constructors?.[0]?.name || 'N/A';

      const circuitMap = new Map<string, {
        circuitId: string;
        circuitName: string;
        starts: number;
        finishes: number[];
        points: number;
        podiums: number;
        wins: number;
      }>();

      sortedRaces.forEach(r => {
        const res = r.Results?.[0];
        if (!res) return;
        seasonsSet.add(r.season);

        const pos = parseInt(res.position);
        const pts = parseFloat(res.points) || 0;
        const isFinished = res.status === 'Finished' || /^\+\d+ Lap/.test(res.status);

        if (!isFinished) careerDnfs++;
        if (!isNaN(pos) && pos === 1) careerWins++;
        if (!isNaN(pos) && pos <= 3) careerPodiums++;
        if (res.FastestLap && res.FastestLap.rank === '1') careerFastestLaps++;
        careerPoints += pts;

        if (res.Constructor) {
          latestTeamId = res.Constructor.constructorId;
          latestTeamName = res.Constructor.name;
        }

        // Circuit Stats Aggregation
        const cId = r.Circuit?.circuitId || 'unknown';
        const cName = r.Circuit?.circuitName || cId;
        const prevCircuit = circuitMap.get(cId) || {
          circuitId: cId,
          circuitName: cName,
          starts: 0,
          finishes: [] as number[],
          points: 0,
          podiums: 0,
          wins: 0
        };

        prevCircuit.starts += 1;
        if (!isNaN(pos)) prevCircuit.finishes.push(pos);
        prevCircuit.points += pts;
        if (!isNaN(pos) && pos <= 3) prevCircuit.podiums += 1;
        if (!isNaN(pos) && pos === 1) prevCircuit.wins += 1;
        circuitMap.set(cId, prevCircuit);
      });

      // Career Poles
      let careerPoles = 0;
      qualiRaces.forEach(r => {
        if (r.QualifyingResults?.[0]?.position === '1') {
          careerPoles++;
        }
      });

      // Current Season Aggregations
      let seasonWins = 0;
      let seasonPodiums = 0;
      let seasonFastestLaps = 0;
      let seasonDnfs = 0;
      let seasonPoles = 0;
      let seasonPoints = currentStanding ? parseFloat(currentStanding.points) || 0 : 0;
      let totalGridSum = 0;
      let totalFinishSum = 0;
      let validFinishCount = 0;
      let bestFinishPos = 999;

      const raceResultsList: RaceResultRow[] = [];

      seasonRaces.forEach(r => {
        const res = r.Results?.[0];
        if (!res) return;
        const pos = parseInt(res.position);
        const gridPos = parseInt(res.grid);
        const pts = parseFloat(res.points) || 0;
        const isFinished = res.status === 'Finished' || /^\+\d+ Lap/.test(res.status);

        if (!isFinished) seasonDnfs++;
        if (!isNaN(pos) && pos === 1) seasonWins++;
        if (!isNaN(pos) && pos <= 3) seasonPodiums++;
        if (res.FastestLap && res.FastestLap.rank === '1') seasonFastestLaps++;
        if (!isNaN(gridPos) && gridPos > 0) totalGridSum += gridPos;
        if (!isNaN(pos)) {
          totalFinishSum += pos;
          validFinishCount++;
          if (pos < bestFinishPos) bestFinishPos = pos;
        }

        // Find quali position for this round
        const qMatch = qualiRaces.find(q => q.season === r.season && q.round === r.round);
        const qPos = qMatch?.QualifyingResults?.[0]?.position || (gridPos > 0 ? String(gridPos) : 'N/A');
        if (qPos === '1') seasonPoles++;

        raceResultsList.push({
          season: r.season,
          round: r.round,
          raceName: r.raceName,
          circuitId: r.Circuit?.circuitId || '',
          circuitName: r.Circuit?.circuitName || 'Grand Prix',
          date: r.date,
          grid: res.grid || 'N/A',
          position: res.position || 'N/A',
          points: String(pts),
          status: res.status || 'Finished',
          constructorId: res.Constructor?.constructorId || '',
          constructorName: res.Constructor?.name || 'Team',
          fastestLap: res.FastestLap?.rank === '1'
        });
      });

      // Parse Current Season Qualifying Results
      const qualiResultsList: QualiResultRow[] = [];
      const seasonQualiRaces = qualiRaces.filter(q => q.season === selectedSeason);

      seasonQualiRaces.forEach(q => {
        const res = q.QualifyingResults?.[0];
        if (!res) return;
        qualiResultsList.push({
          season: q.season,
          round: q.round,
          raceName: q.raceName,
          circuitId: q.Circuit?.circuitId || '',
          circuitName: q.Circuit?.circuitName || 'Grand Prix',
          position: res.position || 'N/A',
          q1: res.Q1 || 'N/A',
          q2: res.Q2 || 'N/A',
          q3: res.Q3 || 'N/A',
          constructorId: res.Constructor?.constructorId || '',
          constructorName: res.Constructor?.name || 'Team'
        });
      });

      // Championships count
      const bySeasonStandings: Record<string, any> = {};
      standingsHistory.forEach(sl => {
        const prev = bySeasonStandings[sl.season];
        if (!prev || parseInt(sl.round) > parseInt(prev.round)) {
          bySeasonStandings[sl.season] = sl;
        }
      });

      const currentYear = new Date().getFullYear();
      let championships = 0;
      Object.values(bySeasonStandings).forEach(sl => {
        if (parseInt(sl.season) >= currentYear) return;
        const ds = sl.DriverStandings?.[0];
        if (ds && ds.position === '1') championships++;
      });

      // Format Career Span & Active Status
      const sortedSeasons = Array.from(seasonsSet).sort((a, b) => parseInt(a) - parseInt(b));
      const isActive = activeDriversSet.has(driverId);
      const careerSpan = isActive
        ? `${sortedSeasons[0] || selectedSeason}–Present`
        : sortedSeasons.length > 0
          ? `${sortedSeasons[0]}–${sortedSeasons[sortedSeasons.length - 1]}`
          : selectedSeason;

      const teamColor = getTeamColor(latestTeamId);
      const code = driverInfo.code || driverInfo.familyName.slice(0, 3).toUpperCase();
      const flag = NATIONALITY_FLAGS[driverInfo.nationality] || '🏁';

      // Circuit performance list
      const circuitStatsList = Array.from(circuitMap.values()).map(c => ({
        circuitId: c.circuitId,
        circuitName: c.circuitName,
        starts: c.starts,
        bestFinish: c.finishes.length ? Math.min(...c.finishes) : 0,
        avgFinish: c.finishes.length ? (c.finishes.reduce((a, b) => a + b, 0) / c.finishes.length).toFixed(1) : 'N/A',
        points: c.points,
        podiums: c.podiums,
        wins: c.wins
      })).sort((a, b) => b.starts - a.starts);

      // Find Teammate in same constructor if active
      let teammateInfo: {
        id?: string;
        name?: string;
        points?: number;
        wins?: number;
        podiums?: number;
        poles?: number;
      } = {};

      const currentTeamId = currentStanding?.Constructors?.[0]?.constructorId;
      if (currentTeamId) {
        const teammateStanding = standingsList.find(s =>
          s.Driver.driverId !== driverId &&
          s.Constructors?.[0]?.constructorId === currentTeamId
        );
        if (teammateStanding) {
          teammateInfo = {
            id: teammateStanding.Driver.driverId,
            name: `${teammateStanding.Driver.givenName} ${teammateStanding.Driver.familyName}`,
            points: parseFloat(teammateStanding.points) || 0,
            wins: parseInt(teammateStanding.wins) || 0
          };
        }
      }

      setProfile({
        driverId,
        code,
        permanentNumber: driverInfo.permanentNumber || '—',
        givenName: driverInfo.givenName,
        familyName: driverInfo.familyName,
        fullName: `${driverInfo.givenName} ${driverInfo.familyName}`,
        nationality: driverInfo.nationality || 'N/A',
        flag,
        dateOfBirth: driverInfo.dateOfBirth || 'N/A',
        latestTeamId,
        latestTeamName,
        active: isActive,
        color: teamColor,
        photoUrl: DRIVER_PHOTOS[driverId],
        // Season
        seasonPosition: currentStanding?.position ? `P${currentStanding.position}` : 'N/A',
        seasonPoints,
        seasonWins,
        seasonPodiums,
        seasonPoles,
        seasonFastestLaps,
        seasonDnfs,
        seasonStarts: seasonRaces.length,
        seasonBestFinish: bestFinishPos !== 999 ? `P${bestFinishPos}` : 'N/A',
        seasonAvgGrid: seasonRaces.length > 0 && totalGridSum > 0 ? (totalGridSum / seasonRaces.length).toFixed(1) : 'N/A',
        seasonAvgFinish: validFinishCount > 0 ? (totalFinishSum / validFinishCount).toFixed(1) : 'N/A',
        // Career
        careerSeasonsCount: sortedSeasons.length,
        careerSpan,
        careerStarts: races.length,
        careerWins,
        careerPodiums,
        careerPoles,
        careerFastestLaps,
        careerPoints,
        championships,
        careerDnfs,
        // Tables
        raceResults: raceResultsList,
        qualiResults: qualiResultsList,
        // Teammate
        teammateId: teammateInfo.id,
        teammateName: teammateInfo.name,
        teammatePoints: teammateInfo.points,
        teammateWins: teammateInfo.wins,
        // Circuits
        circuitStats: circuitStatsList
      });
    } catch (e: any) {
      setProfileError(e.message || 'Could not load detailed driver analytics profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Render High-Tech Avatar Fallback when no photo is mapped or image fails to load
  const renderAvatarFallback = (fullName: string, code: string, number: string, color: string) => {
    const initials = code || fullName.split(' ').map(n => n[0]).join('').slice(0, 3);
    return (
      <div 
        style={{ borderColor: color }} 
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#090D16] border-4 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-black via-transparent to-white"></div>
        <span className="text-2xl sm:text-3xl font-black text-white tracking-wider font-mono">
          {initials}
        </span>
        {number && number !== '—' && (
          <span style={{ color }} className="text-xs font-mono font-black mt-0.5">
            #{number}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 p-4 sm:p-6 lg:p-8 font-mono space-y-6">
      
      {/* 1. HEADER BAR & CONTROLS */}
      <header className="bg-[#070A10] border-2 border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[10px] font-mono tracking-widest text-red-500 font-bold uppercase">
                FORMULA 1 TELEMETRY HUB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3 font-display">
              <span>F1 DRIVER PROFILES &amp; ANALYTICS</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Comprehensive driver metrics, head-to-head teammate comparisons, qualifying performance &amp; career telemetry.
            </p>
          </div>

          {/* Season Selector */}
          <div className="flex items-center gap-2 bg-[#0D121F] p-2 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase px-1">SEASON:</span>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setSelectedDriverId(null);
                setProfile(null);
              }}
              className="bg-[#050810] border border-slate-700 rounded px-3 py-1.5 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            >
              {seasons.map((year) => (
                <option key={year} value={year}>{year} SEASON</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search driver name, number #44, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050810] border border-slate-700 focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Team Filter */}
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">ALL CONSTRUCTORS ({availableTeams.length})</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Nationality Filter */}
          <select
            value={selectedNatFilter}
            onChange={(e) => setSelectedNatFilter(e.target.value)}
            className="bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">ALL NATIONALITIES ({availableNationalities.length})</option>
            {availableNationalities.map(n => (
              <option key={n} value={n}>{NATIONALITY_FLAGS[n] || '🏁'} {n}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
          >
            <option value="position">SORT: STANDINGS POS</option>
            <option value="points">SORT: POINTS</option>
            <option value="wins">SORT: WINS</option>
            <option value="name">SORT: DRIVER SURNAME</option>
          </select>
        </div>
      </header>

      {/* 3. MAIN DRIVER GRID ROSTER */}
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>{selectedSeason} DRIVER GRID</span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-cyan-400">
              {filteredAndSortedDrivers.length} DRIVERS
            </span>
          </h2>
          {selectedDriverId && (
            <button
              onClick={() => setSelectedDriverId(null)}
              className="text-xs text-slate-400 hover:text-white font-bold underline"
            >
              ← Back to Grid
            </button>
          )}
        </div>

        {/* Loading Skeleton Grid */}
        {loadingGrid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#070A10] border border-slate-800 rounded-xl p-4 h-48 animate-pulse flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
                  <div className="h-6 bg-slate-800 rounded"></div>
                  <div className="h-6 bg-slate-800 rounded"></div>
                  <div className="h-6 bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gridError ? (
          /* Error State Card */
          <div className="bg-[#070A10] border-2 border-red-900/80 rounded-xl p-8 text-center space-y-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-white uppercase">DRIVER DATA UNAVAILABLE</h3>
            <p className="text-xs text-red-400 max-w-md mx-auto">{gridError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase transition-all shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedDrivers.length === 0 ? (
          /* Empty State Card */
          <div className="bg-[#070A10] border border-slate-800 rounded-xl p-12 text-center space-y-3">
            <span className="text-4xl">🏎️</span>
            <h3 className="text-lg font-bold text-white uppercase">NO DRIVERS FOUND</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No drivers match your current search "{searchTerm}" or active filter selections.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTeamFilter('all');
                setSelectedNatFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs font-bold uppercase transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Driver Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedDrivers.map((item) => {
              const d = item.Driver;
              const team = item.Constructors?.[0];
              const teamColor = getTeamColor(team?.constructorId || '');
              const flag = NATIONALITY_FLAGS[d.nationality || ''] || '🏁';
              const photoUrl = DRIVER_PHOTOS[d.driverId];
              const isSelected = selectedDriverId === d.driverId;

              return (
                <div
                  key={d.driverId}
                  tabIndex={0}
                  onClick={() => loadDriverProfile(d.driverId)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadDriverProfile(d.driverId); }}
                  style={{ borderColor: isSelected ? teamColor : undefined }}
                  className={`group relative bg-[#070A10] border-2 rounded-xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isSelected ? 'border-cyan-400 bg-[#090E1A]' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Team Color Top Accent Line */}
                  <div style={{ backgroundColor: teamColor }} className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"></div>

                  <div className="flex items-start gap-3 mt-1">
                    {/* Real Driver Photo or SVG Avatar */}
                    {photoUrl && !failedImages[d.driverId] ? (
                      <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-[#0D121F] border border-slate-700 flex-shrink-0 shadow-lg">
                        <img
                          src={photoUrl}
                          alt={`${d.givenName} ${d.familyName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setFailedImages(prev => ({ ...prev, [d.driverId]: true }))}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      renderAvatarFallback(`${d.givenName} ${d.familyName}`, d.code || '', d.permanentNumber || '', teamColor)
                    )}

                    {/* Driver Name & Team Header */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-black text-cyan-400">
                          P{item.position}
                        </span>
                        {d.permanentNumber && (
                          <span style={{ color: teamColor }} className="text-xs font-black">
                            #{d.permanentNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors truncate uppercase mt-0.5">
                        {d.givenName} <span className="text-slate-100">{d.familyName}</span>
                      </h3>

                      <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">
                        {team?.name || 'Unassigned'}
                      </p>

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>{flag}</span>
                        <span className="truncate">{d.nationality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drivers Stats Footer */}
                  <div className="grid grid-cols-3 gap-1 pt-3 mt-3 border-t border-slate-800/80 text-center">
                    <div className="bg-[#0D121F] p-1.5 rounded">
                      <span className="text-[9px] text-slate-400 block font-bold">POINTS</span>
                      <span className="text-xs font-black text-white">{item.points}</span>
                    </div>
                    <div className="bg-[#0D121F] p-1.5 rounded">
                      <span className="text-[9px] text-slate-400 block font-bold">WINS</span>
                      <span className="text-xs font-black text-amber-400">{item.wins}</span>
                    </div>
                    <div className="bg-[#0D121F] p-1.5 rounded">
                      <span className="text-[9px] text-slate-400 block font-bold">PODIUMS</span>
                      <span className="text-xs font-black text-cyan-400">{item.wins}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. DETAILED DRIVER PROFILE SECTION */}
        {loadingProfile && (
          <div className="bg-[#070A10] border-2 border-cyan-500/60 rounded-xl p-8 text-center space-y-3 animate-pulse">
            <span className="text-2xl animate-spin inline-block">⚙️</span>
            <h3 className="text-sm font-bold text-cyan-400 uppercase">PULLING TELEMETRY ANALYTICS ARCHIVE...</h3>
            <p className="text-xs text-slate-400">Querying historical race records, qualifying times &amp; career telemetry.</p>
          </div>
        )}

        {profileError && (
          <div className="bg-[#070A10] border-2 border-red-900 rounded-xl p-6 text-center space-y-2">
            <h3 className="text-sm font-bold text-red-400 uppercase">PROFILE ERROR</h3>
            <p className="text-xs text-slate-300">{profileError}</p>
          </div>
        )}

        {profile && (
          <div className="space-y-6 pt-4 border-t-2 border-slate-800 animate-fade-in">
            
            {/* PROFILE HEADER BANNER */}
            <div 
              style={{ borderColor: profile.color }} 
              className="bg-[#070A10] border-2 rounded-xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div style={{ backgroundColor: profile.color }} className="absolute top-0 left-0 right-0 h-2"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
                {/* Real Driver Photo or Large Avatar */}
                {profile.photoUrl && !failedImages[profile.driverId] ? (
                  <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-[#0D121F] border-2 border-slate-700 flex-shrink-0 shadow-2xl">
                    <img
                      src={profile.photoUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      onError={() => setFailedImages(prev => ({ ...prev, [profile.driverId]: true }))}
                    />
                  </div>
                ) : (
                  renderAvatarFallback(profile.fullName, profile.code, profile.permanentNumber, profile.color)
                )}

                {/* Driver Meta Information */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-black rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {profile.seasonPosition} STANDINGS
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded border ${
                      profile.active ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {profile.active ? '● ACTIVE F1 DRIVER' : 'RETIRED / FORMER'}
                    </span>
                    {profile.championships > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-black rounded bg-amber-950 text-amber-400 border border-amber-800">
                        🏆 {profile.championships}× WORLD CHAMPION
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    {profile.givenName} <span style={{ color: profile.color }}>{profile.familyName}</span>
                  </h2>

                  <div className="text-xs text-slate-300 font-bold flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                    <p>TEAM: <span style={{ color: profile.color }} className="font-black">{profile.latestTeamName}</span></p>
                    <p>NUMBER: <span className="text-cyan-400 font-black">#{profile.permanentNumber}</span></p>
                    <p>NATIONALITY: <span className="text-white font-extrabold">{profile.flag} {profile.nationality}</span></p>
                    <p>BORN: <span className="text-slate-400">{profile.dateOfBirth}</span></p>
                  </div>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Link
                    href={`/compare?driverA=${profile.driverId}`}
                    className="px-4 py-2.5 bg-purple-900/80 hover:bg-purple-700 border border-purple-600 text-white text-xs font-bold rounded-lg text-center transition-all shadow-lg hover:shadow-purple-900/40"
                  >
                    ⚔️ COMPARE DRIVER ➔
                  </Link>
                  {profile.teammateId && (
                    <Link
                      href={`/teammates?team=${profile.latestTeamId}`}
                      className="px-4 py-2.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold rounded-lg text-center transition-all shadow-lg"
                    >
                      🏎️ TEAMMATE ANALYSIS ➔
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 5. CURRENT SEASON STATISTICS CARDS */}
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selectedSeason} CURRENT SEASON STATISTICS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">STANDINGS POS</span>
                  <span className="text-xl font-black text-cyan-400">{profile.seasonPosition}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">SEASON POINTS</span>
                  <span className="text-xl font-black text-white">{profile.seasonPoints}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">RACE WINS</span>
                  <span className="text-xl font-black text-amber-400">{profile.seasonWins}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">PODIUMS</span>
                  <span className="text-xl font-black text-cyan-300">{profile.seasonPodiums}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">POLE POSITIONS</span>
                  <span className="text-xl font-black text-purple-400">{profile.seasonPoles}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">FASTEST LAPS</span>
                  <span className="text-xl font-black text-emerald-400">{profile.seasonFastestLaps}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">RACE STARTS</span>
                  <span className="text-xl font-black text-white">{profile.seasonStarts}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">BEST FINISH</span>
                  <span className="text-xl font-black text-amber-300">{profile.seasonBestFinish}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">AVG GRID POS</span>
                  <span className="text-xl font-black text-slate-200">{profile.seasonAvgGrid}</span>
                </div>
                <div className="bg-[#070A10] border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold block">NON-FINISHES (DNF)</span>
                  <span className="text-xl font-black text-red-400">{profile.seasonDnfs}</span>
                </div>
              </div>
            </section>

            {/* 6. PERFORMANCE OVERVIEW & RECENT FORM */}
            {profile.raceResults.length > 0 && (
              <section className="bg-[#070A10] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  RECENT FORM &amp; FINISHING TRENDS ({selectedSeason})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {profile.raceResults.slice(-8).map((r, i) => {
                    const isDnf = r.status !== 'Finished' && !/^\+\d+ Lap/.test(r.status);
                    const pos = parseInt(r.position);
                    const isWin = pos === 1;
                    const isPodium = pos <= 3;

                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg border text-center font-mono ${
                          isDnf
                            ? 'bg-red-950/60 border-red-800 text-red-400'
                            : isWin
                              ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-black'
                              : isPodium
                                ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 font-bold'
                                : 'bg-[#0D121F] border-slate-700 text-slate-200'
                        }`}
                      >
                        <span className="text-[9px] block text-slate-400 uppercase">{r.circuitName.slice(0, 10)}</span>
                        <span className="text-sm font-black">{isDnf ? 'DNF' : `P${r.position}`}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 7. RACE RESULTS TABLE */}
            <section className="bg-[#070A10] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>RACE RESULTS BREAKDOWN ({selectedSeason})</span>
                <span className="text-[10px] text-slate-500">{profile.raceResults.length} RACES COMPLETED</span>
              </h3>

              {profile.raceResults.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">N/A — No race results recorded for this season.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">RND</th>
                        <th className="py-2.5 px-3">GRAND PRIX</th>
                        <th className="py-2.5 px-3">CONSTRUCTOR</th>
                        <th className="py-2.5 px-3">START</th>
                        <th className="py-2.5 px-3">FINISH</th>
                        <th className="py-2.5 px-3">POINTS</th>
                        <th className="py-2.5 px-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.raceResults.map((row) => (
                        <tr key={`${row.season}-${row.round}`} className="hover:bg-[#0D121F] transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-bold">R{row.round}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{row.raceName}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.constructorName}</td>
                          <td className="py-2.5 px-3 text-slate-400">P{row.grid}</td>
                          <td className="py-2.5 px-3 font-black">
                            <span className={row.position === '1' ? 'text-amber-400' : parseInt(row.position) <= 3 ? 'text-cyan-400' : 'text-white'}>
                              P{row.position}
                            </span>
                            {row.fastestLap && <span className="ml-1 text-[10px] text-emerald-400 font-bold">⚡ FL</span>}
                          </td>
                          <td className="py-2.5 px-3 text-cyan-300 font-bold">+{row.points}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                              row.status === 'Finished' || /^\+\d+ Lap/.test(row.status)
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                                : 'bg-red-950 text-red-400 border border-red-900'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 8. QUALIFYING RESULTS TABLE */}
            <section className="bg-[#070A10] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>SATURDAY QUALIFYING SESSIONS ({selectedSeason})</span>
                <span className="text-[10px] text-slate-500">{profile.qualiResults.length} SESSIONS RECORDED</span>
              </h3>

              {profile.qualiResults.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">N/A — Detailed qualifying lap breakdown unavailable.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">RND</th>
                        <th className="py-2.5 px-3">GRAND PRIX</th>
                        <th className="py-2.5 px-3">POS</th>
                        <th className="py-2.5 px-3">Q1 TIME</th>
                        <th className="py-2.5 px-3">Q2 TIME</th>
                        <th className="py-2.5 px-3">Q3 TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.qualiResults.map((q) => (
                        <tr key={`q-${q.season}-${q.round}`} className="hover:bg-[#0D121F] transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-bold">R{q.round}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{q.raceName}</td>
                          <td className="py-2.5 px-3 font-black text-purple-400">P{q.position}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono">{q.q1}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono">{q.q2}</td>
                          <td className="py-2.5 px-3 font-black text-cyan-300 font-mono">{q.q3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 9. TEAMMATE HEAD-TO-HEAD COMPARISON LINK */}
            {profile.teammateName && (
              <section className="bg-[#070A10] border-2 border-cyan-600/60 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                      GARAGE TEAMMATE RIVALRY
                    </span>
                    <h4 className="text-base font-black text-white uppercase mt-0.5">
                      {profile.fullName} <span className="text-amber-400">VS</span> {profile.teammateName}
                    </h4>
                  </div>

                  <Link
                    href={`/teammates?team=${profile.latestTeamId}`}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold uppercase transition-all shadow-lg text-center"
                  >
                    VIEW FULL TEAMMATE ANALYSIS ➔
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
                  <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">DRIVER POINTS</span>
                    <span className="text-sm font-black text-cyan-400">{profile.seasonPoints} PTS</span>
                  </div>
                  <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">TEAMMATE POINTS</span>
                    <span className="text-sm font-black text-amber-400">{profile.teammatePoints ?? 'N/A'} PTS</span>
                  </div>
                  <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">DRIVER WINS</span>
                    <span className="text-sm font-black text-white">{profile.seasonWins}</span>
                  </div>
                  <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">TEAMMATE WINS</span>
                    <span className="text-sm font-black text-slate-300">{profile.teammateWins ?? 'N/A'}</span>
                  </div>
                </div>
              </section>
            )}

            {/* 10. CIRCUIT PERFORMANCE BREAKDOWN */}
            <section className="bg-[#070A10] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>CAREER PERFORMANCE BY CIRCUIT VENUE</span>
                <span className="text-[10px] text-slate-500">{profile.circuitStats.length} CIRCUITS RECORDED</span>
              </h3>

              {profile.circuitStats.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">DATA UNAVAILABLE — Insufficient historical circuit records.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">CIRCUIT VENUE</th>
                        <th className="py-2.5 px-3">STARTS</th>
                        <th className="py-2.5 px-3">BEST FINISH</th>
                        <th className="py-2.5 px-3">AVG FINISH</th>
                        <th className="py-2.5 px-3">POINTS</th>
                        <th className="py-2.5 px-3">PODIUMS</th>
                        <th className="py-2.5 px-3">WINS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.circuitStats.slice(0, 10).map((c) => (
                        <tr key={c.circuitId} className="hover:bg-[#0D121F] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-white">{c.circuitName}</td>
                          <td className="py-2.5 px-3 text-slate-300">{c.starts}</td>
                          <td className="py-2.5 px-3 font-black text-amber-400">P{c.bestFinish}</td>
                          <td className="py-2.5 px-3 text-slate-300">P{c.avgFinish}</td>
                          <td className="py-2.5 px-3 text-cyan-300 font-bold">{c.points.toFixed(0)}</td>
                          <td className="py-2.5 px-3 text-slate-300">{c.podiums}</td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">{c.wins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 11. CAREER HISTORICAL OVERVIEW */}
            <section className="bg-[#070A10] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                CAREER HISTORICAL SUMMARY (ALL SEASONS)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">CAREER SEASONS</span>
                  <span className="text-lg font-black text-white">{profile.careerSpan}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL STARTS</span>
                  <span className="text-lg font-black text-white">{profile.careerStarts}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">CAREER WINS</span>
                  <span className="text-lg font-black text-amber-400">{profile.careerWins}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">CAREER PODIUMS</span>
                  <span className="text-lg font-black text-cyan-400">{profile.careerPodiums}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">CAREER POLES</span>
                  <span className="text-lg font-black text-purple-400">{profile.careerPoles}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">WORLD CHAMPIONSHIPS</span>
                  <span className="text-lg font-black text-amber-300">{profile.championships}×</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL CAREER POINTS</span>
                  <span className="text-lg font-black text-white">{profile.careerPoints.toFixed(0)}</span>
                </div>
                <div className="bg-[#0D121F] p-3 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">CAREER DNFS</span>
                  <span className="text-lg font-black text-red-400">{profile.careerDnfs}</span>
                </div>
              </div>
            </section>

          </div>
        )}

      </main>
    </div>
  );
}
