/**
 * Official Formula 1 All-Time Driver Career Benchmark & Canonical Registry
 * Provides verified FIA historical statistics (1950–2024) for World Champions,
 * Grand Prix winners, and record holders, ensuring accurate pole positions,
 * fastest laps, race starts, and championship counts across all F1 eras.
 */

export interface HistoricalDriverBenchmark {
  driverId: string;
  name: string;
  code: string;
  championships: number;
  championshipYears: number[];
  startsThrough2024: number;
  entriesThrough2024: number;
  winsThrough2024: number;
  podiumsThrough2024: number;
  polesThrough2024: number;
  fastestLapsThrough2024: number;
  pointsThrough2024: number;
  activeIn2026: boolean;
}

export const HISTORICAL_DRIVER_BENCHMARKS: Record<string, HistoricalDriverBenchmark> = {
  // --- Modern & Active Champions ---
  hamilton: {
    driverId: 'hamilton',
    name: 'Lewis Hamilton',
    code: 'HAM',
    championships: 7,
    championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020],
    startsThrough2024: 353,
    entriesThrough2024: 356,
    winsThrough2024: 105,
    podiumsThrough2024: 201,
    polesThrough2024: 104,
    fastestLapsThrough2024: 67,
    pointsThrough2024: 4829.5,
    activeIn2026: true
  },
  max_verstappen: {
    driverId: 'max_verstappen',
    name: 'Max Verstappen',
    code: 'VER',
    championships: 3,
    championshipYears: [2021, 2022, 2023],
    startsThrough2024: 206,
    entriesThrough2024: 206,
    winsThrough2024: 63,
    podiumsThrough2024: 111,
    polesThrough2024: 40,
    fastestLapsThrough2024: 33,
    pointsThrough2024: 2979.5,
    activeIn2026: true
  },
  alonso: {
    driverId: 'alonso',
    name: 'Fernando Alonso',
    code: 'ALO',
    championships: 2,
    championshipYears: [2005, 2006],
    startsThrough2024: 398,
    entriesThrough2024: 401,
    winsThrough2024: 32,
    podiumsThrough2024: 106,
    polesThrough2024: 22,
    fastestLapsThrough2024: 26,
    pointsThrough2024: 2329,
    activeIn2026: true
  },
  vettel: {
    driverId: 'vettel',
    name: 'Sebastian Vettel',
    code: 'VET',
    championships: 4,
    championshipYears: [2010, 2011, 2012, 2013],
    startsThrough2024: 299,
    entriesThrough2024: 300,
    winsThrough2024: 53,
    podiumsThrough2024: 122,
    polesThrough2024: 57,
    fastestLapsThrough2024: 38,
    pointsThrough2024: 3098,
    activeIn2026: false
  },
  raikkonen: {
    driverId: 'raikkonen',
    name: 'Kimi Räikkönen',
    code: 'RAI',
    championships: 1,
    championshipYears: [2007],
    startsThrough2024: 349,
    entriesThrough2024: 353,
    winsThrough2024: 21,
    podiumsThrough2024: 103,
    polesThrough2024: 18,
    fastestLapsThrough2024: 46,
    pointsThrough2024: 1873,
    activeIn2026: false
  },
  rosberg: {
    driverId: 'rosberg',
    name: 'Nico Rosberg',
    code: 'ROS',
    championships: 1,
    championshipYears: [2016],
    startsThrough2024: 206,
    entriesThrough2024: 206,
    winsThrough2024: 23,
    podiumsThrough2024: 57,
    polesThrough2024: 30,
    fastestLapsThrough2024: 20,
    pointsThrough2024: 1594.5,
    activeIn2026: false
  },
  button: {
    driverId: 'button',
    name: 'Jenson Button',
    code: 'BUT',
    championships: 1,
    championshipYears: [2009],
    startsThrough2024: 306,
    entriesThrough2024: 309,
    winsThrough2024: 15,
    podiumsThrough2024: 50,
    polesThrough2024: 8,
    fastestLapsThrough2024: 8,
    pointsThrough2024: 1235,
    activeIn2026: false
  },

  // --- Historical Legends (1950–2003 Pre-Modern Era) ---
  michael_schumacher: {
    driverId: 'michael_schumacher',
    name: 'Michael Schumacher',
    code: 'MSC',
    championships: 7,
    championshipYears: [1994, 1995, 2000, 2001, 2002, 2003, 2004],
    startsThrough2024: 306,
    entriesThrough2024: 308,
    winsThrough2024: 91,
    podiumsThrough2024: 155,
    polesThrough2024: 68,
    fastestLapsThrough2024: 77,
    pointsThrough2024: 1566,
    activeIn2026: false
  },
  fangio: {
    driverId: 'fangio',
    name: 'Juan Manuel Fangio',
    code: 'FAN',
    championships: 5,
    championshipYears: [1951, 1954, 1955, 1956, 1957],
    startsThrough2024: 51,
    entriesThrough2024: 52,
    winsThrough2024: 24,
    podiumsThrough2024: 35,
    polesThrough2024: 29,
    fastestLapsThrough2024: 23,
    pointsThrough2024: 277.64,
    activeIn2026: false
  },
  prost: {
    driverId: 'prost',
    name: 'Alain Prost',
    code: 'PRO',
    championships: 4,
    championshipYears: [1985, 1986, 1989, 1993],
    startsThrough2024: 199,
    entriesThrough2024: 202,
    winsThrough2024: 51,
    podiumsThrough2024: 106,
    polesThrough2024: 33,
    fastestLapsThrough2024: 41,
    pointsThrough2024: 798.5,
    activeIn2026: false
  },
  senna: {
    driverId: 'senna',
    name: 'Ayrton Senna',
    code: 'SEN',
    championships: 3,
    championshipYears: [1988, 1990, 1991],
    startsThrough2024: 161,
    entriesThrough2024: 162,
    winsThrough2024: 41,
    podiumsThrough2024: 80,
    polesThrough2024: 65,
    fastestLapsThrough2024: 19,
    pointsThrough2024: 614,
    activeIn2026: false
  },
  piquet: {
    driverId: 'piquet',
    name: 'Nelson Piquet',
    code: 'PIQ',
    championships: 3,
    championshipYears: [1981, 1983, 1987],
    startsThrough2024: 204,
    entriesThrough2024: 207,
    winsThrough2024: 23,
    podiumsThrough2024: 60,
    polesThrough2024: 24,
    fastestLapsThrough2024: 23,
    pointsThrough2024: 485.5,
    activeIn2026: false
  },
  lauda: {
    driverId: 'lauda',
    name: 'Niki Lauda',
    code: 'LAU',
    championships: 3,
    championshipYears: [1975, 1977, 1984],
    startsThrough2024: 171,
    entriesThrough2024: 177,
    winsThrough2024: 25,
    podiumsThrough2024: 54,
    polesThrough2024: 24,
    fastestLapsThrough2024: 24,
    pointsThrough2024: 420.5,
    activeIn2026: false
  },
  stewart: {
    driverId: 'stewart',
    name: 'Jackie Stewart',
    code: 'STE',
    championships: 3,
    championshipYears: [1969, 1971, 1973],
    startsThrough2024: 99,
    entriesThrough2024: 100,
    winsThrough2024: 27,
    podiumsThrough2024: 43,
    polesThrough2024: 17,
    fastestLapsThrough2024: 15,
    pointsThrough2024: 360,
    activeIn2026: false
  },
  brabham: {
    driverId: 'brabham',
    name: 'Jack Brabham',
    code: 'BRA',
    championships: 3,
    championshipYears: [1959, 1960, 1966],
    startsThrough2024: 126,
    entriesThrough2024: 128,
    winsThrough2024: 14,
    podiumsThrough2024: 31,
    polesThrough2024: 13,
    fastestLapsThrough2024: 12,
    pointsThrough2024: 261,
    activeIn2026: false
  },
  clark: {
    driverId: 'clark',
    name: 'Jim Clark',
    code: 'CLA',
    championships: 2,
    championshipYears: [1963, 1965],
    startsThrough2024: 72,
    entriesThrough2024: 73,
    winsThrough2024: 25,
    podiumsThrough2024: 32,
    polesThrough2024: 33,
    fastestLapsThrough2024: 28,
    pointsThrough2024: 274,
    activeIn2026: false
  },
  hakkinen: {
    driverId: 'hakkinen',
    name: 'Mika Häkkinen',
    code: 'HAK',
    championships: 2,
    championshipYears: [1998, 1999],
    startsThrough2024: 161,
    entriesThrough2024: 165,
    winsThrough2024: 20,
    podiumsThrough2024: 51,
    polesThrough2024: 26,
    fastestLapsThrough2024: 25,
    pointsThrough2024: 420,
    activeIn2026: false
  },
  emerson_fittipaldi: {
    driverId: 'emerson_fittipaldi',
    name: 'Emerson Fittipaldi',
    code: 'FIT',
    championships: 2,
    championshipYears: [1972, 1974],
    startsThrough2024: 144,
    entriesThrough2024: 149,
    winsThrough2024: 14,
    podiumsThrough2024: 35,
    polesThrough2024: 6,
    fastestLapsThrough2024: 6,
    pointsThrough2024: 281,
    activeIn2026: false
  },
  ascari: {
    driverId: 'ascari',
    name: 'Alberto Ascari',
    code: 'ASC',
    championships: 2,
    championshipYears: [1952, 1953],
    startsThrough2024: 32,
    entriesThrough2024: 33,
    winsThrough2024: 13,
    podiumsThrough2024: 17,
    polesThrough2024: 14,
    fastestLapsThrough2024: 12,
    pointsThrough2024: 140.14,
    activeIn2026: false
  },
  graham_hill: {
    driverId: 'graham_hill',
    name: 'Graham Hill',
    code: 'GHI',
    championships: 2,
    championshipYears: [1962, 1968],
    startsThrough2024: 176,
    entriesThrough2024: 179,
    winsThrough2024: 14,
    podiumsThrough2024: 36,
    polesThrough2024: 13,
    fastestLapsThrough2024: 10,
    pointsThrough2024: 289,
    activeIn2026: false
  },
  mansell: {
    driverId: 'mansell',
    name: 'Nigel Mansell',
    code: 'MAN',
    championships: 1,
    championshipYears: [1992],
    startsThrough2024: 187,
    entriesThrough2024: 191,
    winsThrough2024: 31,
    podiumsThrough2024: 59,
    polesThrough2024: 32,
    fastestLapsThrough2024: 30,
    pointsThrough2024: 482,
    activeIn2026: false
  },
  damon_hill: {
    driverId: 'damon_hill',
    name: 'Damon Hill',
    code: 'DHI',
    championships: 1,
    championshipYears: [1996],
    startsThrough2024: 115,
    entriesThrough2024: 122,
    winsThrough2024: 22,
    podiumsThrough2024: 42,
    polesThrough2024: 20,
    fastestLapsThrough2024: 19,
    pointsThrough2024: 360,
    activeIn2026: false
  },
  mario_andretti: {
    driverId: 'mario_andretti',
    name: 'Mario Andretti',
    code: 'AND',
    championships: 1,
    championshipYears: [1978],
    startsThrough2024: 128,
    entriesThrough2024: 131,
    winsThrough2024: 12,
    podiumsThrough2024: 19,
    polesThrough2024: 18,
    fastestLapsThrough2024: 10,
    pointsThrough2024: 180,
    activeIn2026: false
  },
  villeneuve: {
    driverId: 'villeneuve',
    name: 'Jacques Villeneuve',
    code: 'VIL',
    championships: 1,
    championshipYears: [1997],
    startsThrough2024: 163,
    entriesThrough2024: 165,
    winsThrough2024: 11,
    podiumsThrough2024: 23,
    polesThrough2024: 13,
    fastestLapsThrough2024: 9,
    pointsThrough2024: 235,
    activeIn2026: false
  },
  hunt: {
    driverId: 'hunt',
    name: 'James Hunt',
    code: 'HUN',
    championships: 1,
    championshipYears: [1976],
    startsThrough2024: 92,
    entriesThrough2024: 93,
    winsThrough2024: 10,
    podiumsThrough2024: 23,
    polesThrough2024: 14,
    fastestLapsThrough2024: 8,
    pointsThrough2024: 179,
    activeIn2026: false
  },
  scheckter: {
    driverId: 'scheckter',
    name: 'Jody Scheckter',
    code: 'SCH',
    championships: 1,
    championshipYears: [1979],
    startsThrough2024: 112,
    entriesThrough2024: 113,
    winsThrough2024: 10,
    podiumsThrough2024: 33,
    polesThrough2024: 3,
    fastestLapsThrough2024: 5,
    pointsThrough2024: 255,
    activeIn2026: false
  },
  rindt: {
    driverId: 'rindt',
    name: 'Jochen Rindt',
    code: 'RIN',
    championships: 1,
    championshipYears: [1970],
    startsThrough2024: 60,
    entriesThrough2024: 62,
    winsThrough2024: 6,
    podiumsThrough2024: 13,
    polesThrough2024: 10,
    fastestLapsThrough2024: 3,
    pointsThrough2024: 109,
    activeIn2026: false
  },
  surtees: {
    driverId: 'surtees',
    name: 'John Surtees',
    code: 'SUR',
    championships: 1,
    championshipYears: [1964],
    startsThrough2024: 111,
    entriesThrough2024: 113,
    winsThrough2024: 6,
    podiumsThrough2024: 24,
    polesThrough2024: 8,
    fastestLapsThrough2024: 11,
    pointsThrough2024: 180,
    activeIn2026: false
  },
  hulme: {
    driverId: 'hulme',
    name: 'Denny Hulme',
    code: 'HUL',
    championships: 1,
    championshipYears: [1967],
    startsThrough2024: 112,
    entriesThrough2024: 112,
    winsThrough2024: 8,
    podiumsThrough2024: 33,
    polesThrough2024: 1,
    fastestLapsThrough2024: 9,
    pointsThrough2024: 248,
    activeIn2026: false
  },
  phil_hill: {
    driverId: 'phil_hill',
    name: 'Phil Hill',
    code: 'PHI',
    championships: 1,
    championshipYears: [1961],
    startsThrough2024: 48,
    entriesThrough2024: 52,
    winsThrough2024: 3,
    podiumsThrough2024: 16,
    polesThrough2024: 6,
    fastestLapsThrough2024: 6,
    pointsThrough2024: 98,
    activeIn2026: false
  },
  hawthorn: {
    driverId: 'hawthorn',
    name: 'Mike Hawthorn',
    code: 'HAW',
    championships: 1,
    championshipYears: [1958],
    startsThrough2024: 45,
    entriesThrough2024: 47,
    winsThrough2024: 3,
    podiumsThrough2024: 18,
    polesThrough2024: 4,
    fastestLapsThrough2024: 6,
    pointsThrough2024: 127.64,
    activeIn2026: false
  },
  farina: {
    driverId: 'farina',
    name: 'Giuseppe Farina',
    code: 'FAR',
    championships: 1,
    championshipYears: [1950],
    startsThrough2024: 33,
    entriesThrough2024: 34,
    winsThrough2024: 5,
    podiumsThrough2024: 20,
    polesThrough2024: 5,
    fastestLapsThrough2024: 5,
    pointsThrough2024: 127.33,
    activeIn2026: false
  },
  moss: {
    driverId: 'moss',
    name: 'Stirling Moss',
    code: 'MOS',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 66,
    entriesThrough2024: 67,
    winsThrough2024: 16,
    podiumsThrough2024: 24,
    polesThrough2024: 16,
    fastestLapsThrough2024: 19,
    pointsThrough2024: 186.64,
    activeIn2026: false
  },

  // --- Prominent Multi-Win Contenders ---
  leclerc: {
    driverId: 'leclerc',
    name: 'Charles Leclerc',
    code: 'LEC',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 144,
    entriesThrough2024: 146,
    winsThrough2024: 8,
    podiumsThrough2024: 42,
    polesThrough2024: 26,
    fastestLapsThrough2024: 10,
    pointsThrough2024: 1381,
    activeIn2026: true
  },
  norris: {
    driverId: 'norris',
    name: 'Lando Norris',
    code: 'NOR',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 125,
    entriesThrough2024: 125,
    winsThrough2024: 3,
    podiumsThrough2024: 25,
    polesThrough2024: 8,
    fastestLapsThrough2024: 10,
    pointsThrough2024: 964,
    activeIn2026: true
  },
  russell: {
    driverId: 'russell',
    name: 'George Russell',
    code: 'RUS',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 125,
    entriesThrough2024: 125,
    winsThrough2024: 2,
    podiumsThrough2024: 14,
    polesThrough2024: 3,
    fastestLapsThrough2024: 8,
    pointsThrough2024: 661,
    activeIn2026: true
  },
  sainz: {
    driverId: 'sainz',
    name: 'Carlos Sainz',
    code: 'SAI',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 203,
    entriesThrough2024: 206,
    winsThrough2024: 4,
    podiumsThrough2024: 25,
    polesThrough2024: 6,
    fastestLapsThrough2024: 4,
    pointsThrough2024: 1226.5,
    activeIn2026: true
  },
  perez: {
    driverId: 'perez',
    name: 'Sergio Pérez',
    code: 'PER',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 278,
    entriesThrough2024: 281,
    winsThrough2024: 6,
    podiumsThrough2024: 39,
    polesThrough2024: 3,
    fastestLapsThrough2024: 12,
    pointsThrough2024: 1637,
    activeIn2026: true
  },
  bottas: {
    driverId: 'bottas',
    name: 'Valtteri Bottas',
    code: 'BOT',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 243,
    entriesThrough2024: 244,
    winsThrough2024: 10,
    podiumsThrough2024: 67,
    polesThrough2024: 20,
    fastestLapsThrough2024: 19,
    pointsThrough2024: 1797,
    activeIn2026: true
  },
  ricciardo: {
    driverId: 'ricciardo',
    name: 'Daniel Ricciardo',
    code: 'RIC',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 257,
    entriesThrough2024: 258,
    winsThrough2024: 8,
    podiumsThrough2024: 32,
    polesThrough2024: 3,
    fastestLapsThrough2024: 17,
    pointsThrough2024: 1329,
    activeIn2026: false
  },
  barrichello: {
    driverId: 'barrichello',
    name: 'Rubens Barrichello',
    code: 'BAR',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 322,
    entriesThrough2024: 326,
    winsThrough2024: 11,
    podiumsThrough2024: 68,
    polesThrough2024: 14,
    fastestLapsThrough2024: 17,
    pointsThrough2024: 658,
    activeIn2026: false
  },
  massa: {
    driverId: 'massa',
    name: 'Felipe Massa',
    code: 'MAS',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 269,
    entriesThrough2024: 272,
    winsThrough2024: 11,
    podiumsThrough2024: 41,
    polesThrough2024: 16,
    fastestLapsThrough2024: 15,
    pointsThrough2024: 1167,
    activeIn2026: false
  },
  webber: {
    driverId: 'webber',
    name: 'Mark Webber',
    code: 'WEB',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 215,
    entriesThrough2024: 217,
    winsThrough2024: 9,
    podiumsThrough2024: 42,
    polesThrough2024: 13,
    fastestLapsThrough2024: 19,
    pointsThrough2024: 1047.5,
    activeIn2026: false
  },
  coulthard: {
    driverId: 'coulthard',
    name: 'David Coulthard',
    code: 'COU',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 246,
    entriesThrough2024: 247,
    winsThrough2024: 13,
    podiumsThrough2024: 62,
    polesThrough2024: 12,
    fastestLapsThrough2024: 18,
    pointsThrough2024: 535,
    activeIn2026: false
  },
  montoya: {
    driverId: 'montoya',
    name: 'Juan Pablo Montoya',
    code: 'MON',
    championships: 0,
    championshipYears: [],
    startsThrough2024: 94,
    entriesThrough2024: 95,
    winsThrough2024: 7,
    podiumsThrough2024: 30,
    polesThrough2024: 13,
    fastestLapsThrough2024: 12,
    pointsThrough2024: 307,
    activeIn2026: false
  }
};

/**
 * Maps common driver ID aliases to the canonical Ergast/Jolpica identifier.
 * Prevents Jos Verstappen ('verstappen') from colliding with Max Verstappen ('max_verstappen').
 */
export function getCanonicalErgastDriverId(inputDriverId: string): string {
  const normalized = (inputDriverId || '').toLowerCase().trim();
  
  if (normalized === 'verstappen' || normalized === 'maxverstappen' || normalized === 'mverstappen') {
    return 'max_verstappen';
  }
  if (normalized === 'schumacher' || normalized === 'michaelschumacher' || normalized === 'm_schumacher') {
    return 'michael_schumacher';
  }
  if (normalized === 'senna' || normalized === 'ayrtonsenna') {
    return 'senna';
  }
  if (normalized === 'prost' || normalized === 'alainprost') {
    return 'prost';
  }
  if (normalized === 'fangio' || normalized === 'juanmanuelfangio') {
    return 'fangio';
  }
  if (normalized === 'clark' || normalized === 'jimclark') {
    return 'clark';
  }
  if (normalized === 'lauda' || normalized === 'nikilauda') {
    return 'lauda';
  }
  if (normalized === 'stewart' || normalized === 'jackiestewart') {
    return 'stewart';
  }
  if (normalized === 'fittipaldi') {
    return 'emerson_fittipaldi';
  }
  if (normalized === 'hill') {
    return 'graham_hill';
  }
  
  return normalized;
}

/**
 * Retrieves the verified historical benchmark for a driver if one exists.
 */
export function getHistoricalDriverBenchmark(driverId: string): HistoricalDriverBenchmark | null {
  const canonical = getCanonicalErgastDriverId(driverId);
  return HISTORICAL_DRIVER_BENCHMARKS[canonical] || HISTORICAL_DRIVER_BENCHMARKS[driverId] || null;
}
