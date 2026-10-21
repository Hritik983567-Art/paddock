'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE } from '../utils/api';
import { RacePredictionResponse } from '../lib/racePredictorService';
import { getOfficialRaceResults } from '../lib/raceResultsService';

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

const DEFAULT_AUSTIN_RACE: CalendarRace = {
  round: '19',
  raceName: 'United States Grand Prix',
  date: '2026-10-18',
  Circuit: {
    circuitId: 'americas',
    circuitName: 'Circuit of the Americas',
    Location: {
      locality: 'Austin',
      country: 'USA'
    }
  }
};

const DEFAULT_AUSTIN_INFO: CalendarRaceInfo = {
  round: '19',
  raceName: 'United States Grand Prix',
  circuitId: 'americas',
  circuitName: 'Circuit of the Americas',
  country: 'USA',
  date: '2026-10-18'
};

export default function RacePredictorPage() {
  const { selectedSeason } = useSeason();
  const activeSeason = selectedSeason || '2026';

  // Active Upcoming Race Focus: Round 19 Austin
  const [selectedRound, setSelectedRound] = useState<string>('19');
  const [calendarRaces, setCalendarRaces] = useState<CalendarRace[]>([]);
  
  // Historical Records & Accuracy Audit State
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);
  const [historySeason, setHistorySeason] = useState<string>('2024');
  const [historyRound, setHistoryRound] = useState<string>('19');
  const [actualResults, setActualResults] = useState<Record<string, number>>({});
  const [actualWinnerCode, setActualWinnerCode] = useState<string | undefined>(undefined);
  const [showResultsComparison, setShowResultsComparison] = useState<boolean>(true);

  // Prediction API State
  const [predictionData, setPredictionData] = useState<RacePredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Calendar Races for Active Upcoming Season
  useEffect(() => {
    let isCancelled = false;

    async function loadCalendar() {
      try {
        const data = await getJSON<{ MRData?: { RaceTable?: { Races?: CalendarRace[] } } }>(
          `${API_BASE}/${activeSeason}.json`
        );
        const races = data?.MRData?.RaceTable?.Races || [];

        if (!isCancelled && races.length > 0) {
          setCalendarRaces(races);
        }
      } catch {
        if (!isCancelled) {
          setCalendarRaces([
            DEFAULT_AUSTIN_RACE,
            {
              round: '20',
              raceName: 'Mexico City Grand Prix',
              date: '2026-10-25',
              Circuit: {
                circuitId: 'rodriguez',
                circuitName: 'Autódromo Hermanos Rodríguez',
                Location: { locality: 'Mexico City', country: 'Mexico' }
              }
            }
          ]);
        }
      }
    }

    loadCalendar();
    return () => { isCancelled = true; };
  }, [activeSeason]);

  // 2. Fetch Prediction for Selected Race (Active Upcoming or Historical)
  const fetchPrediction = useCallback(async (seasonToFetch: string, roundToFetch: string, forceRefresh = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    const raceId = `${seasonToFetch}_${roundToFetch}`;
    const query = forceRefresh ? '?refresh=true' : '';

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to the Paddock Race Predictor service.');
      setPredictionData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: Fetch upcoming Austin race status
  useEffect(() => {
    if (!isViewingHistory) {
      fetchPrediction(activeSeason, selectedRound);
    }
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

  // Return to active upcoming Austin race focus
  const handleReturnToUpcoming = () => {
    setIsViewingHistory(false);
    setSelectedRound('19');
    setActualResults({});
    setActualWinnerCode(undefined);
    fetchPrediction(activeSeason, '19', false);
  };

  // Resolve Active & Next Grand Prix Info
  const currentRaceIndex = calendarRaces.findIndex(r => r.round === selectedRound);
  const currentRaw = currentRaceIndex !== -1 ? calendarRaces[currentRaceIndex] : null;

  const currentRace: CalendarRaceInfo = isViewingHistory ? {
    round: historyRound,
    raceName: predictionData?.circuitName ? `${predictionData.circuitName} Grand Prix` : `Round ${historyRound} Grand Prix`,
    circuitId: predictionData?.circuitId || 'bahrain',
    circuitName: predictionData?.circuitName || 'Grand Prix Circuit',
    country: predictionData?.country || 'Grand Prix',
    date: predictionData?.generatedAtUtc?.split('T')[0] || `${historySeason}`
  } : currentRaw ? {
    round: currentRaw.round,
    raceName: currentRaw.raceName,
    circuitId: currentRaw.Circuit?.circuitId || 'americas',
    circuitName: currentRaw.Circuit?.circuitName || 'Circuit of the Americas',
    country: currentRaw.Circuit?.Location?.country || 'USA',
    date: currentRaw.date
  } : DEFAULT_AUSTIN_INFO;

  const nextRaw = currentRaceIndex !== -1 && currentRaceIndex < calendarRaces.length - 1 
    ? calendarRaces[currentRaceIndex + 1] 
    : calendarRaces.find(r => r.round === '20');

  const nextRace = nextRaw ? {
    round: nextRaw.round,
    raceName: nextRaw.raceName,
    circuitId: nextRaw.Circuit?.circuitId || 'rodriguez',
    circuitName: nextRaw.Circuit?.circuitName || 'Autódromo Hermanos Rodríguez',
    country: nextRaw.Circuit?.Location?.country || 'Mexico',
    date: nextRaw.date
  } : undefined;

  const isCompletedRace = isViewingHistory || (predictionData?.status === 'success' && Object.keys(actualResults).length > 0);

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
      {!isLoading && !errorMsg && !isViewingHistory && predictionData?.status === 'unavailable' && (
        <>
          <QualifyingNotCompletedState
            raceName={currentRace.raceName}
            season={activeSeason}
            round={selectedRound}
            onViewHistory={() => handleSelectHistoricalRound('2024', '19')}
          />

          {/* Historical Accuracy Ledger displayed below holding card so user can browse past data records */}
          <PredictionHistoryLedger
            onSelectRound={handleSelectHistoricalRound}
            selectedRound={historyRound}
            selectedSeason={historySeason}
            onReturnToActive={handleReturnToUpcoming}
            isViewingHistory={isViewingHistory}
          />
        </>
      )}

      {/* 5. Post-Qualifying Predictions Unlocked (Completed Historical Races) */}
      {!isLoading && !errorMsg && predictionData?.status === 'success' && (
        <>
          {/* Official Race Results Accuracy Audit Banner */}
          {isCompletedRace && Object.keys(actualResults).length > 0 && (
            <PredictionHistoryComparison
              predictions={predictionData.predictions}
              actualResults={actualResults}
              actualWinnerCode={actualWinnerCode}
              isCompletedRace={true}
              showComparison={showResultsComparison}
              onToggleCompare={() => setShowResultsComparison(prev => !prev)}
            />
          )}

          {/* Provisional Starting Grid Notice if applicable */}
          {predictionData.qualifyingStatus?.hasPenaltiesApplied === false && (
            <ProvisionalDataNotice />
          )}

          {/* Predicted Winner Banner */}
          {predictionData.predictedWinner && (
            <PredictedWinnerBanner
              winner={predictionData.predictedWinner}
              seasonYear={isViewingHistory ? parseInt(historySeason, 10) : parseInt(activeSeason, 10)}
              circuitName={predictionData.circuitName}
            />
          )}

          {/* Full Field Probability Table & Visualizer matched with actual results */}
          <ProbabilityTable
            predictions={predictionData.predictions}
            seasonYear={isViewingHistory ? parseInt(historySeason, 10) : parseInt(activeSeason, 10)}
            actualResults={showResultsComparison && Object.keys(actualResults).length > 0 ? actualResults : undefined}
          />

          {/* Key Performance Determinants & Telemetry Drivers */}
          <ExplanationsPanel
            factors={predictionData.topExplanatoryFactors}
          />

          {/* Prediction Records & Accuracy Ledger */}
          <div className="mt-8">
            <PredictionHistoryLedger
              onSelectRound={handleSelectHistoricalRound}
              selectedRound={historyRound}
              selectedSeason={historySeason}
              onReturnToActive={handleReturnToUpcoming}
              isViewingHistory={isViewingHistory}
            />
          </div>
        </>
      )}
    </div>
  );
}
