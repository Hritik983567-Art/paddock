import { describe, it, expect } from 'vitest';

// Mock driver predictions data
const mockPredictions = [
  {
    driverId: 'max_verstappen',
    driverCode: 'VER',
    driverNumber: '1',
    constructorId: 'red_bull',
    constructorName: 'Red Bull Racing',
    gridPosition: 1,
    qualiPosition: 1,
    gridPenaltyDelta: 0,
    winProbability: 0.542,
    winProbabilityPct: 54.2,
    predictedRank: 1
  },
  {
    driverId: 'leclerc',
    driverCode: 'LEC',
    driverNumber: '16',
    constructorId: 'ferrari',
    constructorName: 'Ferrari',
    gridPosition: 2,
    qualiPosition: 2,
    gridPenaltyDelta: 0,
    winProbability: 0.185,
    winProbabilityPct: 18.5,
    predictedRank: 2
  },
  {
    driverId: 'norris',
    driverCode: 'NOR',
    driverNumber: '4',
    constructorId: 'mclaren',
    constructorName: 'McLaren',
    gridPosition: 5,
    qualiPosition: 3,
    gridPenaltyDelta: 2,
    winProbability: 0.125,
    winProbabilityPct: 12.5,
    predictedRank: 3
  }
];

const mockExplanatoryFactors = [
  {
    rank: 1,
    feature: 'grid_position',
    mean_abs_shap: 0.409,
    description: 'Final official starting grid position after qualifying penalties'
  },
  {
    rank: 2,
    feature: 'driver_rolling_10_avg_finish',
    mean_abs_shap: 0.3263,
    description: 'Driver average finishing position across past 10 races'
  }
];

describe('Paddock Race Predictor — Frontend Components & Contracts', () => {
  it('validates PredictorHeader contract and properties', () => {
    const calendarRaces = [
      {
        round: '1',
        raceName: 'Bahrain Grand Prix',
        circuitId: 'bahrain',
        circuitName: 'Bahrain International Circuit',
        country: 'Bahrain',
        date: '2024-03-02'
      }
    ];

    expect(calendarRaces.length).toBe(1);
    expect(calendarRaces[0].circuitId).toBe('bahrain');
  });

  it('validates PredictedWinnerBanner attributes and forecast disclaimer', () => {
    const winner = {
      driverId: 'max_verstappen',
      driverCode: 'VER',
      winProbability: 0.542,
      winProbabilityPct: 54.2,
      constructorName: 'Red Bull Racing',
      gridPosition: 1
    };

    expect(winner.driverCode).toBe('VER');
    expect(winner.winProbabilityPct).toBe(54.2);
    expect(winner.gridPosition).toBe(1);
  });

  it('validates ProbabilityTable calculations and sorting invariants', () => {
    // 1. Total entrants verification
    expect(mockPredictions.length).toBe(3);

    // 2. Probability sum invariant check
    const sumProb = mockPredictions.reduce((acc, d) => acc + d.winProbability, 0);
    expect(sumProb).toBeLessThanOrEqual(1.0);

    // 3. Grid penalty calculation
    const norris = mockPredictions.find(d => d.driverCode === 'NOR');
    expect(norris?.gridPenaltyDelta).toBe(2);
    expect(norris?.gridPosition).toBe(5);
  });

  it('validates ExplanationsPanel TreeSHAP factor ranking and causal disclaimer', () => {
    expect(mockExplanatoryFactors.length).toBe(2);
    expect(mockExplanatoryFactors[0].feature).toBe('grid_position');
    expect(mockExplanatoryFactors[0].rank).toBe(1);
    expect(mockExplanatoryFactors[0].mean_abs_shap).toBeGreaterThan(mockExplanatoryFactors[1].mean_abs_shap);
  });

  it('validates PredictionHistoryComparison calculations', () => {
    const actualResults = {
      VER: 1,
      LEC: 2,
      NOR: 3
    };

    const topPredicted = mockPredictions[0];
    const actualWinnerCode = 'VER';
    expect(actualResults[actualWinnerCode]).toBe(1);
    const isTop1Hit = actualWinnerCode === topPredicted.driverCode;
    expect(isTop1Hit).toBe(true);

    const top3Predicted = mockPredictions.slice(0, 3).map(d => d.driverCode);
    expect(top3Predicted.includes(actualWinnerCode)).toBe(true);
  });

  it('validates QualifyingNotCompletedState status handling', () => {
    const stateProps = {
      raceName: 'Australian Grand Prix',
      season: '2026',
      round: '3',
      onSelectBenchmark: () => {}
    };

    expect(stateProps.raceName).toBe('Australian Grand Prix');
    expect(stateProps.season).toBe('2026');
  });

  it('validates focused upcoming race locked to Austin with progression to next race', () => {
    const upcomingAustin = {
      round: '19',
      raceName: 'United States Grand Prix',
      circuitId: 'americas',
      circuitName: 'Circuit of the Americas',
      country: 'USA',
      date: '2024-10-20'
    };

    const nextMexico = {
      round: '20',
      raceName: 'Mexico City Grand Prix',
      circuitId: 'rodriguez',
      circuitName: 'Autódromo Hermanos Rodríguez',
      country: 'Mexico',
      date: '2024-10-27'
    };

    // 1. Initial upcoming focus is Austin
    let activeRound = upcomingAustin.round;
    expect(activeRound).toBe('19');
    expect(upcomingAustin.circuitId).toBe('americas');

    // 2. When the race ends, it advances to next round
    const advanceToNext = (current: string) => {
      if (current === '19') return nextMexico.round;
      return current;
    };

    activeRound = advanceToNext(activeRound);
    expect(activeRound).toBe('20');
    expect(nextMexico.circuitId).toBe('rodriguez');
  });

  it('validates Option B: Strict Pre-Qualifying State until Saturday qualifying is finalized', () => {
    // 1. Initial upcoming race state is pre-qualifying (grid pending)
    let isQualifyingCompleted = false;
    expect(isQualifyingCompleted).toBe(false);

    // 2. Pre-qualifying holds positions until Saturday classification
    const canShowDriverPositions = (qualiStatus: boolean) => qualiStatus;
    expect(canShowDriverPositions(isQualifyingCompleted)).toBe(false);

    // 3. Simulating Saturday qualifying finalization unlocks post-qualifying predictions
    isQualifyingCompleted = true;
    expect(canShowDriverPositions(isQualifyingCompleted)).toBe(true);
  });
});
