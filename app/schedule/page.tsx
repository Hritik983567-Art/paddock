'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, parseLapTime } from '../utils/api';

interface Race {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    Location: {
      locality: string;
      country: string;
    };
  };
}

interface RaceResult {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
  };
  Constructor: {
    name: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
  };
}

interface QualiResult {
  position: string;
  Q1?: string;
  Q2?: string;
  Q3?: string;
  Driver: {
    givenName: string;
    familyName: string;
  };
  Constructor: {
    name: string;
  };
}

interface RoundData {
  raceResults?: RaceResult[];
  qualiResults?: QualiResult[];
  fastestLap?: RaceResult | null;
  loading: boolean;
  error?: string;
}

export default function SchedulePage() {
  const { selectedSeason } = useSeason();
  const [races, setRaces] = useState<Race[]>([]);
  const [nextRound, setNextRound] = useState<string | null>(null);
  const [seasonYear, setSeasonYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Toggled panels & active sub-tabs per round
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [roundDataCache, setRoundDataCache] = useState<Record<number, RoundData>>({});
  const [roundSubTabs, setRoundSubTabs] = useState<Record<number, 'race' | 'quali'>>({});

  // Fetch season schedule
  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError('');
      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}.json`);
        const raceList = res.MRData.RaceTable.Races as Race[];
        setSeasonYear(res.MRData.RaceTable.season);
        setRaces(raceList);

        const now = new Date();
        let next = null;
        for (const r of raceList) {
          if (new Date(r.date) >= now) {
            next = r.round;
            break;
          }
        }
        setNextRound(next);
      } catch (e: any) {
        setError(e.message || 'Couldn\'t load the calendar.');
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
    // Reset caches on season change
    setExpandedRound(null);
    setRoundDataCache({});
    setRoundSubTabs({});
  }, [selectedSeason]);

  // Load results dynamically when expanding
  const toggleRace = async (round: number) => {
    if (expandedRound === round) {
      setExpandedRound(null);
      return;
    }

    setExpandedRound(round);

    // If already loaded or currently loading, skip fetching
    if (roundDataCache[round]) return;

    // Set loading state in cache
    setRoundDataCache(prev => ({ ...prev, [round]: { loading: true } }));
    setRoundSubTabs(prev => ({ ...prev, [round]: 'race' }));

    try {
      const [resultsRes, qualiRes] = await Promise.all([
        getJSON(`${API_BASE}/${seasonYear}/${round}/results.json`),
        getJSON(`${API_BASE}/${seasonYear}/${round}/qualifying.json`)
      ]);

      const raceRaces = resultsRes.MRData.RaceTable.Races[0];
      const resultsList = raceRaces?.Results as RaceResult[] || [];

      const qualiRaces = qualiRes.MRData.RaceTable.Races[0];
      const qualiList = qualiRaces?.QualifyingResults as QualiResult[] || [];

      let fastest: RaceResult | null = null;
      if (resultsList.length > 0) {
        const sortedFastest = [...resultsList]
          .filter(r => r.FastestLap)
          .sort((a, b) => parseInt(a.FastestLap!.rank) - parseInt(b.FastestLap!.rank));
        if (sortedFastest.length > 0) fastest = sortedFastest[0];
      }

      setRoundDataCache(prev => ({
        ...prev,
        [round]: {
          loading: false,
          raceResults: resultsList,
          qualiResults: qualiList,
          fastestLap: fastest
        }
      }));
    } catch (e: any) {
      setRoundDataCache(prev => ({
        ...prev,
        [round]: {
          loading: false,
          error: e.message || 'Failed to fetch details.'
        }
      }));
    }
  };

  if (loading) {
    return (
      <section className="view" id="view-schedule">
        <div className="panel">
          <h2>Season calendar</h2>
          <div className="loading">Building calendar…</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="view" id="view-schedule">
        <div className="panel">
          <h2>Season calendar</h2>
          <div className="err">{error}</div>
        </div>
      </section>
    );
  }

  const now = new Date();

  return (
    <section className="view" id="view-schedule">
      <div className="panel">
        <h2>Season calendar — {seasonYear}</h2>
        <p className="sub">Tap a race to expand its result. Completed rounds pull final classification.</p>
        
        <div id="scheduleList">
          {races.map(r => {
            const roundNum = parseInt(r.round);
            const isDone = new Date(r.date) < now;
            const isNext = r.round === nextRound;
            const isExpanded = expandedRound === roundNum;
            const details = roundDataCache[roundNum];
            const activeSub = roundSubTabs[roundNum] || 'race';

            return (
              <div 
                key={r.round} 
                className={`race-item ${isDone ? 'done' : ''} ${isNext ? 'next' : ''}`}
              >
                <div className="race-head" onClick={() => toggleRace(roundNum)}>
                  <div>
                    <span className="round-tag">R{r.round}</span>
                    <span className="rname">{r.raceName}</span>
                  </div>
                  <div className="rdate">
                    {r.Circuit.Location.locality}, {r.Circuit.Location.country} · {r.date}
                  </div>
                </div>

                {isExpanded && (
                  <div className="results-panel open">
                    {details?.loading ? (
                      <div className="loading" style={{ padding: '12px' }}>Pulling classification…</div>
                    ) : details?.error ? (
                      <div className="err" style={{ padding: '12px' }}>{details.error}</div>
                    ) : (
                      <>
                        <div className="subtabs">
                          <button 
                            className={`subtab-btn ${activeSub === 'race' ? 'active' : ''}`}
                            onClick={() => setRoundSubTabs(prev => ({ ...prev, [roundNum]: 'race' }))}
                          >
                            Race result
                          </button>
                          <button 
                            className={`subtab-btn ${activeSub === 'quali' ? 'active' : ''}`}
                            onClick={() => setRoundSubTabs(prev => ({ ...prev, [roundNum]: 'quali' }))}
                          >
                            Qualifying
                          </button>
                        </div>

                        {activeSub === 'race' && (
                          <div className="subpane open">
                            {!details?.raceResults || details.raceResults.length === 0 ? (
                              <div className="footnote">This round hasn&apos;t been run yet.</div>
                            ) : (
                              <>
                                {details.fastestLap && (
                                  <div className="footnote" style={{ color: 'var(--purple)', marginBottom: '8px' }}>
                                    Fastest lap: {details.fastestLap.Driver.givenName} {details.fastestLap.Driver.familyName} — {details.fastestLap.FastestLap?.Time.time} (lap {details.fastestLap.FastestLap?.lap})
                                  </div>
                                )}
                                {details.raceResults.slice(0, 10).map(res => (
                                  <div key={res.position} className="res-row">
                                    <div className={res.position === '1' ? 'p1' : ''}>{res.position}</div>
                                    <div>
                                      {res.Driver.givenName} {res.Driver.familyName}
                                      <span style={{ color: 'var(--dim)' }}> — {res.Constructor.name}</span>
                                    </div>
                                    <div>{res.points} pts</div>
                                  </div>
                                ))}
                                <div className="footnote">Top 10 shown.</div>
                              </>
                            )}
                          </div>
                        )}

                        {activeSub === 'quali' && (
                          <div className="subpane open">
                            {!details?.qualiResults || details.qualiResults.length === 0 ? (
                              <div className="footnote">No qualifying data on record for this round.</div>
                            ) : (
                              <>
                                {details.qualiResults.slice(0, 10).map(q => (
                                  <div key={q.position} className="res-row">
                                    <div className={q.position === '1' ? 'p1' : ''}>{q.position}</div>
                                    <div>
                                      {q.Driver.givenName} {q.Driver.familyName}
                                      <span style={{ color: 'var(--dim)' }}> — {q.Constructor.name}</span>
                                    </div>
                                    <div>{q.Q3 || q.Q2 || q.Q1 || '—'}</div>
                                  </div>
                                ))}
                                <div className="footnote">Top 10 shown · best of Q1/Q2/Q3.</div>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
