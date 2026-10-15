'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, parseLapTime } from '../utils/api';
import {
  QuestionId,
  RoundItem,
  DriverResultItem,
  LapRecord,
  PitStopItem,
  GrandPrixSummary
} from './types';
import {
  buildContinuousLapRecords,
  parsePitStops
} from './utils/lapProcessing';

import { GrandPrixSummaryBar } from './components/GrandPrixSummaryBar';
import { LabHeader } from './components/LabHeader';
import { PitStopReview } from './components/PitStopReview';
import { WhereWasTimeLost } from './components/WhereWasTimeLost';
import { TyreStintStory } from './components/TyreStintStory';
import { CircuitStrengths } from './components/CircuitStrengths';

export default function LabPage() {
  const { selectedSeason } = useSeason();

  // Active Question Entry Point
  const [activeQuestion, setActiveQuestion] = useState<QuestionId>('pit_stop_review');

  // Shared Season / Round / Driver Selection
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [driversList, setDriversList] = useState<DriverResultItem[]>([]);
  const [selectedDriverA, setSelectedDriverA] = useState<string>('');
  const [selectedDriverB, setSelectedDriverB] = useState<string>('');

  // Loaded Race Data
  const [grandPrixSummary, setGrandPrixSummary] = useState<GrandPrixSummary | null>(null);
  const [pitStops, setPitStops] = useState<PitStopItem[]>([]);
  const [driverALaps, setDriverALaps] = useState<LapRecord[]>([]);
  const [driverBLaps, setDriverBLaps] = useState<LapRecord[]>([]);
  const [totalRaceLaps, setTotalRaceLaps] = useState<number>(58);
  const [benchmarkBaseLapTime, setBenchmarkBaseLapTime] = useState<number>(92.0);

  // Loading States
  const [loadingRounds, setLoadingRounds] = useState<boolean>(true);
  const [loadingSession, setLoadingSession] = useState<boolean>(false);
  const [loadingLaps, setLoadingLaps] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // -------------------------------------------------------------
  // 1. FETCH ROUNDS FOR SELECTED SEASON
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setErrorMsg('');
      setSelectedRound('');
      setDriversList([]);
      setSelectedDriverA('');
      setSelectedDriverB('');
      setPitStops([]);
      setDriverALaps([]);
      setDriverBLaps([]);
      setGrandPrixSummary(null);

      try {
        const res = await getJSON<{
          MRData?: {
            RaceTable?: {
              Races?: Array<{
                round: string;
                raceName: string;
                date: string;
                Circuit?: {
                  circuitId?: string;
                  circuitName?: string;
                };
              }>;
            };
          };
        }>(`${API_BASE}/${selectedSeason}.json`);

        const raceList = res?.MRData?.RaceTable?.Races || [];
        const formatted: RoundItem[] = raceList.map((r) => ({
          round: r.round,
          raceName: r.raceName,
          date: r.date,
          circuitId: r.Circuit?.circuitId || '',
          circuitName: r.Circuit?.circuitName || ''
        }));

        setRounds(formatted);

        // Default to latest completed round in this season
        const now = new Date();
        const pastCompleted = formatted.filter((r) => new Date(r.date) <= now);
        if (pastCompleted.length > 0) {
          setSelectedRound(pastCompleted[pastCompleted.length - 1].round);
        } else if (formatted.length > 0) {
          setSelectedRound(formatted[0].round);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(`Failed to load ${selectedSeason} calendar: ${error.message}`);
      } finally {
        setLoadingRounds(false);
      }
    }

    loadRounds();
  }, [selectedSeason]);

  // -------------------------------------------------------------
  // 2. FETCH RACE RESULTS, PIT STOPS & QUALIFYING FOR SELECTED ROUND
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedRound) return;

    let isMounted = true;

    async function loadSessionData() {
      setLoadingSession(true);
      setErrorMsg('');

      try {
        const [resultsRes, pitStopsRes, qualiRes] = await Promise.all([
          getJSON<{
            MRData?: {
              RaceTable?: {
                Races?: Array<{
                  season: string;
                  round: string;
                  raceName: string;
                  date: string;
                  Circuit?: {
                    circuitId?: string;
                    circuitName?: string;
                    Location?: { locality?: string; country?: string };
                  };
                  Results?: Array<{
                    Driver: { driverId: string; code?: string; givenName: string; familyName: string };
                    Constructor: { constructorId?: string; name: string };
                    grid: string;
                    position: string;
                    status: string;
                    points?: string;
                    laps: string;
                    FastestLap?: {
                      Time?: { time: string };
                      AverageSpeed?: { speed: string };
                    };
                  }>;
                }>;
              };
            };
          }>(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`).catch(() => null),

          getJSON<{
            MRData?: {
              RaceTable?: {
                Races?: Array<{
                  PitStops?: Array<{
                    driverId: string;
                    lap: string;
                    stop: string;
                    duration?: string;
                    time?: string;
                  }>;
                }>;
              };
            };
          }>(`${API_BASE}/${selectedSeason}/${selectedRound}/pitstops.json`).catch(() => null),

          getJSON<{
            MRData?: {
              RaceTable?: {
                Races?: Array<{
                  QualifyingResults?: Array<{
                    Driver: { driverId: string; code?: string; givenName: string; familyName: string };
                    Q3?: string;
                    Q2?: string;
                    Q1?: string;
                  }>;
                }>;
              };
            };
          }>(`${API_BASE}/${selectedSeason}/${selectedRound}/qualifying.json`).catch(() => null)
        ]);

        if (!isMounted) return;

        const raceInfo = resultsRes?.MRData?.RaceTable?.Races?.[0];
        const raceResults = raceInfo?.Results || [];

        if (raceResults.length === 0) {
          setErrorMsg('No race results on record for this round.');
          setDriversList([]);
          setGrandPrixSummary(null);
          return;
        }

        // Parse Drivers List
        const parsedDrivers: DriverResultItem[] = raceResults.map((r) => {
          const fastLapSec = r.FastestLap?.Time?.time
            ? parseLapTime(r.FastestLap.Time.time) || undefined
            : undefined;

          return {
            driverId: r.Driver.driverId,
            code: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
            givenName: r.Driver.givenName,
            familyName: r.Driver.familyName,
            constructorName: r.Constructor.name,
            constructorId: r.Constructor.constructorId || r.Constructor.name.toLowerCase().replace(/\s+/g, '_'),
            grid: r.grid,
            position: r.position,
            status: r.status,
            points: r.points,
            fastestLapSecs: fastLapSec,
            fastestLapSpeed: r.FastestLap?.AverageSpeed?.speed,
            fastestLapRawTime: r.FastestLap?.Time?.time,
            lapsCompleted: parseInt(r.laps, 10) || 0
          };
        });

        setDriversList(parsedDrivers);

        // Set default Driver A (P1) and Driver B (P2)
        if (parsedDrivers.length >= 2) {
          setSelectedDriverA(parsedDrivers[0].driverId);
          setSelectedDriverB(parsedDrivers[1].driverId);
        } else if (parsedDrivers.length === 1) {
          setSelectedDriverA(parsedDrivers[0].driverId);
        }

        // Total Race Laps & Base Lap Time Calibration
        const maxLaps = Math.max(...parsedDrivers.map((d) => d.lapsCompleted), 50);
        setTotalRaceLaps(maxLaps);

        const validFastLaps = parsedDrivers
          .map((d) => d.fastestLapSecs)
          .filter((t): t is number => typeof t === 'number' && t > 40);
        const minLap = validFastLaps.length > 0 ? Math.min(...validFastLaps) : 92.0;
        setBenchmarkBaseLapTime(parseFloat(minLap.toFixed(1)));

        // Parse Pit Stops
        const rawStops = pitStopsRes?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
        const parsedStops = parsePitStops(rawStops, parsedDrivers);
        setPitStops(parsedStops);

        // Build Grand Prix Summary Model
        const winner = parsedDrivers.find((d) => d.position === '1') || parsedDrivers[0];
        const fastestLapDriver = parsedDrivers.find(
          (d) => d.fastestLapSecs === minLap && d.fastestLapRawTime
        );

        const poleResult = qualiRes?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0];
        const polePosition = poleResult
          ? {
              driverName: `${poleResult.Driver.givenName} ${poleResult.Driver.familyName}`,
              code: poleResult.Driver.code || poleResult.Driver.familyName.slice(0, 3).toUpperCase(),
              time: poleResult.Q3 || poleResult.Q2 || poleResult.Q1
            }
          : undefined;

        setGrandPrixSummary({
          season: selectedSeason,
          round: selectedRound,
          raceName: raceInfo?.raceName || 'Grand Prix',
          circuitId: raceInfo?.Circuit?.circuitId || '',
          circuitName: raceInfo?.Circuit?.circuitName || 'Circuit',
          locality: raceInfo?.Circuit?.Location?.locality,
          country: raceInfo?.Circuit?.Location?.country,
          date: raceInfo?.date || '',
          totalRaceLaps: maxLaps,
          winner: winner
            ? {
                driverId: winner.driverId,
                name: `${winner.givenName} ${winner.familyName}`,
                code: winner.code,
                constructorName: winner.constructorName
              }
            : undefined,
          fastestLap: fastestLapDriver
            ? {
                driverName: `${fastestLapDriver.givenName} ${fastestLapDriver.familyName}`,
                code: fastestLapDriver.code,
                time: fastestLapDriver.fastestLapRawTime || `${minLap.toFixed(3)}s`,
                speed: fastestLapDriver.fastestLapSpeed
              }
            : undefined,
          polePosition
        });
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(`Failed to load session results: ${error.message}`);
      } finally {
        setLoadingSession(false);
      }
    }

    loadSessionData();

    return () => {
      isMounted = false;
    };
  }, [selectedSeason, selectedRound]);

  // -------------------------------------------------------------
  // 3. FETCH CONTINUOUS LAP RECORDS FOR DRIVER A & DRIVER B
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedRound || !selectedDriverA || totalRaceLaps <= 0) return;

    let isMounted = true;

    async function loadDriverLaps() {
      setLoadingLaps(true);

      try {
        const pitLapsA = pitStops
          .filter((p) => p.driverId === selectedDriverA)
          .map((p) => p.lap);
        const pitLapsB = pitStops
          .filter((p) => p.driverId === selectedDriverB)
          .map((p) => p.lap);

        // Fetch laps for Driver A and Driver B in parallel
        const [resA, resB] = await Promise.all([
          getJSON<{
            MRData?: {
              RaceTable?: {
                Races?: Array<{
                  Laps?: Array<{
                    number: string;
                    Timings?: Array<{ driverId: string; time: string; position?: string }>;
                  }>;
                }>;
              };
            };
          }>(`${API_BASE}/${selectedSeason}/${selectedRound}/drivers/${selectedDriverA}/laps.json?limit=100`).catch(() => null),

          selectedDriverB
            ? getJSON<{
                MRData?: {
                  RaceTable?: {
                    Races?: Array<{
                      Laps?: Array<{
                        number: string;
                        Timings?: Array<{ driverId: string; time: string; position?: string }>;
                      }>;
                    }>;
                  };
                };
              }>(`${API_BASE}/${selectedSeason}/${selectedRound}/drivers/${selectedDriverB}/laps.json?limit=100`).catch(() => null)
            : Promise.resolve(null)
        ]);

        if (!isMounted) return;

        const rawLapsA = resA?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
        const continuousA = buildContinuousLapRecords(
          totalRaceLaps,
          rawLapsA,
          selectedDriverA,
          pitLapsA
        );
        setDriverALaps(continuousA);

        if (selectedDriverB && resB) {
          const rawLapsB = resB?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
          const continuousB = buildContinuousLapRecords(
            totalRaceLaps,
            rawLapsB,
            selectedDriverB,
            pitLapsB
          );
          setDriverBLaps(continuousB);
        } else {
          setDriverBLaps([]);
        }
      } catch {
        // Fallback gracefully if lap telemetry endpoint is empty
      } finally {
        if (isMounted) setLoadingLaps(false);
      }
    }

    loadDriverLaps();

    return () => {
      isMounted = false;
    };
  }, [selectedSeason, selectedRound, selectedDriverA, selectedDriverB, totalRaceLaps, pitStops]);

  // Current circuit identifier
  const currentCircuitId = grandPrixSummary?.circuitId || 'monza';

  return (
    <section className="relative z-10 w-full box-border px-3 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Question-Driven Navigation Header & Cockpit Tabs */}
      <LabHeader
        activeQuestion={activeQuestion}
        onSelectQuestion={setActiveQuestion}
      />

      {/* 2. Shared Grand Prix Session & Driver Comparator Bar */}
      <GrandPrixSummaryBar
        summary={grandPrixSummary}
        rounds={rounds}
        selectedRound={selectedRound}
        onSelectRound={setSelectedRound}
        isLoadingRounds={loadingRounds}
        drivers={driversList}
        driverA={selectedDriverA}
        onSelectDriverA={setSelectedDriverA}
        driverB={selectedDriverB}
        onSelectDriverB={setSelectedDriverB}
        showDriverSelectors={activeQuestion !== 'circuit_strengths'}
      />

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-500/80 bg-red-950/40 p-4 text-center font-mono text-xs text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 3. Question Workspaces */}
      <div className="mt-6">
        {/* QUESTION 1: PIT STOP REVIEW */}
        {activeQuestion === 'pit_stop_review' && (
          <PitStopReview
            pitStops={pitStops}
            driversList={driversList}
            totalRaceLaps={totalRaceLaps}
            driverALaps={driverALaps}
            driverBLaps={driverBLaps}
            selectedDriverA={selectedDriverA}
            selectedDriverB={selectedDriverB}
            onSelectDriverA={setSelectedDriverA}
            onSelectDriverB={setSelectedDriverB}
            isLoading={loadingSession || loadingLaps}
            benchmarkBaseLapTime={benchmarkBaseLapTime}
          />
        )}

        {/* QUESTION 2: WHERE WAS TIME LOST? */}
        {activeQuestion === 'time_lost' && (
          <WhereWasTimeLost
            driverALaps={driverALaps}
            driverBLaps={driverBLaps}
            selectedDriverA={selectedDriverA}
            selectedDriverB={selectedDriverB}
            driversList={driversList}
            totalRaceLaps={totalRaceLaps}
            isLoading={loadingSession || loadingLaps}
          />
        )}

        {/* QUESTION 3: TYRE STINT STORY */}
        {activeQuestion === 'tyre_stints' && (
          <TyreStintStory
            pitStops={pitStops}
            driversList={driversList}
            totalRaceLaps={totalRaceLaps}
            driverALaps={driverALaps}
            driverBLaps={driverBLaps}
            selectedDriverA={selectedDriverA}
            selectedDriverB={selectedDriverB}
            circuitId={currentCircuitId}
            isLoading={loadingSession || loadingLaps}
          />
        )}

        {/* QUESTION 4: CIRCUIT STRENGTHS */}
        {activeQuestion === 'circuit_strengths' && (
          <CircuitStrengths
            circuitId={currentCircuitId}
            raceName={grandPrixSummary?.raceName}
          />
        )}
      </div>
    </section>
  );
}
