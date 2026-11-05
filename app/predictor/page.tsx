'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE } from '../utils/api';
import { RacePredictionResponse } from '../lib/racePredictorService';
import { getOfficialRaceResults, recordCompletedRaceToLedger } from '../lib/raceResultsService';

import PredictorHeader, { CalendarRaceInfo } from './components/PredictorHeader';
import PredictedWinnerBanner from './components/PredictedWinnerBanner';
import ProbabilityTable from './components/ProbabilityTable';
import ExplanationsPanel from './components/ExplanationsPanel';
import PredictionHistoryComparison from './components/PredictionHistoryComparison';
import PredictionHistoryLedger from './components/PredictionHistoryLedger';
import {
  QualifyingNotCompletedState,
  PredictorLoadingSkeleton,
  PredictorErrorState,
  ProvisionalDataNotice
} from './components/PredictorStatusStates';

interface CalendarRace {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
}

const DEFAULT_CALENDAR_RACES: CalendarRace[] = [
  {
    round: '1',
    raceName: 'Australian Grand Prix',
    date: '2026-03-08',
    Circuit: {
      circuitId: 'albert_park',
      circuitName: 'Albert Park Grand Prix Circuit',
      Location: { locality: 'Melbourne', country: 'Australia' }
    }
  },
  {
    round: '2',
    raceName: 'Chinese Grand Prix',
    date: '2026-03-15',
    Circuit: {
      circuitId: 'shanghai',
      circuitName: 'Shanghai International Circuit',
      Location: { locality: 'Shanghai', country: 'China' }
    }
  },
  {
    round: '3',
    raceName: 'Japanese Grand Prix',
    date: '2026-03-29',
    Circuit: {
      circuitId: 'suzuka',
      circuitName: 'Suzuka Circuit',
      Location: { locality: 'Suzuka', country: 'Japan' }
    }
  },
  {
    round: '4',
    raceName: 'Miami Grand Prix',
    date: '2026-05-03',
    Circuit: {
      circuitId: 'miami',
      circuitName: 'Miami International Autodrome',
      Location: { locality: 'Miami', country: 'USA' }
    }
  },
  {
    round: '5',
    raceName: 'Canadian Grand Prix',
    date: '2026-05-24',
    Circuit: {
      circuitId: 'villeneuve',
      circuitName: 'Circuit Gilles Villeneuve',
      Location: { locality: 'Montreal', country: 'Canada' }
    }
  },
  {
    round: '6',
    raceName: 'Monaco Grand Prix',
    date: '2026-06-07',
    Circuit: {
      circuitId: 'monaco',
      circuitName: 'Circuit de Monaco',
      Location: { locality: 'Monte Carlo', country: 'Monaco' }
    }
  },
  {
    round: '7',
    raceName: 'Barcelona Grand Prix',
    date: '2026-06-14',
    Circuit: {
      circuitId: 'catalunya',
      circuitName: 'Circuit de Barcelona-Catalunya',
      Location: { locality: 'Barcelona', country: 'Spain' }
    }
  },
  {
    round: '8',
    raceName: 'Austrian Grand Prix',
    date: '2026-06-28',
    Circuit: {
      circuitId: 'red_bull_ring',
      circuitName: 'Red Bull Ring',
      Location: { locality: 'Spielberg', country: 'Austria' }
    }
  },
  {
    round: '9',
    raceName: 'British Grand Prix',
    date: '2026-07-05',
    Circuit: {
      circuitId: 'silverstone',
      circuitName: 'Silverstone Circuit',
      Location: { locality: 'Silverstone', country: 'UK' }
    }
  },
  {
    round: '10',
    raceName: 'Belgian Grand Prix',
    date: '2026-07-19',
    Circuit: {
      circuitId: 'spa',
      circuitName: 'Circuit de Spa-Francorchamps',
      Location: { locality: 'Spa', country: 'Belgium' }
    }
  },
  {
    round: '11',
    raceName: 'Hungarian Grand Prix',
    date: '2026-07-26',
    Circuit: {
      circuitId: 'hungaroring',
      circuitName: 'Hungaroring',
      Location: { locality: 'Budapest', country: 'Hungary' }
    }
  },
  {
    round: '12',
    raceName: 'Dutch Grand Prix',
    date: '2026-08-23',
    Circuit: {
      circuitId: 'zandvoort',
      circuitName: 'Circuit Park Zandvoort',
      Location: { locality: 'Zandvoort', country: 'Netherlands' }
    }
  },
  {
    round: '13',
    raceName: 'Italian Grand Prix',
    date: '2026-09-06',
    Circuit: {
      circuitId: 'monza',
      circuitName: 'Autodromo Nazionale di Monza',
      Location: { locality: 'Monza', country: 'Italy' }
    }
  },
  {
    round: '14',
    raceName: 'Spanish Grand Prix',
    date: '2026-09-13',
    Circuit: {
      circuitId: 'madring',
      circuitName: 'Madring',
      Location: { locality: 'Madrid', country: 'Spain' }
    }
  },
  {
    round: '15',
    raceName: 'Azerbaijan Grand Prix',
    date: '2026-09-26',
    Circuit: {
      circuitId: 'baku',
      circuitName: 'Baku City Circuit',
      Location: { locality: 'Baku', country: 'Azerbaijan' }
    }
  },
  {
    round: '16',
    raceName: 'Sepang Grand Prix',
    date: '2026-10-04',
    Circuit: {
      circuitId: 'sepang',
      circuitName: 'Sepang International Circuit',
      Location: { locality: 'Kuala Lumpur', country: 'Malaysia' }
    }
  },
  {
    round: '17',
    raceName: 'Singapore Grand Prix',
    date: '2026-10-11',
    Circuit: {
      circuitId: 'marina_bay',
      circuitName: 'Marina Bay Street Circuit',
      Location: { locality: 'Marina Bay', country: 'Singapore' }
    }
  },
  {
    round: '18',
    raceName: 'United States Grand Prix',
    date: '2026-10-25',
    Circuit: {
      circuitId: 'americas',
      circuitName: 'Circuit of the Americas',
      Location: { locality: 'Austin', country: 'USA' }
    }
  },
  {
    round: '19',
    raceName: 'Mexico City Grand Prix',
    date: '2026-11-01',
    Circuit: {
      circuitId: 'rodriguez',
      circuitName: 'Autódromo Hermanos Rodríguez',
      Location: { locality: 'Mexico City', country: 'Mexico' }
    }
  },
  {
    round: '20',
    raceName: 'Brazilian Grand Prix',
    date: '2026-11-08',
    Circuit: {
      circuitId: 'interlagos',
      circuitName: 'Autódromo José Carlos Pace',
      Location: { locality: 'São Paulo', country: 'Brazil' }
    }
  },
  {
    round: '21',
    raceName: 'Las Vegas Grand Prix',
    date: '2026-11-22',
    Circuit: {
      circuitId: 'vegas',
      circuitName: 'Las Vegas Strip Street Circuit',
      Location: { locality: 'Las Vegas', country: 'USA' }
    }
  },
  {
    round: '22',
    raceName: 'Qatar Grand Prix',
    date: '2026-11-29',
    Circuit: {
      circuitId: 'losail',
      circuitName: 'Lusail International Circuit',
      Location: { locality: 'Lusail', country: 'Qatar' }
    }
  },
  {
    round: '23',
    raceName: 'Abu Dhabi Grand Prix',
    date: '2026-12-06',
    Circuit: {
      circuitId: 'yas_marina',
      circuitName: 'Yas Marina Circuit',
      Location: { locality: 'Abu Dhabi', country: 'UAE' }
    }
  }
];

function isRaceDateCompleted(dateStr?: string): boolean {
  if (!dateStr) return false;
  const raceDate = new Date(dateStr + 'T23:59:59Z');
  return !isNaN(raceDate.getTime()) && raceDate.getTime() <= Date.now();
}

function getNextUpcomingRaceRound(races: CalendarRace[]): string {
  const now = Date.now();
  const upcoming = races.find(r => {
    const raceEndTime = new Date(r.date + 'T23:59:59Z').getTime();
    return !isNaN(raceEndTime) && raceEndTime > now;
  });
  if (upcoming) {
    return upcoming.round;
  }
  return '20';
}

const DEFAULT_UPCOMING_INFO: CalendarRaceInfo = {
  round: '20',
  raceName: 'Brazilian Grand Prix',
  circuitId: 'interlagos',
  circuitName: 'Autódromo José Carlos Pace',
  country: 'Brazil',
  date: '2026-11-08'
};

export default function RacePredictorPage() {
  const { selectedSeason } = useSeason();
  const activeSeason = selectedSeason || '2026';

  // Active Upcoming Race Focus: Automatically points to the next upcoming race (e.g. Round 21 São Paulo Grand Prix)
  const [selectedRound, setSelectedRound] = useState<string>(() => getNextUpcomingRaceRound(DEFAULT_CALENDAR_RACES));
  const [calendarRaces, setCalendarRaces] = useState<CalendarRace[]>(DEFAULT_CALENDAR_RACES);
  
  // Historical Records & Accuracy Audit State
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);
  const [historySeason, setHistorySeason] = useState<string>('2026');
  const [historyRound, setHistoryRound] = useState<string>('20');
  const [actualResults, setActualResults] = useState<Record<string, number>>({});
  const [actualWinnerCode, setActualWinnerCode] = useState<string | undefined>(undefined);
  const [showResultsComparison, setShowResultsComparison] = useState<boolean>(true);

  // Prediction API State
  const [predictionData, setPredictionData] = useState<RacePredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);

  // 1. Fetch Calendar Races for Active Season
  useEffect(() => {
    let isCancelled = false;

    async function loadCalendar() {
      try {
        if (activeSeason === '2026') {
          try {
            const localRes = await fetch('/data/circuits/2026/calendar.json');
            if (localRes.ok) {
              const localData = await localRes.json();
              const races: CalendarRace[] = (localData.races || []).map((r: any) => ({
                round: r.round,
                raceName: r.raceName,
                date: r.date,
                Circuit: {
                  circuitId: r.circuitId,
                  circuitName: r.circuitName,
                  Location: {
                    locality: r.locality || '',
                    country: r.country || ''
                  }
                }
              }));
              if (!isCancelled && races.length > 0) {
                setCalendarRaces(races);
                if (!isViewingHistory) {
                  setSelectedRound(getNextUpcomingRaceRound(races));
                }
                return;
              }
            }
          } catch {
            // fallback to DEFAULT_CALENDAR_RACES below
          }
          if (!isCancelled) {
            setCalendarRaces(DEFAULT_CALENDAR_RACES);
            if (!isViewingHistory) {
              setSelectedRound(getNextUpcomingRaceRound(DEFAULT_CALENDAR_RACES));
            }
          }
          return;
        }
        const data = await getJSON<{ MRData?: { RaceTable?: { Races?: CalendarRace[] } } }>(
          `${API_BASE}/${activeSeason}.json`
        );
        const races = data?.MRData?.RaceTable?.Races || [];

        if (!isCancelled && races.length > 0) {
          setCalendarRaces(races);
          if (!isViewingHistory) {
            setSelectedRound(getNextUpcomingRaceRound(races));
          }
        } else if (!isCancelled) {
          setCalendarRaces(DEFAULT_CALENDAR_RACES);
          if (!isViewingHistory) {
            setSelectedRound(getNextUpcomingRaceRound(DEFAULT_CALENDAR_RACES));
          }
        }
      } catch {
        if (!isCancelled) {
          setCalendarRaces(DEFAULT_CALENDAR_RACES);
          if (!isViewingHistory) {
            setSelectedRound(getNextUpcomingRaceRound(DEFAULT_CALENDAR_RACES));
          }
        }
      }
    }

    loadCalendar();
    return () => { isCancelled = true; };
  }, [activeSeason, isViewingHistory]);

  // 2. Fetch Prediction for Selected Race (Active Upcoming or Historical)
  const fetchPrediction = useCallback(async (
    seasonToFetch: string, 
    roundToFetch: string, 
    forceRefresh = false, 
    simulate = false
  ): Promise<RacePredictionResponse | null> => {
    setIsLoading(true);
    setErrorMsg(null);

    const raceId = `${seasonToFetch}_${roundToFetch}`;
    const queryParams: string[] = [];
    if (forceRefresh) queryParams.push('refresh=true');
    if (simulate) queryParams.push('simulate=true');
    const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    let lastError: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`/api/predictions/race/${raceId}${query}`);
        let data: RacePredictionResponse;
        try {
          data = await res.json();
        } catch {
          throw new Error(`Invalid response received from race prediction service (Status: ${res.status}).`);
        }

        if (!res.ok && res.status !== 200 && data.status !== 'unavailable') {
          throw new Error(data.message || `Prediction service returned status ${res.status}`);
        }

        setPredictionData(data);
        setIsLoading(false);
        return data;
      } catch (err: any) {
        lastError = err;
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 800));
        }
      }
    }

    setErrorMsg(lastError?.message || 'Unable to connect to the Paddock Race Predictor service.');
    setPredictionData(null);
    setIsLoading(false);
    return null;
  }, []);

  // Fetch prediction and official results whenever active season or selected round changes
  useEffect(() => {
    if (isViewingHistory) return;

    let isCancelled = false;

    async function loadUpcomingData() {
      await fetchPrediction(activeSeason, selectedRound);
      if (isCancelled) return;

      const currentRaceObj = calendarRaces.find(r => r.round === selectedRound);
      // Strictly prevent unheld 2026 races from evaluating as completed
      const isCompleted = activeSeason !== '2026' && isRaceDateCompleted(currentRaceObj?.date);

      if (isCompleted) {
        const { actualWinnerCode: winner, actualResults: results } = await getOfficialRaceResults(activeSeason, selectedRound);
        if (isCancelled) return;

        setActualResults(results);
        setActualWinnerCode(winner);
      } else {
        setActualResults({});
        setActualWinnerCode(undefined);
      }
    }

    loadUpcomingData();

    return () => {
      isCancelled = true;
    };
  }, [activeSeason, selectedRound, isViewingHistory, fetchPrediction]);

  // Handle selecting a historical completed race from the accuracy ledger
  const handleSelectHistoricalRound = async (season: string, round: string) => {
    setIsViewingHistory(true);
    setHistorySeason(season);
    setHistoryRound(round);

    // 1. Fetch official race finishing results
    const { actualWinnerCode: winner, actualResults: results } = await getOfficialRaceResults(season, round);
    setActualResults(results);
    setActualWinnerCode(winner);

    // 2. Fetch calibrated post-qualifying predictions for this completed race
    await fetchPrediction(season, round, false);
  };

  // Return to active upcoming race focus
  const handleReturnToUpcoming = () => {
    const nextUpcoming = getNextUpcomingRaceRound(calendarRaces);
    setSelectedRound(nextUpcoming);
    setActualResults({});
    setActualWinnerCode(undefined);
    setIsViewingHistory(false);
  };

  // Resolve Active & Next Grand Prix Info
  const currentRaceIndex = calendarRaces.findIndex(r => r.round === selectedRound);
  const currentRaw = currentRaceIndex !== -1 ? calendarRaces[currentRaceIndex] : null;

  const currentRace: CalendarRaceInfo = isViewingHistory ? {
    round: historyRound,
    raceName: predictionData?.circuitName ? `${predictionData.circuitName} Grand Prix` : `Round ${historyRound} Grand Prix`,
    circuitId: predictionData?.circuitId || 'interlagos',
    circuitName: predictionData?.circuitName || 'Autódromo José Carlos Pace',
    country: predictionData?.country || 'Brazil',
    date: predictionData?.generatedAtUtc?.split('T')[0] || `${historySeason}`
  } : currentRaw ? {
    round: currentRaw.round,
    raceName: currentRaw.raceName,
    circuitId: currentRaw.Circuit?.circuitId || 'interlagos',
    circuitName: currentRaw.Circuit?.circuitName || 'Autódromo José Carlos Pace',
    country: currentRaw.Circuit?.Location?.country || 'Brazil',
    date: currentRaw.date
  } : DEFAULT_UPCOMING_INFO;

  const nextRaw = currentRaceIndex !== -1 && currentRaceIndex < calendarRaces.length - 1 
    ? calendarRaces[currentRaceIndex + 1] 
    : undefined;

  const nextRace = nextRaw ? {
    round: nextRaw.round,
    raceName: nextRaw.raceName,
    circuitId: nextRaw.Circuit?.circuitId || 'vegas',
    circuitName: nextRaw.Circuit?.circuitName || 'Las Vegas Strip Circuit',
    country: nextRaw.Circuit?.Location?.country || 'USA',
    date: nextRaw.date
  } : undefined;

  const isCurrentRaceDateCompleted = activeSeason !== '2026' && isRaceDateCompleted(currentRace.date);
  const isCompletedRace = isViewingHistory || isCurrentRaceDateCompleted || (predictionData?.status === 'success' && Object.keys(actualResults).length > 0 && actualWinnerCode !== undefined);

  return (
    <div className="relative z-10 min-h-screen text-gray-100 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* 1. Grand Prix Spotlight Header */}
      <PredictorHeader
        currentRace={currentRace}
        nextRace={nextRace}
        predictionData={predictionData}
        isLoading={isLoading}
        onRefresh={() => {
          if (isViewingHistory) {
            fetchPrediction(historySeason, historyRound, true);
          } else {
            fetchPrediction(activeSeason, selectedRound, true);
          }
        }}
        isQualifyingCompleted={predictionData?.qualifyingStatus?.isCompleted}
        isCompletedRace={isCompletedRace}
        onToggleHistoryLedger={() => setIsViewingHistory(prev => !prev)}
        isViewingHistory={isViewingHistory}
        onReturnToUpcoming={handleReturnToUpcoming}
        calendarRaces={calendarRaces.map(r => ({
          round: r.round,
          raceName: r.raceName,
          circuitId: r.Circuit?.circuitId || '',
          circuitName: r.Circuit?.circuitName || '',
          country: r.Circuit?.Location?.country || '',
          date: r.date
        }))}
        onSelectRound={(round) => {
          setSelectedRound(round);
        }}
      />

      {/* 2. Loading State */}
      {isLoading && <PredictorLoadingSkeleton />}

      {/* 3. Error State */}
      {!isLoading && errorMsg && (
        <PredictorErrorState 
          message={errorMsg} 
          onRetry={() => {
            if (isViewingHistory) {
              fetchPrediction(historySeason, historyRound, true);
            } else {
              fetchPrediction(activeSeason, selectedRound, true);
            }
          }} 
        />
      )}

      {/* 4. Strict Pre-Qualifying State (Upcoming Race Focus) */}
      {!isLoading && !errorMsg && !isViewingHistory && !isCompletedRace && predictionData?.status === 'unavailable' && (
        <>
          <QualifyingNotCompletedState
            raceName={currentRace.raceName}
            season={activeSeason}
            round={selectedRound}
            onRunSimulation={() => {
              setIsSimulationMode(true);
              fetchPrediction(activeSeason, selectedRound, false, true);
            }}
          />

          {/* Historical Accuracy Ledger displayed below holding card so user can browse past data records */}
          <PredictionHistoryLedger
            onSelectRound={handleSelectHistoricalRound}
            selectedRound={historyRound}
            selectedSeason={isViewingHistory ? historySeason : activeSeason}
            onReturnToActive={handleReturnToUpcoming}
            isViewingHistory={isViewingHistory}
          />
        </>
      )}

      {/* 5. Post-Qualifying Predictions Unlocked OR Completed Grand Prix OR Provisional Simulation */}
      {!isLoading && !errorMsg && (isCompletedRace || predictionData?.status === 'success' || predictionData?.status === 'provisional') && (
        <>
          {/* Active Simulation Notice Banner */}
          {predictionData?.status === 'provisional' && (
            <div className="stitch-card-machined rounded-xl p-4 mb-4 border-[#00F0FF]/40 bg-[#00F0FF]/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-mono">
                <span className="text-base">⚡</span>
                <span>
                  <strong className="text-white font-bold uppercase tracking-wider">Provisional Pre-Race Simulation:</strong>{' '}
                  Reflecting 2026 driver transfers, team pace ratings, and track heritage. Official predictions lock post-qualifying.
                </span>
              </div>
              <button
                onClick={() => {
                  setIsSimulationMode(false);
                  fetchPrediction(activeSeason, selectedRound, false, false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-wider shrink-0"
              >
                Exit Simulation Mode ✕
              </button>
            </div>
          )}

          {/* Official Race Results Accuracy Audit Banner */}
          {isCompletedRace && Object.keys(actualResults).length > 0 && (
            <PredictionHistoryComparison
              predictions={predictionData?.predictions || []}
              actualResults={actualResults}
              actualWinnerCode={actualWinnerCode}
              isCompletedRace={true}
              showComparison={showResultsComparison}
              onToggleCompare={() => setShowResultsComparison(prev => !prev)}
            />
          )}

          {/* Provisional Starting Grid Notice if applicable */}
          {predictionData?.qualifyingStatus?.hasPenaltiesApplied === false && predictionData?.status !== 'provisional' && (
            <ProvisionalDataNotice />
          )}

          {/* Experimental Hybrid Model Notice */}
          {predictionData?.experimentalStatus === 'EXPERIMENTAL_NON_PRODUCTION' && (
            <div className="stitch-card-machined rounded-xl p-4 mb-5 border-amber-500/40 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2.5 text-amber-300 font-mono">
                <span className="text-base">🧪</span>
                <span>
                  <strong className="text-white font-bold uppercase tracking-wider">Experimental Hybrid Model (Non-Production):</strong>{' '}
                  Statistical win probability forecast computed via geometric hybrid (80% Empirical Grid Baseline, α=1.0 · 20% LightGBM Classifier).
                  Offline validation &amp; evaluation model only.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="data-chip px-2 py-0.5 text-[10px] font-mono text-cyan-300 border-cyan-500/30">
                  {predictionData.rankingOrderSemantic || 'Predicted Win Probability Order'}
                </span>
                <span className="data-chip px-2 py-0.5 text-[10px] font-mono text-amber-400 border-amber-500/40 font-bold">
                  {predictionData.hybridFormulaVersion || 'geometric-w0.20-v1'}
                </span>
              </div>
            </div>
          )}

          {/* 2026 Regulation Era Warning if applicable */}
          {predictionData?.regulationEraWarning && (predictionData.season === 2026 || predictionData.regulationEraWarning.isUnknownRegulationEra) && (
            <div className="stitch-card-machined rounded-xl p-4 mb-5 border-cyan-500/40 bg-cyan-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2.5 text-cyan-300 font-mono">
                <span className="text-base">⚠️</span>
                <span>
                  <strong className="text-white font-bold uppercase tracking-wider">2026 Regulation Era Disclosure:</strong>{' '}
                  {predictionData.regulationEraWarning.disclaimer}
                </span>
              </div>
              <span className="data-chip px-2.5 py-1 text-[10px] font-mono text-cyan-400 border-cyan-500/40 font-bold shrink-0">
                {predictionData.regulationEraWarning.warningCode}
              </span>
            </div>
          )}

          {/* Predicted Winner Banner */}
          {predictionData?.predictedWinner && (
            <PredictedWinnerBanner
              winner={predictionData.predictedWinner}
              seasonYear={isViewingHistory ? parseInt(historySeason, 10) : parseInt(activeSeason, 10)}
              circuitName={predictionData.circuitName}
            />
          )}

          {/* Full Field Probability Table & Visualizer matched with actual results */}
          {predictionData?.predictions && predictionData.predictions.length > 0 && (
            <ProbabilityTable
              predictions={predictionData.predictions}
              seasonYear={isViewingHistory ? parseInt(historySeason, 10) : parseInt(activeSeason, 10)}
              actualResults={showResultsComparison && Object.keys(actualResults).length > 0 ? actualResults : undefined}
              circuitHeritage={predictionData.circuitHeritage}
              rankingOrderSemantic={predictionData.rankingOrderSemantic}
              hybridFormulaVersion={predictionData.hybridFormulaVersion}
              experimentalStatus={predictionData.experimentalStatus}
            />
          )}

          {predictionData?.topExplanatoryFactors && predictionData.topExplanatoryFactors.length > 0 && (
            <ExplanationsPanel
              factors={predictionData.topExplanatoryFactors}
              circuitHeritage={predictionData.circuitHeritage}
            />
          )}

          {/* Prediction Records & Accuracy Ledger */}
          <div className="mt-8">
            <PredictionHistoryLedger
              onSelectRound={handleSelectHistoricalRound}
              selectedRound={historyRound}
              selectedSeason={isViewingHistory ? historySeason : activeSeason}
              onReturnToActive={handleReturnToUpcoming}
              isViewingHistory={isViewingHistory}
            />
          </div>
        </>
      )}
    </div>
  );
}
