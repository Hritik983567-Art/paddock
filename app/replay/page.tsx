'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import {
  fetchSeasonRounds,
  loadReplaySession,
  FullReplaySessionData,
  RaceReplaySessionData,
  RaceEvent
} from '../lib/replayDataService';

// Import Modular Workstation Sub-Components
import { ReplayHeader } from '../components/replay/ReplayHeader';
import { RaceSelector } from '../components/replay/RaceSelector';
import { CircuitReplay } from '../components/replay/CircuitReplay';
import { ReplayTimeline } from '../components/replay/ReplayTimeline';
import { LapNavigator } from '../components/replay/LapNavigator';
import { EventFeed } from '../components/replay/EventFeed';
import { DriverComparison } from '../components/replay/DriverComparison';
import { TelemetryPanel } from '../components/replay/TelemetryPanel';
import { LapDelta } from '../components/replay/LapDelta';
import { PitStopPanel } from '../components/replay/PitStopPanel';
import { TyreStrategy } from '../components/replay/TyreStrategy';
import { PositionChart } from '../components/replay/PositionChart';
import { ReplaySummary } from '../components/replay/ReplaySummary';
import { JumpToMenu } from '../components/replay/JumpToMenu';
import { KeyboardShortcutsModal } from '../components/replay/KeyboardShortcutsModal';
import { ALL_F1_SEASONS } from '../utils/api';

export default function ReplayPage() {
  const { selectedSeason, setSelectedSeason } = useSeason();
  const seasons = ALL_F1_SEASONS;

  const [rounds, setRounds] = useState<{ round: string; raceName: string; circuitId: string; date: string; hasSprint?: boolean }[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [sessionType, setSessionType] = useState<'race' | 'quali' | 'sprint_quali' | 'sprint'>('race');

  // Reset sprint session type to race if newly selected round doesn't have a sprint
  useEffect(() => {
    const currentRoundObj = rounds.find(r => r.round === selectedRound);
    if (currentRoundObj && !currentRoundObj.hasSprint && (sessionType === 'sprint' || sessionType === 'sprint_quali')) {
      setSessionType('race');
    }
  }, [selectedRound, rounds, sessionType]);

  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const [sessionData, setSessionData] = useState<FullReplaySessionData | null>(null);

  // Playback & Interactive Selection States
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // Default to Normal 800ms per lap

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [driverAId, setDriverAId] = useState<string | null>(null);
  const [driverBId, setDriverBId] = useState<string | null>(null);
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);
  const [showTraces, setShowTraces] = useState(false);

  const [isMiniMap, setIsMiniMap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch completed rounds for chosen season
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setSessionError('');
      setSessionData(null);
      setSelectedRound('');
      setIsPlaying(false);

      try {
        const roundList = await fetchSeasonRounds(selectedSeason);
        setRounds(roundList);

        if (roundList.length > 0) {
          const now = new Date();
          const past = roundList.filter((r: any) => new Date(r.date) <= now);
          if (past.length > 0) {
            setSelectedRound(past[past.length - 1].round);
          } else {
            setSelectedRound(roundList[0].round);
          }
        }
      } catch (e: any) {
        setSessionError(e.message || 'Could not fetch session rounds.');
      } finally {
        setLoadingRounds(false);
      }
    }

    loadRounds();
  }, [selectedSeason]);

  // Clean play timer on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // 2. Fetch & Load Session Replay Data
  const handleLoadSession = async () => {
    stopPlayback();
    setSessionError('');
    setSessionData(null);

    if (!selectedRound) {
      setSessionError('Please select a Grand Prix round.');
      return;
    }

    setLoadingSession(true);

    try {
      const data = await loadReplaySession(selectedSeason, selectedRound, sessionType);
      setSessionData(data);
      setCurrentLap(1);

      if (data.mode === 'race') {
        const dIds = data.driverIds;
        if (dIds.length >= 2) {
          setSelectedDriverId(dIds[0]);
          setDriverAId(dIds[0]);
          setDriverBId(dIds[1]);
        }
      }
    } catch (e: any) {
      setSessionError(e.message || 'Replay data unavailable for this session.');
    } finally {
      setLoadingSession(false);
    }
  };

  // 3. Playback Timing Loop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!sessionData || sessionData.mode !== 'race') return;
    setIsPlaying(true);

    const total = sessionData.totalLaps;
    playTimerRef.current = setInterval(() => {
      setCurrentLap(prev => {
        const next = prev + 1;
        if (next > total) {
          stopPlayback();
          return prev;
        }
        return next;
      });
    }, speed);
  }, [isPlaying, sessionData, speed, stopPlayback]);

  // Re-sync interval speed changes while playing
  useEffect(() => {
    if (isPlaying && sessionData && sessionData.mode === 'race') {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      const total = sessionData.totalLaps;
      playTimerRef.current = setInterval(() => {
        setCurrentLap(prev => {
          const next = prev + 1;
          if (next > total) {
            stopPlayback();
            return prev;
          }
          return next;
        });
      }, speed);
    }
  }, [speed, isPlaying, sessionData, stopPlayback]);

  // 4. Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stopPlayback();
        if (e.shiftKey) {
          setCurrentLap(prev => Math.max(1, prev - 1));
        } else {
          setCurrentLap(prev => Math.max(1, prev - 1));
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stopPlayback();
        const total = sessionData && sessionData.mode === 'race' ? sessionData.totalLaps : 58;
        if (e.shiftKey) {
          setCurrentLap(prev => Math.min(total, prev + 1));
        } else {
          setCurrentLap(prev => Math.min(total, prev + 1));
        }
      } else if (e.key === 'r' || e.key === 'R') {
        stopPlayback();
        setCurrentLap(1);
      } else if (e.key === '1') setSpeed(3200);
      else if (e.key === '2') setSpeed(1600);
      else if (e.key === '3') setSpeed(800);
      else if (e.key === '4') setSpeed(400);
      else if (e.key === '5') setSpeed(200);
      else if (e.code === 'Escape') {
        setShowShortcutsModal(false);
        setIsFullscreen(false);
      } else if (e.key === '?') {
        setShowShortcutsModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stopPlayback, sessionData]);

  // Handle Event Clicking & Direct Jump
  const handleSelectEvent = (ev: RaceEvent) => {
    stopPlayback();
    setCurrentLap(ev.lap);
  };

  const isRaceMode = sessionData && sessionData.mode === 'race';
  const raceData = isRaceMode ? (sessionData as RaceReplaySessionData) : null;
  const currentLapData = raceData ? raceData.laps.find(l => l.lapNumber === currentLap) || raceData.laps[0] : null;

  return (
    <section className="min-h-screen bg-[#050810] text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Workstation Header */}
        <ReplayHeader
          season={selectedSeason}
          raceName={sessionData?.raceName || ''}
          circuitName={sessionData?.circuitName || ''}
          sessionType={sessionType}
          isPlaying={isPlaying}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
        />

        {/* Race & Session Selector */}
        <RaceSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onSelectSeason={setSelectedSeason}
          rounds={rounds}
          selectedRound={selectedRound}
          onSelectRound={setSelectedRound}
          sessionType={sessionType}
          onSelectSessionType={setSessionType}
          onLoadSession={handleLoadSession}
          loadingRounds={loadingRounds}
          loadingSession={loadingSession}
          sessionError={sessionError}
        />

        {/* Initial Empty State / Instructions */}
        {!sessionData && !loadingSession && !sessionError && (
          <div className="p-12 text-center bg-[#080C14] border border-slate-800 rounded-xl shadow-xl font-mono">
            <span className="text-4xl block mb-3">🏁</span>
            <h2 className="text-base font-black text-white uppercase tracking-wider mb-2">
              F1 REPLAY & TIMING WORKSTATION
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto mb-4">
              Select a Grand Prix season, round, and session above, then click <span className="text-cyan-400 font-bold">LOAD REPLAY</span> to explore race telemetry, driver positioning, event feeds, and pit stop timing.
            </p>
          </div>
        )}

        {/* Active Replay Workstation Display */}
        {sessionData && (
          <div>
            {/* Quick-Jump Milestone Menu */}
            {raceData && (
              <JumpToMenu
                events={raceData.events}
                totalLaps={raceData.totalLaps}
                onJumpToLap={(lap) => {
                  stopPlayback();
                  setCurrentLap(lap);
                }}
              />
            )}

            {/* Main Circuit Canvas + Right Event/Leaderboard Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* 2D Circuit Map (2 Columns on Desktop) */}
              <div className="lg:col-span-2">
                <CircuitReplay
                  circuitId={sessionData.circuitId}
                  circuitName={sessionData.circuitName}
                  currentLap={currentLap}
                  totalLaps={raceData ? raceData.totalLaps : 1}
                  positions={currentLapData ? currentLapData.positions : {}}
                  lapTimes={currentLapData ? currentLapData.lapTimes : {}}
                  gaps={currentLapData ? currentLapData.gaps : {}}
                  driverMeta={sessionData.driverMeta}
                  selectedDriverId={selectedDriverId}
                  driverAId={driverAId}
                  driverBId={driverBId}
                  showTraces={showTraces}
                  hoveredDriverId={hoveredDriverId}
                  onSelectDriver={(id) => {
                    setSelectedDriverId(id);
                    if (!driverAId) setDriverAId(id);
                    else if (!driverBId && id !== driverAId) setDriverBId(id);
                  }}
                  onHoverDriver={setHoveredDriverId}
                  isMiniMap={isMiniMap}
                  onToggleMiniMap={() => setIsMiniMap(!isMiniMap)}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                />
              </div>

              {/* Race Event Feed (1 Column on Desktop) */}
              <div>
                {raceData ? (
                  <EventFeed
                    events={raceData.events}
                    currentLap={currentLap}
                    onSelectEvent={handleSelectEvent}
                  />
                ) : (
                  <div className="p-4 bg-[#080C14] border border-slate-800 rounded-xl h-[400px] flex items-center justify-center font-mono text-xs text-slate-500">
                    Qualifying Replay Active
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Scrubber & Controls */}
            {raceData && (
              <ReplayTimeline
                currentLap={currentLap}
                totalLaps={raceData.totalLaps}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                speed={speed}
                onSelectSpeed={setSpeed}
                onStepBack10s={() => { stopPlayback(); setCurrentLap(prev => Math.max(1, prev - 1)); }}
                onStepFwd10s={() => { stopPlayback(); setCurrentLap(prev => Math.min(raceData.totalLaps, prev + 1)); }}
                onStepPrevLap={() => { stopPlayback(); setCurrentLap(prev => Math.max(1, prev - 1)); }}
                onStepNextLap={() => { stopPlayback(); setCurrentLap(prev => Math.min(raceData.totalLaps, prev + 1)); }}
                onReset={() => { stopPlayback(); setCurrentLap(1); }}
                onScrubLap={(lap) => { stopPlayback(); setCurrentLap(lap); }}
                events={raceData.events}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {/* Lap Navigator Bar */}
            {raceData && (
              <div className="flex justify-center mb-4">
                <LapNavigator
                  currentLap={currentLap}
                  totalLaps={raceData.totalLaps}
                  onSelectLap={(lap) => { stopPlayback(); setCurrentLap(lap); }}
                  onPrevLap={() => { stopPlayback(); setCurrentLap(prev => Math.max(1, prev - 1)); }}
                  onNextLap={() => { stopPlayback(); setCurrentLap(prev => Math.min(raceData.totalLaps, prev + 1)); }}
                />
              </div>
            )}

            {/* Driver Live Telemetry & Driver Comparison */}
            {raceData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TelemetryPanel
                  driverId={selectedDriverId}
                  driverMeta={raceData.driverMeta}
                  currentLap={currentLap}
                  position={selectedDriverId && currentLapData ? currentLapData.positions[selectedDriverId] : null}
                  lapTime={selectedDriverId && currentLapData ? currentLapData.lapTimes[selectedDriverId] : null}
                  gap={selectedDriverId && currentLapData ? currentLapData.gaps[selectedDriverId] || 'N/A' : 'N/A'}
                />

                <DriverComparison
                  driverIds={raceData.driverIds}
                  driverMeta={raceData.driverMeta}
                  driverAId={driverAId}
                  driverBId={driverBId}
                  onSelectDriverA={setDriverAId}
                  onSelectDriverB={setDriverBId}
                  currentLap={currentLap}
                  positions={currentLapData ? currentLapData.positions : {}}
                  lapTimes={currentLapData ? currentLapData.lapTimes : {}}
                  gaps={currentLapData ? currentLapData.gaps : {}}
                  pitStops={raceData.pitStops}
                  tyreStints={raceData.tyreStints}
                  showTraces={showTraces}
                  onToggleTraces={() => setShowTraces(!showTraces)}
                />
              </div>
            )}

            {/* Lap Delta & Pit Stop Analysis */}
            {raceData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LapDelta
                  driverId={selectedDriverId}
                  driverMeta={raceData.driverMeta}
                  laps={raceData.laps}
                  totalLaps={raceData.totalLaps}
                />

                <PitStopPanel
                  pitStops={raceData.pitStops}
                  currentLap={currentLap}
                  onJumpToPitLap={(lap) => { stopPlayback(); setCurrentLap(lap); }}
                />
              </div>
            )}

            {/* Tyre Strategy Timeline */}
            {raceData && (
              <TyreStrategy
                driverIds={raceData.driverIds}
                driverMeta={raceData.driverMeta}
                tyreStints={raceData.tyreStints}
                totalLaps={raceData.totalLaps}
              />
            )}

            {/* Lap-by-Lap Position History SVG Chart */}
            {raceData && (
              <PositionChart
                laps={raceData.laps}
                driverMeta={raceData.driverMeta}
                currentLap={currentLap}
                selectedDriverId={selectedDriverId}
                hoveredDriverId={hoveredDriverId}
                onHoverDriver={setHoveredDriverId}
                onSelectDriver={setSelectedDriverId}
              />
            )}

            {/* Collapsible Race Summary */}
            {raceData && <ReplaySummary sessionData={raceData} />}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Helper Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </section>
  );
}
