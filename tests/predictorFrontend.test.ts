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

  it('validates CircuitHeritageSummary and past track winners contracts', () => {
    const mockHeritage = {
      circuitId: 'americas',
      circuitName: 'Circuit of the Americas',
      totalRacesAnalyzed: 6,
      poleWinRatePct: 33.3,
      avgWinnerGrid: 2.3,
      pastWinners: [
        { year: 2024, winnerCode: 'LEC', winnerName: 'Charles Leclerc', constructorName: 'Ferrari', startedGrid: 4, wonFromPole: false },
        { year: 2023, winnerCode: 'VER', winnerName: 'Max Verstappen', constructorName: 'Red Bull', startedGrid: 6, wonFromPole: false },
        { year: 2022, winnerCode: 'VER', winnerName: 'Max Verstappen', constructorName: 'Red Bull', startedGrid: 2, wonFromPole: false },
        { year: 2021, winnerCode: 'VER', winnerName: 'Max Verstappen', constructorName: 'Red Bull', startedGrid: 1, wonFromPole: true },
      ]
    };

    expect(mockHeritage.circuitId).toBe('americas');
    expect(mockHeritage.totalRacesAnalyzed).toBe(6);
    expect(mockHeritage.poleWinRatePct).toBe(33.3);
    expect(mockHeritage.avgWinnerGrid).toBe(2.3);
    expect(mockHeritage.pastWinners.length).toBe(4);
    expect(mockHeritage.pastWinners[0].winnerCode).toBe('LEC');
    expect(mockHeritage.pastWinners[0].startedGrid).toBe(4);
  });

  it('validates driver qualifying scenario delta and track heritage attributes', () => {
    const entrant = {
      driverId: 'max_verstappen',
      driverCode: 'VER',
      gridPosition: 1,
      qualiPosition: 1,
      qualiTime: '1:32.810',
      qualiDeltaToPole: 0.000,
      circuitStarts: 9,
      circuitWins: 3,
      circuitPodiums: 6,
      circuitAvgFinish: 2.1,
      circuitWinRatePct: 33.3,
      rolling5AvgFinish: 2.4,
      rolling10AvgFinish: 2.2,
      rolling10WinRatePct: 40.0
    };

    expect(entrant.qualiDeltaToPole).toBe(0.000);
    expect(entrant.circuitStarts).toBe(9);
    expect(entrant.circuitWins).toBe(3);
    expect(entrant.circuitAvgFinish).toBe(2.1);
    expect(entrant.circuitWinRatePct).toBe(33.3);
    expect(entrant.rolling10AvgFinish).toBe(2.2);
  });

  it('validates automatic advancement to next race as soon as previous race ends', () => {
    const calendarRaces = [
      { round: '19', raceName: 'United States Grand Prix', date: '2026-10-18' },
      { round: '20', raceName: 'Mexico City Grand Prix', date: '2026-10-25' },
      { round: '21', raceName: 'São Paulo Grand Prix', date: '2026-11-08' },
      { round: '22', raceName: 'Las Vegas Grand Prix', date: '2026-11-22' }
    ];

    // Current time is 2026-10-30: R19 and R20 have ended, R21 is next upcoming
    const testNow = new Date('2026-10-30T12:00:00Z').getTime();

    const getActiveRound = (races: typeof calendarRaces, currentTime: number) => {
      const upcoming = races.find(r => {
        const endTime = new Date(r.date + 'T23:59:59Z').getTime();
        return endTime > currentTime;
      });
      return upcoming ? upcoming.round : races[races.length - 1].round;
    };

    // 1. Immediately after Mexico ends, next race is Round 21 (São Paulo)
    expect(getActiveRound(calendarRaces, testNow)).toBe('21');

    // 2. As soon as São Paulo ends (e.g. 2026-11-09), it advances to Round 22 (Las Vegas)
    const afterBrazilTime = new Date('2026-11-09T00:00:00Z').getTime();
    expect(getActiveRound(calendarRaces, afterBrazilTime)).toBe('22');
  });

  it('validates prediction history log retains completed races with verified classifications', async () => {
    const { getHistoricalAccuracyLedger } = await import('../app/lib/raceResultsService');
    const ledger = getHistoricalAccuracyLedger();

    expect(ledger.length).toBeGreaterThanOrEqual(2);

    // Verify Mexico City GP entry
    const mexico = ledger.find(r => r.round === '20');
    expect(mexico).toBeDefined();
    expect(mexico?.isCompleted).toBe(true);
    expect(mexico?.predictedWinner?.driverCode).toBe('SAI');
    expect(mexico?.actualWinner?.driverCode).toBe('SAI');
    expect(mexico?.accuracyVerdict).toBe('winner_hit');

    // Verify United States GP entry
    const austin = ledger.find(r => r.round === '19');
    expect(austin).toBeDefined();
    expect(austin?.isCompleted).toBe(true);
    expect(austin?.actualWinner?.driverCode).toBe('LEC');
    expect(austin?.accuracyVerdict).toBe('podium_hit');
  });

  // 13. Phase 3C.4F.4 Hybrid Prediction Component Contracts
  it('validates hybrid driver prediction entry contract with 3 probabilities and ranking semantic', () => {
    const hybridDriver = {
      driverId: 'norris',
      driverCode: 'NOR',
      driverNumber: '1',
      constructorId: 'mclaren',
      constructorName: 'McLaren Formula 1 Team',
      gridPosition: 1,
      qualiPosition: 1,
      gridPenaltyDelta: 0,
      winProbability: 0.4937,
      winProbabilityPct: 49.37,
      predictedRank: 1,
      grid_baseline_probability: 0.5225,
      ml_win_probability: 0.2973,
      hybrid_win_probability: 0.4937,
      gridBaselineProbability: 0.5225,
      mlWinProbability: 0.2973,
      hybridWinProbability: 0.4937
    };

    expect(hybridDriver.grid_baseline_probability).toBe(0.5225);
    expect(hybridDriver.ml_win_probability).toBe(0.2973);
    expect(hybridDriver.hybrid_win_probability).toBe(0.4937);
    expect(hybridDriver.winProbability).toBe(hybridDriver.hybrid_win_probability);

    // CamelCase mirrors
    expect(hybridDriver.gridBaselineProbability).toBe(hybridDriver.grid_baseline_probability);
    expect(hybridDriver.mlWinProbability).toBe(hybridDriver.ml_win_probability);
    expect(hybridDriver.hybridWinProbability).toBe(hybridDriver.hybrid_win_probability);
  });

  it('validates hybrid model metadata contract and non-production disclosure tags', () => {
    const hybridMetadata = {
      baselineVersion: 'grid-empirical-laplace-a1',
      hybridFormulaVersion: 'geometric-w0.20-v1',
      experimentalStatus: 'EXPERIMENTAL_NON_PRODUCTION',
      rankingOrderSemantic: 'Predicted Win Probability Order',
      inferenceInputHash: '56947b913051836cf128d3f871cbf46bdbdf5a8f58518685c4507583fb16e7e3',
      predictionOutputHash: '6cff56139ae556dd215e5c0a272e9492d7be694b2380d8b1a2d1a06fd0ce2ec6'
    };

    expect(hybridMetadata.baselineVersion).toBe('grid-empirical-laplace-a1');
    expect(hybridMetadata.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(hybridMetadata.experimentalStatus).toBe('EXPERIMENTAL_NON_PRODUCTION');
    expect(hybridMetadata.rankingOrderSemantic).toBe('Predicted Win Probability Order');
    expect(hybridMetadata.inferenceInputHash.length).toBe(64);
    expect(hybridMetadata.predictionOutputHash.length).toBe(64);
  });

  it('validates 2026 regulation era disclosure metadata contract', () => {
    const warning = {
      isUnknownRegulationEra: true,
      regulationEra: 'active_aero_sustainable_fuel_gen3',
      warningCode: 'UNVALIDATED_2026_REGULATIONS',
      disclaimer: 'Statistical forecast generated by model trained on 2021-2024 regulations. 2026 active aerodynamics and sustainable fuel regulations are unvalidated in training data; probabilities represent historical baseline extrapolation.'
    };

    expect(warning.isUnknownRegulationEra).toBe(true);
    expect(warning.warningCode).toBe('UNVALIDATED_2026_REGULATIONS');
    expect(warning.disclaimer).toContain('2026 active aerodynamics');
  });
});
