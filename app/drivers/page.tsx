'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, fetchAllPaged, API_BASE, getTeamColor, NATIONALITY_FLAGS, fetchWikipediaDriverImage } from '../utils/api';
import { DriverFaceCard } from '../components/ui/DriverFaceCard';
import { getDriverMediaProfile } from '../lib/driverMediaService';


interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  url?: string;
}

interface DriverProfile {
  permanentNumber: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
  championships: number;
  latestTeamName: string;
  latestTeamId: string;
  seasonTeamName: string;
  seasonTeamId: string;
  seasonColor: string;
  careerColor: string;
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
  hasRacingData: boolean;
  seasonStarts: number;
  seasonWins: number;
  seasonPodiums: number;
  seasonPoles: number;
  seasonFastestLaps: number;
  seasonTotalPoints: number;
  seasonWinPct: string;
  seasonPodPct: string;
  seasonDnfs: number;
  seasonSprintPoints: number;
  seasonSprintRacesCount: number;
  seasonSprintWins: number;
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
  const [wikiPhoto, setWikiPhoto] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [allHistoryMode, setAllHistoryMode] = useState(false);
  const [isOilPaintingMode, setIsOilPaintingMode] = useState(false);
  const [statViewMode, setStatViewMode] = useState<'season' | 'career'>('season');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load drivers list for the selected season or complete F1 history
  useEffect(() => {
    async function loadDriverList() {
      setLoadingList(true);
      setListError('');
      setProfile(null);
      setStatViewMode(allHistoryMode ? 'career' : 'season');
      try {
        let list: Driver[] = [];

        if (allHistoryMode) {
          list = await fetchAllPaged<Driver>(`${API_BASE}/drivers.json`, 'DriverTable', 'Drivers');
        } else {
          // Season mode: Load drivers who actually have standings or race results in this season
          try {
            const standingsRes = await getJSON(`${API_BASE}/${selectedSeason}/driverStandings.json?limit=100`) as {
              MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: Array<{ Driver: Driver }> }> } }
            };
            const standings = standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
            if (standings.length > 0) {
              list = standings.map(s => s.Driver);
            }
          } catch (e) {
            console.error('Driver standings fetch failed:', e);
          }

          if (list.length === 0) {
            try {
              const resultsRes = await getJSON(`${API_BASE}/${selectedSeason}/results.json?limit=1000`) as {
                MRData?: { RaceTable?: { Races?: Array<{ Results?: Array<{ Driver: Driver }> }> } }
              };
              const races = resultsRes?.MRData?.RaceTable?.Races || [];
              const driverMap = new Map<string, Driver>();
              races.forEach(r => {
                (r.Results || []).forEach(res => {
                  if (res.Driver && !driverMap.has(res.Driver.driverId)) {
                    driverMap.set(res.Driver.driverId, res.Driver);
                  }
                });
              });
              if (driverMap.size > 0) {
                list = Array.from(driverMap.values());
              }
            } catch (e) {
              console.error('Race results fetch failed:', e);
            }
          }

          if (list.length === 0) {
            try {
              list = await fetchAllPaged<Driver>(`${API_BASE}/${selectedSeason}/drivers.json`, 'DriverTable', 'Drivers');
            } catch (e) {
              console.warn('Season driver fetch failed, using fallback roster:', e);
            }
          }
        }

        if (list.length === 0) {
          const FALLBACK_DRIVER_IDS = [
            'hamilton', 'verstappen', 'leclerc', 'norris', 'piastri', 'russell', 'sainz', 'perez',
            'alonso', 'gasly', 'ocon', 'stroll', 'tsunoda', 'albon', 'hulkenberg', 'bottas',
            'magnussen', 'zhou', 'ricciardo', 'lawson', 'bearman', 'antonelli', 'doohan', 'hadjar', 'bortoleto'
          ];
          list = FALLBACK_DRIVER_IDS.map(id => {
            const media = getDriverMediaProfile(id, selectedSeason);
            const parts = media.name.split(' ');
            return {
              driverId: id,
              givenName: parts[0] || media.name,
              familyName: parts.slice(1).join(' ') || id,
              permanentNumber: media.number !== '—' ? media.number : '',
              nationality: media.nationality,
              code: media.code,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(media.name)}`
            };
          });
          setListError('Notice: Offline / Network server issue detected — displaying cached roster.');
        }

        setDrivers(list);
        if (list.length > 0 && !selectedDriverId) {
          setSelectedDriverId(list[0].driverId);
        }
      } catch (e: unknown) {
        const err = e as Error;
        const msg = err.message === 'Failed to fetch' 
          ? 'Unable to connect to F1 data server. Please check your internet connection.'
          : (err.message || 'Couldn\'t load drivers.');
        setListError(msg);

        // Populate fallback list on error so UI remains usable
        const FALLBACK_DRIVER_IDS = [
          'hamilton', 'verstappen', 'leclerc', 'norris', 'piastri', 'russell', 'sainz', 'perez',
          'alonso', 'gasly', 'ocon', 'stroll', 'tsunoda', 'albon', 'hulkenberg', 'bottas'
        ];
        const fallbackList: Driver[] = FALLBACK_DRIVER_IDS.map(id => {
          const media = getDriverMediaProfile(id, selectedSeason);
          const parts = media.name.split(' ');
          return {
            driverId: id,
            givenName: parts[0] || media.name,
            familyName: parts.slice(1).join(' ') || id,
            permanentNumber: media.number !== '—' ? media.number : '',
            nationality: media.nationality,
            code: media.code,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(media.name)}`
          };
        });
        setDrivers(fallbackList);
        if (fallbackList.length > 0 && !selectedDriverId) {
          setSelectedDriverId(fallbackList[0].driverId);
        }
      } finally {
        setLoadingList(false);
      }
    }
    loadDriverList();
  }, [selectedSeason, allHistoryMode]);

  // Sync profile data and headshot photo automatically on driver selection or season change
  useEffect(() => {
    if (selectedDriverId) {
      loadProfile();
    }
  }, [selectedDriverId, selectedSeason]);

  const loadProfile = async () => {
    if (!selectedDriverId) return;

    setLoadingProfile(true);
    setProfileError('');
    setProfile(null);
    setWikiPhoto(null);

    try {
      // Active driver check
      let activeDriversSet = new Set<string>();
      try {
        const activeRes = await getJSON(`${API_BASE}/current/drivers.json?limit=60`) as { MRData: { DriverTable: { Drivers: Array<{ driverId: string }> } } };
        activeDriversSet = new Set((activeRes?.MRData?.DriverTable?.Drivers || []).map(d => d.driverId));
      } catch (e) {
        console.error('Failed to query current active drivers roster', e);
      }

      const mediaProfile = getDriverMediaProfile(selectedDriverId, selectedSeason);

      const [infoRes, races, qualiRaces, sprintRaces, standingsList] = await Promise.all([
        getJSON(`${API_BASE}/drivers/${selectedDriverId}.json`).catch(() => null),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/results.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/qualifying.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/sprint.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/driverStandings.json`, 'StandingsTable', 'StandingsLists').catch(() => [])
      ]);

      const infoResObj = infoRes as { MRData: { DriverTable: { Drivers: Driver[] } } } | null;
      const info = infoResObj?.MRData?.DriverTable?.Drivers?.[0];

      if (info?.url) {
        fetchWikipediaDriverImage(info.url).then(photo => {
          if (photo) setWikiPhoto(photo);
        }).catch(() => {});
      }

      const givenName = info?.givenName || mediaProfile.name.split(' ')[0] || selectedDriverId;
      const familyName = info?.familyName || mediaProfile.name.split(' ').slice(1).join(' ') || '';
      const nationality = info?.nationality || mediaProfile.nationality || 'International';
      const permanentNumber = info?.permanentNumber || (mediaProfile.number !== '—' ? mediaProfile.number : '—');
      const dateOfBirth = info?.dateOfBirth || '—';

      let wins = 0, podiums = 0, points = 0, dnfs = 0, fastestLaps = 0;
      let seasonWins = 0, seasonPodiums = 0, seasonPoints = 0, seasonDnfs = 0, seasonFastestLaps = 0, seasonStarts = 0;
      const seasons = new Set<string>();
      let latestTeamId = mediaProfile.teamId || '';
      let latestTeamName = mediaProfile.teamName || '—';

      const seasonTeamsSet = new Set<string>();
      let seasonLatestTeamId = '';

      const typedRaces = races as Array<{ season: string; round: string; Results: Array<{ position: string; status: string; points: string; FastestLap?: { rank: string }; Constructor: { constructorId: string; name: string } }> }>;

      // Sort by season and round to get chronological order
      const sortedRaces = [...typedRaces].sort((a, b) => {
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

        // Career stats
        if (!finished) dnfs++;
        if (!isNaN(pos) && pos === 1) wins++;
        if (!isNaN(pos) && pos <= 3) podiums++;
        if (res.FastestLap && res.FastestLap.rank === '1') fastestLaps++;
        points += parseFloat(res.points) || 0;
        latestTeamId = res.Constructor.constructorId;
        latestTeamName = res.Constructor.name;

        // Selected season stats
        if (r.season === selectedSeason) {
          seasonStarts++;
          seasonTeamsSet.add(res.Constructor.name);
          seasonLatestTeamId = res.Constructor.constructorId;
          if (!finished) seasonDnfs++;
          if (!isNaN(pos) && pos === 1) seasonWins++;
          if (!isNaN(pos) && pos <= 3) seasonPodiums++;
          if (res.FastestLap && res.FastestLap.rank === '1') seasonFastestLaps++;
          seasonPoints += parseFloat(res.points) || 0;
        }
      });

      let poles = 0;
      let seasonPoles = 0;
      const typedQualiRaces = qualiRaces as Array<{ season?: string; QualifyingResults?: Array<{ position: string }> }>;
      typedQualiRaces.forEach(r => {
        if (r.QualifyingResults && r.QualifyingResults[0] && r.QualifyingResults[0].position === '1') {
          poles++;
          if (r.season === selectedSeason) {
            seasonPoles++;
          }
        }
      });

      let sprintPoints = 0, sprintWins = 0, sprintRacesCount = 0;
      let seasonSprintPoints = 0, seasonSprintWins = 0, seasonSprintRacesCount = 0;
      const typedSprintRaces = sprintRaces as Array<{ season?: string; SprintResults?: Array<{ position: string; points: string }> }>;
      typedSprintRaces.forEach(r => {
        const res = r.SprintResults && r.SprintResults[0];
        if (!res) return;
        sprintRacesCount++;
        const pts = parseFloat(res.points) || 0;
        sprintPoints += pts;
        if (res.position === '1') sprintWins++;

        if (r.season === selectedSeason) {
          seasonSprintRacesCount++;
          seasonSprintPoints += pts;
          if (res.position === '1') seasonSprintWins++;
        }
      });

      const totalPoints = points + sprintPoints;
      const seasonTotalPoints = seasonPoints + seasonSprintPoints;

      // Championships: last standings entry of each completed season, position 1
      type StandingsItem = { season: string; round: string; DriverStandings?: Array<{ position: string }> };
      const typedStandingsList = standingsList as StandingsItem[];
      const bySeason: Record<string, StandingsItem> = {};
      typedStandingsList.forEach(sl => {
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
        ? `${seasonList[0] || selectedSeason}–Present` 
        : seasonList.length > 0 
          ? `${seasonList[0]}–${seasonList[seasonList.length - 1]}`
          : '2026';
          
      const winPct = races.length ? ((wins / races.length) * 100).toFixed(1) : '0.0';
      const podPct = races.length ? ((podiums / races.length) * 100).toFixed(1) : '0.0';

      const seasonWinPct = seasonStarts ? ((seasonWins / seasonStarts) * 100).toFixed(1) : '0.0';
      const seasonPodPct = seasonStarts ? ((seasonPodiums / seasonStarts) * 100).toFixed(1) : '0.0';

      const seasonTeamName = seasonTeamsSet.size > 0 
        ? Array.from(seasonTeamsSet).join(' / ')
        : mediaProfile.teamName;
      const seasonTeamId = seasonLatestTeamId || mediaProfile.teamId;

      const seasonColor = seasonTeamId ? getTeamColor(seasonTeamId) : mediaProfile.teamColor;
      const careerColor = latestTeamId ? getTeamColor(latestTeamId) : mediaProfile.teamColor;

      const hasRacingData = races.length > 0 || qualiRaces.length > 0 || sprintRaces.length > 0;

      setProfile({
        permanentNumber,
        givenName,
        familyName,
        nationality,
        dateOfBirth,
        championships,
        latestTeamName,
        latestTeamId,
        seasonTeamName,
        seasonTeamId,
        seasonColor,
        careerColor,
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
        sprintRacesCount,
        sprintWins,
        color: seasonColor,
        hasRacingData,
        seasonStarts,
        seasonWins,
        seasonPodiums,
        seasonPoles,
        seasonFastestLaps,
        seasonTotalPoints,
        seasonWinPct,
        seasonPodPct,
        seasonDnfs,
        seasonSprintPoints,
        seasonSprintRacesCount,
        seasonSprintWins
      });
    } catch (e: unknown) {
      const err = e as Error;
      setProfileError(err.message || 'Couldn\'t load career profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const renderPVCFigure = () => {
    const isSeason = statViewMode === 'season';
    const wins = isSeason ? (profile?.seasonWins || 0) : (profile?.wins || 0);
    const podiums = isSeason ? (profile?.seasonPodiums || 0) : (profile?.podiums || 0);
    const points = isSeason ? (profile?.seasonTotalPoints || 0) : (profile?.totalPoints || 0);

    const mediaProfile = getDriverMediaProfile(selectedDriverId, selectedSeason);
    const hasCustomEraPhoto = Boolean(
      mediaProfile.headshotUrl && 
      !mediaProfile.headshotUrl.includes('d_driver_fallback_image') && 
      !mediaProfile.headshotUrl.includes('default.jpg')
    );

    const effectiveHeadshot = hasCustomEraPhoto 
      ? mediaProfile.headshotUrl 
      : (wikiPhoto || mediaProfile.headshotUrl);

    return (
      <DriverFaceCard
        driverId={selectedDriverId}
        season={selectedSeason}
        customProfile={{
          headshotUrl: effectiveHeadshot,
          officialHeadshotUrl: wikiPhoto || mediaProfile.officialHeadshotUrl
        }}
        size="lg"
        showStats={true}
        wins={wins}
        podiums={podiums}
        points={points}
        artisticMode={isOilPaintingMode}
      />
    );
  };

  const flag = profile ? NATIONALITY_FLAGS[profile.nationality] || '' : '';

  const selectedDriverObj = drivers.find(d => d.driverId === selectedDriverId);
  const selectedDriverMedia = getDriverMediaProfile(selectedDriverId, selectedSeason);
  const selectedDriverName = selectedDriverObj 
    ? `${selectedDriverObj.givenName} ${selectedDriverObj.familyName}`
    : selectedDriverMedia.name;
  const selectedDriverNat = selectedDriverObj?.nationality || selectedDriverMedia.nationality;
  const selectedDriverFlag = NATIONALITY_FLAGS[selectedDriverNat] || selectedDriverMedia.flag || '🏎️';
  const selectedDriverNum = selectedDriverObj?.permanentNumber || (selectedDriverMedia.number !== '—' ? selectedDriverMedia.number : '');

  const filteredDrivers = drivers.filter(d => {
    const media = getDriverMediaProfile(d.driverId, selectedSeason);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${d.givenName || ''} ${d.familyName || ''}`.toLowerCase();
    const nationality = (d.nationality || media.nationality || '').toLowerCase();
    const perm = (d.permanentNumber || (media.number !== '—' ? media.number : '')).toLowerCase();
    return fullName.includes(q) || nationality.includes(q) || perm.includes(q) || d.driverId.includes(q);
  });

  return (
    <section className="view" id="view-drivers">
      <div className="panel">
        <div className="mb-5 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1">
              <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
              <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                DRIVER ARCHIVE
              </span>
            </span>
            <span className="text-slate-700 font-sans text-xs">•</span>
            <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
              CAREER TELEMETRY &amp; STATS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight f1-text-gradient uppercase">
            DRIVER CAREER PROFILES
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl leading-relaxed">
            Career statistics pulled from every Grand Prix result, pole position, and qualifying session on record.
          </p>
        </div>
        
        {listError && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/60 text-amber-300 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <span>⚠️ {listError}</span>
            <button
              onClick={() => {
                setListError('');
                setLoadingList(true);
              }}
              className="px-3.5 py-1.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-lg text-xs uppercase tracking-wider shrink-0 transition-colors shadow"
            >
              ⚡ Retry Server Sync
            </button>
          </div>
        )}

        {loadingList ? (
          <div className="loading">Loading driver list…</div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* DRIVER PICKER & ROSTER MODE TOGGLE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3" ref={dropdownRef}>
              {/* CUSTOM SCROLLABLE DRIVER PICKER */}
              <div className="relative flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    SELECT DRIVER PROFILE ({filteredDrivers.length} DRIVERS)
                  </label>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#050810] border-2 border-slate-700 hover:border-cyan-500 rounded-xl px-4 py-2.5 text-left text-xs font-mono text-white flex items-center justify-between shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{selectedDriverFlag}</span>
                    <span className="font-bold text-white uppercase">{selectedDriverName}</span>
                    {selectedDriverNum && (
                      <span className="text-cyan-400 font-black">#{selectedDriverNum}</span>
                    )}
                    <span className="text-slate-400 text-[11px] truncate">— {selectedDriverNat}</span>
                  </div>
                  <span className="text-slate-400 text-xs ml-2 shrink-0">{isDropdownOpen ? '▲' : '▼'}</span>
                </button>

                {/* BOUNDED DROPDOWN LIST WITH SEARCH INLINE */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#070A10] border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-80 flex flex-col">
                    <div className="p-2.5 border-b border-slate-800 bg-[#0D121F]">
                      <input
                        type="text"
                        placeholder="Search by driver name, code, number or nationality..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-[#050810] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-64 divide-y divide-slate-800/60 custom-scrollbar">
                      {filteredDrivers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 font-mono">No matching drivers found</div>
                      ) : (
                        filteredDrivers.map(d => {
                          const media = getDriverMediaProfile(d.driverId, selectedSeason);
                          const nat = d.nationality || media.nationality;
                          const num = d.permanentNumber || (media.number !== '—' ? media.number : '');
                          const flagEmoji = NATIONALITY_FLAGS[nat] || media.flag || '🏎️';
                          const isSelected = d.driverId === selectedDriverId;

                          return (
                            <button
                              key={d.driverId}
                              type="button"
                              onClick={() => {
                                setSelectedDriverId(d.driverId);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-mono flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-cyan-950/80 text-cyan-300 font-bold' : 'hover:bg-slate-900 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base shrink-0">{flagEmoji}</span>
                                <span className="font-bold uppercase truncate">{d.givenName} {d.familyName}</span>
                                {num && <span className="text-cyan-400 font-black shrink-0">#{num}</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2 uppercase font-semibold">{nat}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ROSTER MODE TOGGLE */}
              <button
                onClick={() => {
                  setAllHistoryMode(!allHistoryMode);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2.5 text-xs font-mono font-bold rounded-xl uppercase tracking-wider transition-all border shrink-0 h-[42px] ${
                  allHistoryMode
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {allHistoryMode ? '📜 FULL F1 HISTORY (868 DRIVERS)' : `🗓️ ${selectedSeason} ROSTER`}
              </button>



              <button className="btn primary shrink-0 h-[42px]" onClick={loadProfile}>Load career profile</button>
            </div>
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
            {!profile.hasRacingData && (
              <div className="p-4 mb-5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs font-mono flex items-center gap-3 shadow-lg">
                <span className="text-xl">⚠️</span>
                <div>
                  <span className="font-bold uppercase tracking-wider block text-amber-300">NO GRAND PRIX RACING DATA ON RECORD</span>
                  <span className="text-[11px] text-amber-300/80">
                    This driver registered for an F1 entry list or reserve role but has zero recorded official Grand Prix session starts in the Ergast archive.
                  </span>
                </div>
              </div>
            )}
            <div className="profile-head">
              <div className="fig">{renderPVCFigure()}</div>
              <div className="num">{profile.permanentNumber}</div>
              <div>
                <h3>
                  {profile.givenName} {profile.familyName}
                  {profile.championships > 0 && (
                    <span style={{ color: '#FFB800', textShadow: '0 0 10px rgba(255, 184, 0, 0.5)', fontSize: '16px', marginLeft: '8px', fontWeight: 800 }}>
                      🏆 {profile.championships}× World Champion
                    </span>
                  )}
                </h3>
                <div className="team-line font-sans">
                  {profile.nationality} {flag} · born {profile.dateOfBirth}
                </div>
                <div className="team-line font-sans">
                  {statViewMode === 'season' ? (
                    <>
                      <span className="text-cyan-400 font-bold">{selectedSeason} Team:</span>{' '}
                      <strong className="text-white">{profile.seasonTeamName}</strong>
                    </>
                  ) : (
                    <>
                      {profile.active ? 'Current' : 'Last'} team:{' '}
                      <strong className="text-white">{profile.latestTeamName}</strong>
                    </>
                  )}{' '}
                  · Career: <span className="font-telemetry font-bold text-slate-200">{profile.careerSpan}</span> ·{' '}
                  <span style={{ color: profile.active ? '#00F5D4' : '#94A3B8', fontWeight: 700 }}>
                    {profile.active ? '● Active Driver' : 'Retired'}
                  </span>
                </div>
              </div>
            </div>

            {/* DYNAMIC TELEMETRY VIEW TOGGLE BAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  TELEMETRY VIEW:
                </span>
                <span className="text-xs font-mono font-black text-cyan-400 uppercase">
                  {statViewMode === 'season' ? `${selectedSeason} SEASON STATS` : 'ALL-TIME CAREER TOTALS'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#070A10] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStatViewMode('season')}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    statViewMode === 'season'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  🗓️ {selectedSeason} Season
                </button>

                <button
                  type="button"
                  onClick={() => setStatViewMode('career')}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    statViewMode === 'career'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  🏆 All-Time Career
                </button>
              </div>
            </div>

            {statViewMode === 'season' && profile.seasonStarts === 0 && (
              <div className="p-3 mb-4 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono flex items-center justify-between">
                <span>ℹ️ {profile.givenName} {profile.familyName} has 0 recorded GP starts in the {selectedSeason} season.</span>
                <button 
                  onClick={() => setStatViewMode('career')}
                  className="text-cyan-400 font-bold hover:underline ml-2 text-[11px] shrink-0"
                >
                  Switch to All-Time Career →
                </button>
              </div>
            )}

            {(() => {
              const isSeason = statViewMode === 'season';
              const displayStarts = isSeason ? profile.seasonStarts : profile.starts;
              const displayWins = isSeason ? profile.seasonWins : profile.wins;
              const displayPodiums = isSeason ? profile.seasonPodiums : profile.podiums;
              const displayPoles = isSeason ? profile.seasonPoles : profile.poles;
              const displayFastestLaps = isSeason ? profile.seasonFastestLaps : profile.fastestLaps;
              const displayPoints = isSeason ? profile.seasonTotalPoints : profile.totalPoints;
              const displayWinPct = isSeason ? profile.seasonWinPct : profile.winPct;
              const displayPodPct = isSeason ? profile.seasonPodPct : profile.podPct;
              const displayDnfs = isSeason ? profile.seasonDnfs : profile.dnfs;

              return (
                <div className="stat-grid">
                  <div className="stat-box">
                    <div className="k">Races started</div>
                    <div className="v text-white">{displayStarts}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">GP wins</div>
                    <div className="v" style={{ color: '#FFB800', textShadow: '0 0 10px rgba(255, 184, 0, 0.45)' }}>{displayWins}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Podiums</div>
                    <div className="v" style={{ color: '#00F5D4', textShadow: '0 0 10px rgba(0, 245, 212, 0.4)' }}>{displayPodiums}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Poles</div>
                    <div className="v" style={{ color: '#D946EF', textShadow: '0 0 10px rgba(217, 70, 239, 0.45)' }}>{displayPoles}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Fastest laps</div>
                    <div className="v" style={{ color: '#B138DD', textShadow: '0 0 10px rgba(177, 56, 221, 0.45)' }}>{displayFastestLaps}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">{isSeason ? `${selectedSeason} points` : 'Career points'}</div>
                    <div className="v" style={{ color: '#E10600', textShadow: '0 0 10px rgba(225, 6, 0, 0.4)' }}>{displayPoints.toFixed(0)}</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Win rate</div>
                    <div className="v" style={{ color: '#FFB800' }}>{displayWinPct}%</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Podium rate</div>
                    <div className="v" style={{ color: '#00F5D4' }}>{displayPodPct}%</div>
                  </div>
                  <div className="stat-box">
                    <div className="k">Non-finishes</div>
                    <div className="v" style={{ color: '#FF3B30' }}>{displayDnfs}</div>
                  </div>
                </div>
              );
            })()}
            
            <div className="footnote">
              {statViewMode === 'season' ? (
                <>
                  Displaying <strong>{selectedSeason} Season</strong> telemetry.
                  {profile.seasonSprintRacesCount > 0 && (
                    <> Season points include {profile.seasonSprintPoints.toFixed(0)} pts from {profile.seasonSprintRacesCount} sprint race{profile.seasonSprintRacesCount === 1 ? '' : 's'}
                    {profile.seasonSprintWins > 0 && ` (${profile.seasonSprintWins} sprint win${profile.seasonSprintWins === 1 ? '' : 's'})`}.</>
                  )}
                </>
              ) : (
                <>
                  Career points include {profile.sprintPoints.toFixed(0)} pts from {profile.sprintRacesCount} sprint race{profile.sprintRacesCount === 1 ? '' : 's'}
                  {profile.sprintWins > 0 && ` (${profile.sprintWins} sprint win${profile.sprintWins === 1 ? '' : 's'}, not counted in GP wins above)`}.
                  World championship count only credits fully completed seasons. Figures mix eras with different points systems, so treat totals as a rough measure of output rather than a strict like-for-like ranking.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


