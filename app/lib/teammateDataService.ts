import { getJSON, API_BASE, parseLapTime, getTeamColor } from '../utils/api';

export interface DriverInfo {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  name: string;
  permanentNumber?: string;
  nationality?: string;
  teamId: string;
  teamName: string;
  position?: number;
  points?: number;
  wins?: number;
}

export interface TeamOption {
  constructorId: string;
  constructorName: string;
  drivers: DriverInfo[];
}

export interface RaceRoundResult {
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  date: string;
  qualiA: number | null; // grid or quali position
  qualiB: number | null;
  qualiStrA: string;
  qualiStrB: string;
  raceA: number | null; // finish position
  raceB: number | null;
  statusA: string;
  statusB: string;
  pointsA: number;
  pointsB: number;
  cumPointsA: number;
  cumPointsB: number;
  fastestLapA?: boolean;
  fastestLapB?: boolean;
}

export interface TeammateComparisonData {
  season: string;
  teamName: string;
  teamColor: string;
  driverA: DriverInfo;
  driverB: DriverInfo;
  scorecard: {
    pointsA: number;
    pointsB: number;
    posA: number;
    posB: number;
    winsA: number;
    winsB: number;
    podiumsA: number;
    podiumsB: number;
    polesA: number;
    polesB: number;
    fastestLapsA: number;
    fastestLapsB: number;
    dnfsA: number;
    dnfsB: number;
  };
  qualiH2H: {
    scoreA: number;
    scoreB: number;
    bestA: number;
    bestB: number;
    avgA: number;
    avgB: number;
    q1ExitsA: number;
    q1ExitsB: number;
    q2ExitsA: number;
    q2ExitsB: number;
    q3AppsA: number;
    q3AppsB: number;
  };
  raceH2H: {
    scoreA: number;
    scoreB: number;
    bestA: number;
    bestB: number;
    avgA: number;
    avgB: number;
    pointsFinishesA: number;
    pointsFinishesB: number;
    positionsGainedA: number;
    positionsGainedB: number;
  };
  recentFormA: { label: string; isDnf: boolean }[];
  recentFormB: { label: string; isDnf: boolean }[];
  gaps: {
    pointsGap: number; // A - B
    avgQualiGap: number; // A - B (negative means A qualifies higher)
    avgRaceGap: number; // A - B (negative means A finishes higher)
  };
  rounds: RaceRoundResult[];
  reliability: {
    dnfDetailsA: { round: number; raceName: string; status: string }[];
    dnfDetailsB: { round: number; raceName: string; status: string }[];
  };
}

// 1. Fetch available teams & drivers for chosen season
export async function fetchSeasonTeams(season: string): Promise<TeamOption[]> {
  const data = await getJSON(`${API_BASE}/${season}/driverStandings.json`);
  const standingsList = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  const teamMap: Record<string, { name: string; drivers: DriverInfo[] }> = {};

  standingsList.forEach((item: any) => {
    const constr = item.Constructors?.[0];
    if (!constr) return;

    const cid = constr.constructorId;
    const cname = constr.name;
    const driver = item.Driver;

    if (!teamMap[cid]) {
      teamMap[cid] = { name: cname, drivers: [] };
    }

    if (!teamMap[cid].drivers.some(d => d.driverId === driver.driverId)) {
      teamMap[cid].drivers.push({
        driverId: driver.driverId,
        code: driver.code || driver.familyName.slice(0, 3).toUpperCase(),
        givenName: driver.givenName,
        familyName: driver.familyName,
        name: `${driver.givenName} ${driver.familyName}`,
        permanentNumber: driver.permanentNumber || item.number,
        nationality: driver.nationality,
        teamId: cid,
        teamName: cname,
        position: parseInt(item.position) || 0,
        points: parseFloat(item.points) || 0,
        wins: parseInt(item.wins) || 0
      });
    }
  });

  return Object.entries(teamMap).map(([cid, info]) => ({
    constructorId: cid,
    constructorName: info.name,
    drivers: info.drivers
  }));
}

// 2. Load full Head-to-Head Comparison dataset
export async function loadTeammateComparison(
  season: string,
  constructorId: string,
  customDriverAId?: string,
  customDriverBId?: string
): Promise<TeammateComparisonData> {
  const [standingsRes, resultsRes, qualiRes] = await Promise.all([
    getJSON(`${API_BASE}/${season}/driverStandings.json`).catch(() => null),
    getJSON(`${API_BASE}/${season}/results.json?limit=1000`).catch(() => null),
    getJSON(`${API_BASE}/${season}/qualifying.json?limit=1000`).catch(() => null)
  ]);

  const standingsList = standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  // Filter drivers for selected team
  const teamStandings = standingsList.filter((s: any) => s.Constructors?.[0]?.constructorId === constructorId);

  let driverAInfo: DriverInfo | null = null;
  let driverBInfo: DriverInfo | null = null;

  if (teamStandings.length >= 2) {
    const d0 = teamStandings[0];
    const d1 = teamStandings[1];

    driverAInfo = {
      driverId: d0.Driver.driverId,
      code: d0.Driver.code || d0.Driver.familyName.slice(0, 3).toUpperCase(),
      givenName: d0.Driver.givenName,
      familyName: d0.Driver.familyName,
      name: `${d0.Driver.givenName} ${d0.Driver.familyName}`,
      permanentNumber: d0.Driver.permanentNumber || d0.number,
      nationality: d0.Driver.nationality,
      teamId: constructorId,
      teamName: d0.Constructors[0].name,
      position: parseInt(d0.position) || 0,
      points: parseFloat(d0.points) || 0,
      wins: parseInt(d0.wins) || 0
    };

    driverBInfo = {
      driverId: d1.Driver.driverId,
      code: d1.Driver.code || d1.Driver.familyName.slice(0, 3).toUpperCase(),
      givenName: d1.Driver.givenName,
      familyName: d1.Driver.familyName,
      name: `${d1.Driver.givenName} ${d1.Driver.familyName}`,
      permanentNumber: d1.Driver.permanentNumber || d1.number,
      nationality: d1.Driver.nationality,
      teamId: constructorId,
      teamName: d1.Constructors[0].name,
      position: parseInt(d1.position) || 0,
      points: parseFloat(d1.points) || 0,
      wins: parseInt(d1.wins) || 0
    };
  }

  // Override drivers if custom historical drivers selected
  if (customDriverAId) {
    const matchA = standingsList.find((s: any) => s.Driver.driverId === customDriverAId);
    if (matchA) {
      driverAInfo = {
        driverId: matchA.Driver.driverId,
        code: matchA.Driver.code || matchA.Driver.familyName.slice(0, 3).toUpperCase(),
        givenName: matchA.Driver.givenName,
        familyName: matchA.Driver.familyName,
        name: `${matchA.Driver.givenName} ${matchA.Driver.familyName}`,
        permanentNumber: matchA.Driver.permanentNumber || matchA.number,
        nationality: matchA.Driver.nationality,
        teamId: matchA.Constructors[0]?.constructorId || constructorId,
        teamName: matchA.Constructors[0]?.name || 'F1 Team',
        position: parseInt(matchA.position) || 0,
        points: parseFloat(matchA.points) || 0,
        wins: parseInt(matchA.wins) || 0
      };
    }
  }

  if (customDriverBId) {
    const matchB = standingsList.find((s: any) => s.Driver.driverId === customDriverBId);
    if (matchB) {
      driverBInfo = {
        driverId: matchB.Driver.driverId,
        code: matchB.Driver.code || matchB.Driver.familyName.slice(0, 3).toUpperCase(),
        givenName: matchB.Driver.givenName,
        familyName: matchB.Driver.familyName,
        name: `${matchB.Driver.givenName} ${matchB.Driver.familyName}`,
        permanentNumber: matchB.Driver.permanentNumber || matchB.number,
        nationality: matchB.Driver.nationality,
        teamId: matchB.Constructors[0]?.constructorId || constructorId,
        teamName: matchB.Constructors[0]?.name || 'F1 Team',
        position: parseInt(matchB.position) || 0,
        points: parseFloat(matchB.points) || 0,
        wins: parseInt(matchB.wins) || 0
      };
    }
  }

  if (!driverAInfo || !driverBInfo) {
    throw new Error('Insufficient teammate driver records found for this team and season.');
  }

  const dAId = driverAInfo.driverId;
  const dBId = driverBInfo.driverId;

  // Process Races & Qualifying Data
  const raceList = resultsRes?.MRData?.RaceTable?.Races || [];
  const qualiList = qualiRes?.MRData?.RaceTable?.Races || [];

  const roundMap: Record<number, RaceRoundResult> = {};

  // Parse Qualifying
  qualiList.forEach((r: any) => {
    const rnd = parseInt(r.round);
    const qres = r.QualifyingResults || [];
    const resA = qres.find((q: any) => q.Driver.driverId === dAId);
    const resB = qres.find((q: any) => q.Driver.driverId === dBId);

    const posA = resA ? parseInt(resA.position) : null;
    const posB = resB ? parseInt(resB.position) : null;

    roundMap[rnd] = {
      round: rnd,
      raceName: r.raceName,
      circuitId: r.Circuit?.circuitId || 'circuit',
      circuitName: r.Circuit?.circuitName || r.raceName,
      date: r.date,
      qualiA: posA,
      qualiB: posB,
      qualiStrA: posA ? `P${posA}` : 'N/A',
      qualiStrB: posB ? `P${posB}` : 'N/A',
      raceA: null,
      raceB: null,
      statusA: 'N/A',
      statusB: 'N/A',
      pointsA: 0,
      pointsB: 0,
      cumPointsA: 0,
      cumPointsB: 0
    };
  });

  // Parse Race Results
  let cumA = 0;
  let cumB = 0;

  let podiumsA = 0;
  let podiumsB = 0;
  let polesA = 0;
  let polesB = 0;
  let fastLapsA = 0;
  let fastLapsB = 0;
  let dnfsA = 0;
  let dnfsB = 0;

  let qualiWinsA = 0;
  let qualiWinsB = 0;

  let raceWinsA = 0;
  let raceWinsB = 0;

  const dnfDetailsA: { round: number; raceName: string; status: string }[] = [];
  const dnfDetailsB: { round: number; raceName: string; status: string }[] = [];

  const qualiPosListA: number[] = [];
  const qualiPosListB: number[] = [];
  const racePosListA: number[] = [];
  const racePosListB: number[] = [];

  let q1A = 0, q2A = 0, q3A = 0;
  let q1B = 0, q2B = 0, q3B = 0;

  let ptsFinishA = 0;
  let ptsFinishB = 0;
  let netGainA = 0;
  let netGainB = 0;

  raceList.forEach((r: any) => {
    const rnd = parseInt(r.round);
    const rres = r.Results || [];
    const resA = rres.find((q: any) => q.Driver.driverId === dAId);
    const resB = rres.find((q: any) => q.Driver.driverId === dBId);

    const posA = resA ? parseInt(resA.position) : null;
    const posB = resB ? parseInt(resB.position) : null;

    const ptsA = resA ? parseFloat(resA.points) || 0 : 0;
    const ptsB = resB ? parseFloat(resB.points) || 0 : 0;

    cumA += ptsA;
    cumB += ptsB;

    const statusA = resA ? resA.status : 'N/A';
    const statusB = resB ? resB.status : 'N/A';

    const isDnfA = statusA !== 'Finished' && !statusA.includes('+') && !statusA.includes('Laps');
    const isDnfB = statusB !== 'Finished' && !statusB.includes('+') && !statusB.includes('Laps');

    if (isDnfA && resA) {
      dnfsA++;
      dnfDetailsA.push({ round: rnd, raceName: r.raceName, status: statusA });
    }
    if (isDnfB && resB) {
      dnfsB++;
      dnfDetailsB.push({ round: rnd, raceName: r.raceName, status: statusB });
    }

    if (posA && posA <= 3) podiumsA++;
    if (posB && posB <= 3) podiumsB++;

    if (ptsA > 0) ptsFinishA++;
    if (ptsB > 0) ptsFinishB++;

    if (resA && resA.FastestLap?.rank === '1') fastLapsA++;
    if (resB && resB.FastestLap?.rank === '1') fastLapsB++;

    if (resA && resA.grid) {
      const gridA = parseInt(resA.grid);
      if (gridA === 1) polesA++;
      if (posA && gridA > 0) netGainA += (gridA - posA);
    }
    if (resB && resB.grid) {
      const gridB = parseInt(resB.grid);
      if (gridB === 1) polesB++;
      if (posB && gridB > 0) netGainB += (gridB - posB);
    }

    if (posA !== null && posB !== null) {
      if (posA < posB) raceWinsA++;
      else if (posB < posA) raceWinsB++;
    }

    if (posA !== null) racePosListA.push(posA);
    if (posB !== null) racePosListB.push(posB);

    if (!roundMap[rnd]) {
      roundMap[rnd] = {
        round: rnd,
        raceName: r.raceName,
        circuitId: r.Circuit?.circuitId || 'circuit',
        circuitName: r.Circuit?.circuitName || r.raceName,
        date: r.date,
        qualiA: null,
        qualiB: null,
        qualiStrA: 'N/A',
        qualiStrB: 'N/A',
        raceA: posA,
        raceB: posB,
        statusA,
        statusB,
        pointsA: ptsA,
        pointsB: ptsB,
        cumPointsA: cumA,
        cumPointsB: cumB,
        fastestLapA: resA?.FastestLap?.rank === '1',
        fastestLapB: resB?.FastestLap?.rank === '1'
      };
    } else {
      roundMap[rnd].raceA = posA;
      roundMap[rnd].raceB = posB;
      roundMap[rnd].statusA = statusA;
      roundMap[rnd].statusB = statusB;
      roundMap[rnd].pointsA = ptsA;
      roundMap[rnd].pointsB = ptsB;
      roundMap[rnd].cumPointsA = cumA;
      roundMap[rnd].cumPointsB = cumB;
      roundMap[rnd].fastestLapA = resA?.FastestLap?.rank === '1';
      roundMap[rnd].fastestLapB = resB?.FastestLap?.rank === '1';
    }
  });

  // Calculate Quali Head-to-Head
  const roundsList = Object.values(roundMap).sort((a, b) => a.round - b.round);
  roundsList.forEach(r => {
    if (r.qualiA !== null && r.qualiB !== null) {
      if (r.qualiA < r.qualiB) qualiWinsA++;
      else if (r.qualiB < r.qualiA) qualiWinsB++;
    }
    if (r.qualiA !== null) {
      qualiPosListA.push(r.qualiA);
      if (r.qualiA <= 10) q3A++;
      else if (r.qualiA <= 15) q2A++;
      else q1A++;
    }
    if (r.qualiB !== null) {
      qualiPosListB.push(r.qualiB);
      if (r.qualiB <= 10) q3B++;
      else if (r.qualiB <= 15) q2B++;
      else q1B++;
    }
  });

  const bestQualiA = qualiPosListA.length ? Math.min(...qualiPosListA) : 0;
  const bestQualiB = qualiPosListB.length ? Math.min(...qualiPosListB) : 0;
  const avgQualiA = qualiPosListA.length ? qualiPosListA.reduce((s, v) => s + v, 0) / qualiPosListA.length : 0;
  const avgQualiB = qualiPosListB.length ? qualiPosListB.reduce((s, v) => s + v, 0) / qualiPosListB.length : 0;

  const bestRaceA = racePosListA.length ? Math.min(...racePosListA) : 0;
  const bestRaceB = racePosListB.length ? Math.min(...racePosListB) : 0;
  const avgRaceA = racePosListA.length ? racePosListA.reduce((s, v) => s + v, 0) / racePosListA.length : 0;
  const avgRaceB = racePosListB.length ? racePosListB.reduce((s, v) => s + v, 0) / racePosListB.length : 0;

  // Recent Form (Last 5 rounds)
  const lastRounds = roundsList.slice(-5);
  const recentFormA = lastRounds.map(r => {
    const isDnf = r.statusA !== 'Finished' && !r.statusA.includes('+') && !r.statusA.includes('Laps') && r.statusA !== 'N/A';
    return {
      label: isDnf ? 'DNF' : r.raceA ? `P${r.raceA}` : 'N/A',
      isDnf
    };
  });

  const recentFormB = lastRounds.map(r => {
    const isDnf = r.statusB !== 'Finished' && !r.statusB.includes('+') && !r.statusB.includes('Laps') && r.statusB !== 'N/A';
    return {
      label: isDnf ? 'DNF' : r.raceB ? `P${r.raceB}` : 'N/A',
      isDnf
    };
  });

  return {
    season,
    teamName: driverAInfo.teamName,
    teamColor: getTeamColor(driverAInfo.teamId),
    driverA: driverAInfo,
    driverB: driverBInfo,
    scorecard: {
      pointsA: driverAInfo.points || cumA,
      pointsB: driverBInfo.points || cumB,
      posA: driverAInfo.position || 0,
      posB: driverBInfo.position || 0,
      winsA: driverAInfo.wins || 0,
      winsB: driverBInfo.wins || 0,
      podiumsA,
      podiumsB,
      polesA,
      polesB,
      fastestLapsA: fastLapsA,
      fastestLapsB: fastLapsB,
      dnfsA,
      dnfsB
    },
    qualiH2H: {
      scoreA: qualiWinsA,
      scoreB: qualiWinsB,
      bestA: bestQualiA,
      bestB: bestQualiB,
      avgA: Math.round(avgQualiA * 10) / 10,
      avgB: Math.round(avgQualiB * 10) / 10,
      q1ExitsA: q1A,
      q1ExitsB: q1B,
      q2ExitsA: q2A,
      q2ExitsB: q2B,
      q3AppsA: q3A,
      q3AppsB: q3B
    },
    raceH2H: {
      scoreA: raceWinsA,
      scoreB: raceWinsB,
      bestA: bestRaceA,
      bestB: bestRaceB,
      avgA: Math.round(avgRaceA * 10) / 10,
      avgB: Math.round(avgRaceB * 10) / 10,
      pointsFinishesA: ptsFinishA,
      pointsFinishesB: ptsFinishB,
      positionsGainedA: netGainA,
      positionsGainedB: netGainB
    },
    recentFormA,
    recentFormB,
    gaps: {
      pointsGap: (driverAInfo.points || cumA) - (driverBInfo.points || cumB),
      avgQualiGap: Math.round((avgQualiA - avgQualiB) * 100) / 100,
      avgRaceGap: Math.round((avgRaceA - avgRaceB) * 100) / 100
    },
    rounds: roundsList,
    reliability: {
      dnfDetailsA,
      dnfDetailsB
    }
  };
}
