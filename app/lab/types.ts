export type ToolId = 'venue_form' | 'telemetry' | 'strategy_duel' | 'tyres';

export interface RoundItem {
  round: string;
  raceName: string;
  date: string;
  circuitId: string;
}

export interface DriverResultItem {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorName: string;
  grid: string;
  position: string;
  status: string;
  fastestLapSecs?: number;
  fastestLapSpeed?: string;
  lapsCompleted: number;
}

export interface ToolCard {
  id: ToolId;
  icon: string;
  name: string;
  shortDesc: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'EXPERIMENTAL';
  badge: string;
}

export const LAB_TOOLS: ToolCard[] = [
  {
    id: 'venue_form',
    icon: '🧬',
    name: 'CIRCUIT DNA & SECTOR DOMINATION',
    shortDesc: 'Empirical sector telemetry breakdown (S1 high-speed aero, S2 mechanical grip, S3 top speed traps) proving which car dominates each circuit section.',
    status: 'AVAILABLE',
    badge: '100% REAL TELEMETRY'
  },
  {
    id: 'telemetry',
    icon: '⚡',
    name: 'TELEMETRY & LAP ANALYZER',
    shortDesc: 'Analyze real lap-by-lap pace, sector breakdown, top speeds, and consistency index.',
    status: 'AVAILABLE',
    badge: 'REAL DATA'
  },
  {
    id: 'strategy_duel',
    icon: '⚔️',
    name: 'HEAD-TO-HEAD TACTICAL STRATEGY DUEL',
    shortDesc: 'Simulate a head-to-head pit wall battle between two rival drivers, combining real race pace deltas with 1-stop vs 2-stop undercut tactics.',
    status: 'AVAILABLE',
    badge: 'CALIBRATED TACTICAL ENGINE'
  },
  {
    id: 'tyres',
    icon: '🔴',
    name: 'TYRE DEGRADATION & STINT WHISPERER LAB',
    shortDesc: 'Extract real race stints, calculate fuel-corrected tire wear slopes (s/lap), and rank drivers on the Tyre Whisperer Conservation Index.',
    status: 'AVAILABLE',
    badge: 'REAL STINT TELEMETRY'
  }
];
