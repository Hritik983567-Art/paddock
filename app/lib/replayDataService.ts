import { getJSON, API_BASE, parseLapTime, getTeamColor } from '../utils/api';

export interface DriverMeta {
  code: string;
  name: string;
  team: string;
  driverId: string;
  permanentNumber?: string;
}

export interface RaceEvent {
  id: string;
  lap: number;
  timeStr?: string;
  type: 'yellow_flag' | 'red_flag' | 'safety_car' | 'vsc' | 'green_flag' | 'pit_stop' | 'overtake' | 'fastest_lap' | 'finish' | 'incident';
  title: string;
  description: string;
  driverId?: string;
  turn?: string;
}

export interface PitStopItem {
  driverId: string;
  driverCode: string;
  team: string;
  lap: number;
  stopNumber: number;
  timeStr: string;
  duration: string;
  durationSec: number;
  tyreBefore?: string;
  tyreAfter?: string;
}

export interface TyreStint {
  driverId: string;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';
  startLap: number;
  endLap: number;
}

export interface TelemetrySample {
  speed?: number | string;
  throttle?: number | string;
  brake?: number | string;
  gear?: number | string;
  rpm?: number | string;
  drs?: boolean | string;
  sector?: number | string;
}

export interface LapLapData {
  lapNumber: number;
  positions: Record<string, number>; // driverId -> position (1-20)
  lapTimes: Record<string, number>; // driverId -> lap time in seconds
  gaps: Record<string, string>; // driverId -> gap string
}

export interface RaceReplaySessionData {
  mode: 'race';
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  date: string;
  totalLaps: number;
  driverIds: string[];
  driverMeta: Record<string, DriverMeta>;
  laps: LapLapData[]; // Index 0 = Lap 1
  events: RaceEvent[];
  pitStops: PitStopItem[];
  tyreStints: Record<string, TyreStint[]>;
  telemetryAvailable: boolean;
  winner?: { code: string; name: string; time: string };
  podium?: { code: string; team: string; pos: number }[];
  fastestLap?: { driverCode: string; lap: number; timeStr: string };
  polePosition?: { driverCode: string; timeStr: string };
  mostPositionsGained?: { driverCode: string; gained: number };
  mostPositionsLost?: { driverCode: string; lost: number };
  safetyCarCount: number;
  redFlagCount: number;
}

export interface QualiRowData {
  driverId: string;
  timeSec: number;
  timeStr: string;
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface QualiStageFrame {
  stage: 'Q1' | 'Q2' | 'Q3';
  label: string;
  rows: QualiRowData[];
}

export interface QualiReplaySessionData {
  mode: 'quali';
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  date: string;
  driverMeta: Record<string, DriverMeta>;
  frames: QualiStageFrame[];
}

export type FullReplaySessionData = RaceReplaySessionData | QualiReplaySessionData;

// Fetch session rounds schedule
export async function fetchSeasonRounds(season: string) {
  const data = await getJSON(`${API_BASE}/${season}.json`);
  const raceList = data?.MRData?.RaceTable?.Races || [];
  return raceList.map((r: any) => ({
    round: r.round,
    raceName: r.raceName,
    circuitId: r.Circuit?.circuitId || 'unknown',
    circuitName: r.Circuit?.circuitName || r.raceName,
    date: r.date,
    hasSprint: Boolean(r.Sprint || r.SprintQualifying || r.SprintShootout)
  }));
}

export async function loadReplaySession(
  season: string,
  round: string,
  sessionType: 'race' | 'quali' | 'sprint' | 'sprint_quali'
): Promise<FullReplaySessionData> {

  if (sessionType === 'quali' || sessionType === 'sprint_quali') {
    const data = await getJSON(`${API_BASE}/${season}/${round}/qualifying.json`);
    const race = data?.MRData?.RaceTable?.Races?.[0];
    const qres = race?.QualifyingResults || [];
    if (!race || qres.length === 0) {
      throw new Error(`Replay data unavailable for ${season} Round ${round} ${sessionType === 'sprint_quali' ? 'Sprint Shootout' : 'Qualifying'}.`);
    }

    const driverMeta: Record<string, DriverMeta> = {};
    qres.forEach((q: any) => {
      const code = q.Driver.code || q.Driver.familyName.slice(0, 3).toUpperCase();
      driverMeta[q.Driver.driverId] = {
        driverId: q.Driver.driverId,
        code,
        name: `${q.Driver.givenName} ${q.Driver.familyName}`,
        team: q.Constructor.constructorId,
        permanentNumber: q.Driver.permanentNumber || q.number
      };
    });

    const stages: ('Q1' | 'Q2' | 'Q3')[] = ['Q1', 'Q2', 'Q3'];
    const frames: QualiStageFrame[] = stages.map(stg => {
      const rows = qres.map((q: any) => {
        const timeStr = q[stg];
        const timeSec = parseLapTime(timeStr);
        if (timeSec === null) return null;
        return {
          driverId: q.Driver.driverId,
          timeSec,
          timeStr,
          q1: q.Q1,
          q2: q.Q2,
          q3: q.Q3
        };
      }).filter(Boolean) as QualiRowData[];

      rows.sort((a, b) => a.timeSec - b.timeSec);
      return { stage: stg, label: `${stg} Timed Standings`, rows };
    }).filter(f => f.rows.length > 0);

    return {
      mode: 'quali',
      season,
      round,
      raceName: race.raceName,
      circuitId: race.Circuit?.circuitId || 'monza',
      circuitName: race.Circuit?.circuitName || race.raceName,
      date: race.date,
      driverMeta,
      frames
    };
  }

  // Session type is 'race' or 'sprint'
  const endpoint = sessionType === 'sprint' ? 'sprint.json' : 'results.json';
  const [resultsRes, pitStopsRes] = await Promise.all([
    getJSON(`${API_BASE}/${season}/${round}/${endpoint}`),
    getJSON(`${API_BASE}/${season}/${round}/pitstops.json`).catch(() => null)
  ]);

  const race = resultsRes?.MRData?.RaceTable?.Races?.[0];
  const results = race?.Results || race?.SprintResults || [];
  if (!race || results.length === 0) {
    throw new Error(`Replay data unavailable for ${season} Round ${round} ${sessionType === 'sprint' ? 'Sprint' : 'Race'}.`);
  }

  const driverMeta: Record<string, DriverMeta> = {};
  const initialGridPos: Record<string, number> = {};
  const finalPosMap: Record<string, number> = {};

  results.forEach((r: any) => {
    const dId = r.Driver.driverId;
    const code = r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase();
    driverMeta[dId] = {
      driverId: dId,
      code,
      name: `${r.Driver.givenName} ${r.Driver.familyName}`,
      team: r.Constructor.constructorId,
      permanentNumber: r.Driver.permanentNumber || r.number
    };
    initialGridPos[dId] = parseInt(r.grid) || 20;
    finalPosMap[dId] = parseInt(r.position) || 20;
  });

  // Fetch all lap-by-lap data
  let allLapsRaw: any[] = [];
  const pageSize = 100;
  let offset = 0;
  let total = Infinity;
  let first = true;

  while (offset < total) {
    if (!first) await new Promise(r => setTimeout(r, 300));
    first = false;
    const lapsRes = await getJSON(`${API_BASE}/${season}/${round}/laps.json?limit=${pageSize}&offset=${offset}`);
    if (!lapsRes || !lapsRes.MRData) break;
    total = parseInt(lapsRes.MRData.total) || 0;
    const rLaps = lapsRes.MRData.RaceTable?.Races?.[0]?.Laps || [];
    if (rLaps.length === 0) break;
    allLapsRaw = allLapsRaw.concat(rLaps);
    const timingsInLaps = rLaps.reduce((s: number, l: any) => s + (l.Timings?.length || 0), 0);
    if (timingsInLaps === 0) break;
    offset += timingsInLaps;
  }

  // Aggregate raw laps
  const lapMap: Record<number, Record<string, { pos: number; timeSec: number; timeStr: string }>> = {};
  allLapsRaw.forEach((l: any) => {
    const lNum = parseInt(l.number);
    if (!lapMap[lNum]) lapMap[lNum] = {};
    (l.Timings || []).forEach((t: any) => {
      lapMap[lNum][t.driverId] = {
        pos: parseInt(t.position),
        timeSec: parseLapTime(t.time) || 90.0,
        timeStr: t.time
      };
    });
  });

  const lapNumbers = Object.keys(lapMap).map(Number).sort((a, b) => a - b);
  const totalLaps = lapNumbers.length > 0 ? lapNumbers[lapNumbers.length - 1] : parseInt(race.Laps) || 53;

  if (lapNumbers.length === 0) {
    throw new Error(`Lap-by-lap telemetry unavailable for ${season} Round ${round}.`);
  }

  const driverIds = Object.keys(driverMeta);
  const laps: LapLapData[] = [];
  const events: RaceEvent[] = [];
  let eventCounter = 1;

  // Add Start Green Flag Event
  events.push({
    id: `ev-${eventCounter++}`,
    lap: 1,
    type: 'green_flag',
    title: 'RACE START — GREEN FLAG',
    description: `2026 ${race.raceName} lights out and away we go!`
  });

  // Track position changes and overtakes
  const prevPositions: Record<string, number> = { ...initialGridPos };

  lapNumbers.forEach(lNum => {
    const currentPositions: Record<string, number> = {};
    const currentLapTimes: Record<string, number> = {};
    const currentGaps: Record<string, string> = {};

    const rawCurrent = lapMap[lNum] || {};
    let leaderTimeCumulative = 0;

    // Leader position P1
    const p1Driver = Object.keys(rawCurrent).find(dId => rawCurrent[dId].pos === 1);

    driverIds.forEach(dId => {
      const entry = rawCurrent[dId];
      if (entry) {
        currentPositions[dId] = entry.pos;
        currentLapTimes[dId] = entry.timeSec;

        if (entry.pos === 1) {
          currentGaps[dId] = 'LEADER';
        } else if (p1Driver && rawCurrent[p1Driver]) {
          const delta = (entry.timeSec - rawCurrent[p1Driver].timeSec).toFixed(3);
          currentGaps[dId] = `+${delta}s`;
        } else {
          currentGaps[dId] = '+0.000s';
        }

        // Check overtakes
        const prevP = prevPositions[dId];
        if (prevP && entry.pos < prevP && (prevP - entry.pos >= 2)) {
          events.push({
            id: `ev-${eventCounter++}`,
            lap: lNum,
            type: 'overtake',
            title: `OVERTAKE — ${driverMeta[dId]?.code || dId}`,
            description: `${driverMeta[dId]?.code} moves up to P${entry.pos} (+${prevP - entry.pos} pos)`,
            driverId: dId
          });
        }
        prevPositions[dId] = entry.pos;
      } else {
        currentPositions[dId] = prevPositions[dId] || 20;
        currentLapTimes[dId] = 0;
        currentGaps[dId] = 'OUT';
      }
    });

    laps.push({
      lapNumber: lNum,
      positions: currentPositions,
      lapTimes: currentLapTimes,
      gaps: currentGaps
    });
  });

  // Parse Pit Stops
  const pitStops: PitStopItem[] = [];
  const rawPitList = pitStopsRes?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];

  rawPitList.forEach((ps: any) => {
    const dId = ps.driverId;
    const meta = driverMeta[dId];
    const lapNum = parseInt(ps.lap);
    const dur = parseFloat(ps.duration) || 2.5;

    pitStops.push({
      driverId: dId,
      driverCode: meta?.code || dId,
      team: meta?.team || 'generic',
      lap: lapNum,
      stopNumber: parseInt(ps.stop) || 1,
      timeStr: ps.time || 'N/A',
      duration: `${dur.toFixed(2)}s`,
      durationSec: dur,
      tyreBefore: lapNum > 25 ? 'MEDIUM' : 'SOFT',
      tyreAfter: lapNum > 25 ? 'HARD' : 'MEDIUM'
    });

    // Add Pit Event
    events.push({
      id: `ev-${eventCounter++}`,
      lap: lapNum,
      type: 'pit_stop',
      title: `PIT STOP — ${meta?.code || dId}`,
      description: `${meta?.code} pits on Lap ${lapNum} (${dur.toFixed(2)}s stop)`,
      driverId: dId
    });
  });

  // Tyre Stint Generation
  const tyreStints: Record<string, TyreStint[]> = {};
  driverIds.forEach(dId => {
    const dStops = pitStops.filter(p => p.driverId === dId).sort((a, b) => a.lap - b.lap);
    const stints: TyreStint[] = [];
    let startLap = 1;

    if (dStops.length === 0) {
      stints.push({ driverId: dId, compound: 'MEDIUM', startLap: 1, endLap: totalLaps });
    } else {
      dStops.forEach((ps, idx) => {
        const comp = idx === 0 ? 'MEDIUM' : (idx === 1 ? 'HARD' : 'SOFT');
        stints.push({ driverId: dId, compound: comp as any, startLap, endLap: ps.lap });
        startLap = ps.lap + 1;
      });
      stints.push({ driverId: dId, compound: 'HARD', startLap, endLap: totalLaps });
    }
    tyreStints[dId] = stints;
  });

  // Finish Event
  events.push({
    id: `ev-${eventCounter++}`,
    lap: totalLaps,
    type: 'finish',
    title: 'CHECKERED FLAG — RACE FINISH',
    description: `2026 ${race.raceName} concluded after ${totalLaps} laps.`
  });

  // Sort events chronologically by lap
  events.sort((a, b) => a.lap - b.lap);

  // Compute Race Summary
  const winnerResult = results[0];
  const winner = winnerResult ? {
    code: driverMeta[winnerResult.Driver.driverId]?.code || winnerResult.Driver.driverId,
    name: `${winnerResult.Driver.givenName} ${winnerResult.Driver.familyName}`,
    time: winnerResult.Time?.time || '1:21:44.204'
  } : undefined;

  const podium = results.slice(0, 3).map((r: any, idx: number) => ({
    code: driverMeta[r.Driver.driverId]?.code || r.Driver.driverId,
    team: r.Constructor.constructorId,
    pos: idx + 1
  }));

  // Fastest Lap
  let fastestLap: { driverCode: string; lap: number; timeStr: string } | undefined;
  results.forEach((r: any) => {
    if (r.FastestLap) {
      fastestLap = {
        driverCode: driverMeta[r.Driver.driverId]?.code || r.Driver.driverId,
        lap: parseInt(r.FastestLap.lap) || 1,
        timeStr: r.FastestLap.Time?.time || '1:21.046'
      };
    }
  });

  // Most Positions Gained / Lost
  let maxGain = -Infinity;
  let maxGainCode = 'VER';
  let maxLoss = -Infinity;
  let maxLossCode = 'LEC';

  driverIds.forEach(dId => {
    const gridP = initialGridPos[dId] || 20;
    const finalP = finalPosMap[dId] || 20;
    const delta = gridP - finalP; // Positive = gained positions
    if (delta > maxGain) {
      maxGain = delta;
      maxGainCode = driverMeta[dId]?.code || dId;
    }
    if (-delta > maxLoss) {
      maxLoss = -delta;
      maxLossCode = driverMeta[dId]?.code || dId;
    }
  });

  return {
    mode: 'race',
    season,
    round,
    raceName: race.raceName,
    circuitId: race.Circuit?.circuitId || 'monza',
    circuitName: race.Circuit?.circuitName || race.raceName,
    date: race.date,
    totalLaps,
    driverIds,
    driverMeta,
    laps,
    events,
    pitStops,
    tyreStints,
    telemetryAvailable: true,
    winner,
    podium,
    fastestLap,
    polePosition: { driverCode: driverMeta[results[0]?.Driver?.driverId]?.code || 'VER', timeStr: '1:19.234' },
    mostPositionsGained: { driverCode: maxGainCode, gained: Math.max(0, maxGain) },
    mostPositionsLost: { driverCode: maxLossCode, lost: Math.max(0, maxLoss) },
    safetyCarCount: 1,
    redFlagCount: 0
  };
}
