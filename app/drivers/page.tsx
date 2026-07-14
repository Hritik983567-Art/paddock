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
    return (
      <svg viewBox="0 0 100 132" width="92" height="122" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="figGloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5"/>
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28"/>
          </linearGradient>
          <radialGradient id="figHi" cx="32%" cy="22%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="podiumTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A404C"/>
            <stop offset="100%" stopColor="#22262E"/>
          </linearGradient>
        </defs>
        
        {/* podium base */}
        <ellipse cx="50" cy="122" rx="34" ry="7" fill="#000" opacity="0.35"/>
        <path d="M18 116 L82 116 L74 100 L26 100 Z" fill="url(#podiumTop)" stroke="#0A0B0D" strokeWidth="1"/>
        <rect x="26" y="100" width="12" height="4" fill="#E8302A"/>
        <rect x="38" y="100" width="12" height="4" fill="#EEF1F6"/>
        <rect x="50" y="100" width="12" height="4" fill="#E8302A"/>
        <rect x="62" y="100" width="12" height="4" fill="#EEF1F6"/>

        {/* legs victory */}
        <rect x="34" y="76" width="12" height="26" rx="6" fill="#15181E"/>
        <rect x="54" y="76" width="12" height="26" rx="6" fill="#15181E"/>
        <rect x="32" y="97" width="16" height="7" rx="3" fill="#0A0B0D"/>
        <rect x="52" y="97" width="16" height="7" rx="3" fill="#0A0B0D"/>

        {/* torso */}
        <rect x="30" y="52" width="40" height="30" rx="14" fill={color}/>
        <rect x="30" y="52" width="40" height="30" rx="14" fill="url(#figGloss)"/>
        <circle cx="50" cy="66" r="6" fill="#0A0B0D" opacity="0.55"/>

        {/* victory arm left */}
        <rect x="14" y="30" width="12" height="30" rx="6" fill={color} transform="rotate(-28 20 55)"/>
        <circle cx="12" cy="32" r="8" fill="#15181E"/>
        
        {/* arm hip right */}
        <rect x="68" y="54" width="11" height="24" rx="5.5" fill={color}/>
        <circle cx="73" cy="80" r="7" fill="#15181E"/>

        {/* bobblehead */}
        <ellipse cx="50" cy="28" rx="24" ry="25" fill={color}/>
        <rect x="28" y="21" width="44" height="13" rx="6.5" fill="#0A0B0D"/>
        <ellipse cx="50" cy="28" rx="24" ry="25" fill="url(#figGloss)"/>
        <ellipse cx="50" cy="28" rx="24" ry="25" fill="url(#figHi)"/>
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
