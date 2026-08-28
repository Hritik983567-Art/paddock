'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, fetchAllPaged, API_BASE, getTeamColor, NATIONALITY_FLAGS } from '../utils/api';

interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
}

interface DriverProfile {
  permanentNumber: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
  championships: number;
  latestTeamName: string;
  active: boolean;
  careerSpan: string;
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  totalPoints: number;
  winPct: string;
  podPct: string;
  dnfs: number;
  sprintPoints: number;
  sprintRacesCount: number;
  sprintWins: number;
  color: string;
}

export default function DriversPage() {
  const { selectedSeason } = useSeason();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  // Load drivers list for the selected season
  useEffect(() => {
    async function loadDriverList() {
      setLoadingList(true);
      setListError('');
      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}/drivers.json?limit=60`);
        const list = res.MRData.DriverTable.Drivers as Driver[];
        setDrivers(list);
        if (list.length > 0) {
          setSelectedDriverId(list[0].driverId);
        }
      } catch (e: any) {
        setListError(e.message || 'Couldn\'t load drivers.');
      } finally {
        setLoadingList(false);
      }
    }
    loadDriverList();
    setProfile(null);
  }, [selectedSeason]);

  const loadProfile = async () => {
    if (!selectedDriverId) return;

    setLoadingProfile(true);
    setProfileError('');
    setProfile(null);

    try {
      // Active driver check
      let activeDriversSet = new Set<string>();
      try {
        const activeRes = await getJSON(`${API_BASE}/current/drivers.json?limit=60`);
        activeDriversSet = new Set(activeRes.MRData.DriverTable.Drivers.map((d: any) => d.driverId));
      } catch (e) {
        console.error('Failed to query current active drivers roster', e);
      }

      const [infoRes, races, qualiRaces, sprintRaces, standingsList] = await Promise.all([
        getJSON(`${API_BASE}/drivers/${selectedDriverId}.json`),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/results.json`, 'RaceTable', 'Races'),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/qualifying.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/sprint.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/driverStandings.json`, 'StandingsTable', 'StandingsLists').catch(() => [])
      ]);

      const info = infoRes.MRData.DriverTable.Drivers[0];
      if (!info) throw new Error('Driver details not found.');

      let wins = 0, podiums = 0, points = 0, dnfs = 0, fastestLaps = 0;
      const seasons = new Set<string>();
      let latestTeamId = '';
      let latestTeamName = '—';

      // Sort by season and round to get chronological order
      const sortedRaces = [...races].sort((a, b) => {
        const yearDiff = parseInt(a.season) - parseInt(b.season);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(a.round) - parseInt(b.round);
      });

      sortedRaces.forEach(r => {
        const res = r.Results[0];
        if (!res) return;
        seasons.add(r.season);
        const pos = parseInt(res.position);
        const finished = res.status === 'Finished' || /^\+\d+ Lap/.test(res.status);
        if (!finished) dnfs++;
        if (!isNaN(pos) && pos === 1) wins++;
        if (!isNaN(pos) && pos <= 3) podiums++;
        if (res.FastestLap && res.FastestLap.rank === '1') fastestLaps++;
        points += parseFloat(res.points) || 0;
        latestTeamId = res.Constructor.constructorId;
        latestTeamName = res.Constructor.name;
      });

      let poles = 0;
      qualiRaces.forEach(r => {
        if (r.QualifyingResults && r.QualifyingResults[0] && r.QualifyingResults[0].position === '1') {
          poles++;
        }
      });

      let sprintPoints = 0, sprintWins = 0;
      sprintRaces.forEach(r => {
        const res = r.SprintResults && r.SprintResults[0];
        if (!res) return;
        sprintPoints += parseFloat(res.points) || 0;
        if (res.position === '1') sprintWins++;
      });

      const totalPoints = points + sprintPoints;

      // Championships: last standings entry of each completed season, position 1
      const bySeason: Record<string, any> = {};
      standingsList.forEach(sl => {
        const prev = bySeason[sl.season];
        if (!prev || parseInt(sl.round) > parseInt(prev.round)) {
          bySeason[sl.season] = sl;
        }
      });

      const thisYear = new Date().getFullYear();
      let championships = 0;
      Object.values(bySeason).forEach(sl => {
        if (parseInt(sl.season) >= thisYear) return; // ignore current incomplete season
        const ds = sl.DriverStandings && sl.DriverStandings[0];
        if (ds && ds.position === '1') championships++;
      });

      const seasonList = Array.from(seasons).sort((a, b) => parseInt(a) - parseInt(b));
      const active = activeDriversSet.has(selectedDriverId);
      const careerSpan = active 
        ? `${seasonList[0]}–Present` 
        : seasonList.length > 0 
          ? `${seasonList[0]}–${seasonList[seasonList.length - 1]}`
          : '—';
          
      const winPct = races.length ? ((wins / races.length) * 100).toFixed(1) : '0.0';
      const podPct = races.length ? ((podiums / races.length) * 100).toFixed(1) : '0.0';
      const color = getTeamColor(latestTeamId);

      setProfile({
        permanentNumber: info.permanentNumber || '—',
        givenName: info.givenName,
        familyName: info.familyName,
        nationality: info.nationality,
        dateOfBirth: info.dateOfBirth,
        championships,
        latestTeamName,
        active,
        careerSpan,
        starts: races.length,
        wins,
        podiums,
        poles,
        fastestLaps,
        totalPoints,
        winPct,
        podPct,
        dnfs,
        sprintPoints,
        sprintRacesCount: sprintRaces.length,
        sprintWins,
        color
      });
    } catch (e: any) {
      setProfileError(e.message || 'Couldn\'t load career profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const renderPVCFigure = (color: string) => {
    const mainColor = color || '#38BDF8';
    return (
      <svg viewBox="0 0 120 140" width="100" height="120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="helmetGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#050810" stopOpacity="0.95"/>
          </linearGradient>
          <linearGradient id="visorReflect" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9"/>
            <stop offset="35%" stopColor="#3B82F6" stopOpacity="0.75"/>
            <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.65"/>
          </linearGradient>
          <linearGradient id="carbonBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B"/>
            <stop offset="100%" stopColor="#0F172A"/>
          </linearGradient>
        </defs>

        {/* Ambient Hologram Platform */}
        <ellipse cx="60" cy="128" rx="42" ry="8" fill="#000000" opacity="0.5"/>
        <ellipse cx="60" cy="128" rx="38" ry="6" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.6"/>
        <ellipse cx="60" cy="128" rx="24" ry="4" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="4 3"/>

        {/* Driver HANS & Collar Base */}
        <path d="M 28 116 C 36 100 84 100 92 116 C 96 122 24 122 28 116 Z" fill="url(#carbonBase)" stroke="#334155" strokeWidth="1.5"/>
        <path d="M 38 102 L 82 102 L 78 114 L 42 114 Z" fill={mainColor} opacity="0.85"/>
        <rect x="52" y="104" width="16" height="4" rx="2" fill="#FFFFFF" opacity="0.9"/>

        {/* Main Aerodynamic Helmet Shell */}
        <path d="M 26 66 C 26 28 42 14 60 14 C 78 14 94 28 94 66 C 94 88 88 104 60 104 C 32 104 26 88 26 66 Z" fill="url(#helmetGlow)" stroke="#475569" strokeWidth="2"/>

        {/* Rear Winglet & Air Vents */}
        <path d="M 24 50 C 20 40 28 28 40 22 C 34 32 30 42 28 54 Z" fill={mainColor} opacity="0.9"/>
        <path d="M 96 50 C 100 40 92 28 80 22 C 86 32 90 42 92 54 Z" fill={mainColor} opacity="0.9"/>
        
        {/* Helmet Crown Racing Stripes */}
        <path d="M 52 15 L 68 15 L 66 52 L 54 52 Z" fill="#FFFFFF" opacity="0.85"/>
        <path d="M 56 15 L 64 15 L 63 52 L 57 52 Z" fill={mainColor}/>

        {/* High-Tech Iridescent Visor Banner & Shield */}
        <path d="M 32 46 C 45 42 75 42 88 46 C 94 64 92 78 84 82 C 60 86 36 84 36 82 C 28 78 26 64 32 46 Z" fill="url(#visorReflect)" stroke="#00F0FF" strokeWidth="1.5"/>
        
        {/* Visor Glare Highlights */}
        <path d="M 36 50 C 50 46 70 46 84 50 C 78 54 42 54 36 50 Z" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="44" cy="60" r="2" fill="#FFFFFF" opacity="0.8"/>

        {/* Aero Tear-Off Posts */}
        <circle cx="34" cy="62" r="3.5" fill="#1E293B" stroke="#00F0FF" strokeWidth="1"/>
        <circle cx="86" cy="62" r="3.5" fill="#1E293B" stroke="#00F0FF" strokeWidth="1"/>

        {/* Chin Bar Vents */}
        <path d="M 46 90 L 74 90 L 70 96 L 50 96 Z" fill="#0F172A" stroke="#334155" strokeWidth="1"/>
        <line x1="54" y1="90" x2="54" y2="96" stroke={mainColor} strokeWidth="1.5"/>
        <line x1="60" y1="90" x2="60" y2="96" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="66" y1="90" x2="66" y2="96" stroke={mainColor} strokeWidth="1.5"/>
      </svg>
    );
  };

  const flag = profile ? NATIONALITY_FLAGS[profile.nationality] || '' : '';

  return (
    <section className="view" id="view-drivers">
      <div className="panel">
        <h2>Driver profile</h2>
        <p className="sub">Career stats pulled from every result and qualifying session on record for the selected driver.</p>
        
        {loadingList ? (
          <div className="loading">Loading driver list…</div>
        ) : listError ? (
          <div className="err">{listError}</div>
        ) : (
          <div className="driver-picker">
            <div className="pick">
              <label className="small">Driver</label>
              <select 
                value={selectedDriverId} 
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                {drivers.map(d => (
                  <option key={d.driverId} value={d.driverId}>{d.givenName} {d.familyName}</option>
                ))}
              </select>
            </div>
            <button className="btn primary" onClick={loadProfile}>Load profile</button>
          </div>
        )}

        {loadingProfile && (
          <div id="drvBody" className="loading">Pulling career archive (paging through every season)…</div>
        )}

        {profileError && (
          <div className="err" style={{ marginTop: '16px' }}>{profileError}</div>
        )}

        {profile && (
          <div id="drvBody" style={{ marginTop: '20px' }}>
            <div className="profile-head">
              <div className="fig">{renderPVCFigure(profile.color)}</div>
              <div className="num">{profile.permanentNumber}</div>
              <div>
                <h3>
                  {profile.givenName} {profile.familyName}
                  {profile.championships > 0 && (
                    <span style={{ color: 'var(--amber)', fontSize: '16px', marginLeft: '8px' }}>
                      · {profile.championships}× World Champion
                    </span>
                  )}
                </h3>
                <div className="team-line">
                  {profile.nationality} {flag} · born {profile.dateOfBirth}
                </div>
                <div className="team-line">
                  {profile.active ? 'Current' : 'Last'} team: {profile.latestTeamName} · Career: {profile.careerSpan} ·{' '}
                  <span style={{ color: profile.active ? 'var(--green)' : 'var(--dim)' }}>
                    {profile.active ? 'Active' : 'Retired'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-box">
                <div className="k">Races started</div>
                <div className="v">{profile.starts}</div>
              </div>
              <div className="stat-box">
                <div className="k">GP wins</div>
                <div className="v" style={{ color: 'var(--amber)' }}>{profile.wins}</div>
              </div>
              <div className="stat-box">
                <div className="k">Podiums</div>
                <div className="v" style={{ color: 'var(--cyan)' }}>{profile.podiums}</div>
              </div>
              <div className="stat-box">
                <div className="k">Poles</div>
                <div className="v" style={{ color: 'var(--purple)' }}>{profile.poles}</div>
              </div>
              <div className="stat-box">
                <div className="k">Fastest laps</div>
                <div className="v" style={{ color: 'var(--green)' }}>{profile.fastestLaps}</div>
              </div>
              <div className="stat-box">
                <div className="k">Career points</div>
                <div className="v">{profile.totalPoints.toFixed(0)}</div>
              </div>
              <div className="stat-box">
                <div className="k">Win rate</div>
                <div className="v">{profile.winPct}%</div>
              </div>
              <div className="stat-box">
                <div className="k">Podium rate</div>
                <div className="v">{profile.podPct}%</div>
              </div>
              <div className="stat-box">
                <div className="k">Non-finishes</div>
                <div className="v" style={{ color: 'var(--red)' }}>{profile.dnfs}</div>
              </div>
            </div>
            
            <div className="footnote">
              Career points include {profile.sprintPoints.toFixed(0)} pts from {profile.sprintRacesCount} sprint race{profile.sprintRacesCount === 1 ? '' : 's'}
              {profile.sprintWins > 0 && ` (${profile.sprintWins} sprint win${profile.sprintWins === 1 ? '' : 's'}, not counted in GP wins above)`}.
              World championship count only credits fully completed seasons. Figures mix eras with different points systems, so treat totals as a rough measure of output rather than a strict like-for-like ranking.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
