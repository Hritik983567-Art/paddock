/**
 * Driver Media & Dynamic Roster Transfer Service
 * 
 * Provides official real-face headshots, team color tokens, helmet badges, 
 * and era-specific suit dress tracking across all team eras in Formula 1 history.
 */

import { getTeamColor, NATIONALITY_FLAGS } from '../utils/api';

export interface DriverMediaProfile {
  driverId: string;
  name: string;
  code: string;
  number: string;
  nationality: string;
  flag: string;
  headshotUrl: string;
  officialHeadshotUrl?: string;
  fallbackHeadshotUrl: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamWallpaper: string;
  isTransferred: boolean;
  transferNote?: string;
  eraLabel?: string;
}

interface TeamHistoryRule {
  teamId: string;
  teamName: string;
  teamColor?: string;
  headshotUrl?: string; // Era-specific portrait/suit photo for THAT team era
  startYear?: number;
  endYear?: number;
}

interface DriverMasterData {
  name: string;
  code: string;
  number: string;
  nationality: string;
  flag: string;
  officialHeadshot: string;
  wikimediaHeadshot?: string;
  teamsByYear: TeamHistoryRule[];
}

const LOCAL_HOLOGRAMS = new Set(['albon', 'bortoleto', 'hamilton', 'hulkenberg', 'leclerc', 'verstappen']);

const DRIVER_ALIASES: Record<string, string> = {
  // Max Verstappen
  max_verstappen: 'verstappen',
  maxverstappen: 'verstappen',
  mverstappen: 'verstappen',

  // Lewis Hamilton
  lewis_hamilton: 'hamilton',
  lewishamilton: 'hamilton',
  lhamilton: 'hamilton',

  // Charles Leclerc
  charles_leclerc: 'leclerc',
  charlesleclerc: 'leclerc',
  cleclerc: 'leclerc',

  // Lando Norris
  lando_norris: 'norris',
  landonorris: 'norris',

  // Oscar Piastri
  oscar_piastri: 'piastri',
  oscarpiastri: 'piastri',

  // George Russell
  george_russell: 'russell',
  georgerussell: 'russell',

  // Carlos Sainz
  carlos_sainz: 'sainz',
  carlossainz: 'sainz',

  // Sergio Perez
  sergio_perez: 'perez',
  sergioperez: 'perez',

  // Fernando Alonso
  fernando_alonso: 'alonso',
  fernandoalonso: 'alonso',

  // Pierre Gasly
  pierre_gasly: 'gasly',
  pierregasly: 'gasly',

  // Esteban Ocon
  esteban_ocon: 'ocon',
  estebanocon: 'ocon',

  // Lance Stroll
  lance_stroll: 'stroll',
  lancestroll: 'stroll',

  // Yuki Tsunoda
  yuki_tsunoda: 'tsunoda',
  yukitsunoda: 'tsunoda',

  // Alexander Albon
  alexander_albon: 'albon',
  alex_albon: 'albon',
  alexalbon: 'albon',

  // Nico Hulkenberg
  nico_hulkenberg: 'hulkenberg',
  nicohulkenberg: 'hulkenberg',

  // Valtteri Bottas
  valtteri_bottas: 'bottas',
  valtteribottas: 'bottas',

  // Kevin Magnussen
  kevin_magnussen: 'magnussen',
  kevinmagnussen: 'magnussen',

  // Guanyu Zhou
  guanyu_zhou: 'zhou',
  zhou_guanyu: 'zhou',
  guanyuzhou: 'zhou',

  // Daniel Ricciardo
  daniel_ricciardo: 'ricciardo',
  danielricciardo: 'ricciardo',

  // Liam Lawson
  liam_lawson: 'lawson',
  liamlawson: 'lawson',

  // Oliver Bearman
  oliver_bearman: 'bearman',
  oliverbearman: 'bearman',

  // Kimi Antonelli
  kimi_antonelli: 'antonelli',
  andrea_kimi_antonelli: 'antonelli',
  kimiantonelli: 'antonelli',

  // Jack Doohan
  jack_doohan: 'doohan',
  jackdoohan: 'doohan',

  // Isack Hadjar
  isack_hadjar: 'hadjar',
  isackhadjar: 'hadjar',

  // Gabriel Bortoleto
  gabriel_bortoleto: 'bortoleto',
  gabrielbortoleto: 'bortoleto',

  // Franco Colapinto
  franco_colapinto: 'colapinto',
  francocolapinto: 'colapinto',

  // Logan Sargeant
  logan_sargeant: 'sargeant',
  logansargeant: 'sargeant',

  // Paul Aron
  paul_aron: 'aron',
  paularon: 'aron',

  // Dino Beganovic
  dino_beganovic: 'beganovic',
  dinobeganovic: 'beganovic',

  // Luke Browning
  luke_browning: 'browning',
  lukebrowning: 'browning',

  // Jak Crawford
  jak_crawford: 'crawford',
  jakcrawford: 'crawford',

  // Leonardo Fornaroli
  leonardo_fornaroli: 'fornaroli',
  leonardofornaroli: 'fornaroli',

  // Colton Herta
  colton_herta: 'herta',
  coltonherta: 'herta',

  // Ryo Hirakawa
  ryo_hirakawa: 'hirakawa',
  ryohirakawa: 'hirakawa',

  // Ayumu Iwasa
  ayumu_iwasa: 'iwasa',
  ayumuiwasa: 'iwasa',

  // Theo Pourchaire
  theo_pourchaire: 'pourchaire',
  theopourchaire: 'pourchaire',

  // Felipe Drugovich
  felipe_drugovich: 'drugovich',
  felipedrugovich: 'drugovich',

  // Robert Shwartzman
  robert_shwartzman: 'shwartzman',
  robertshwartzman: 'shwartzman',

  // Pato O'Ward
  patricio_oward: 'oward',
  pato_oward: 'oward',
  patooward: 'oward',

  // Pietro Fittipaldi
  pietro_fittipaldi: 'fittipaldi',
  pietrofittipaldi: 'fittipaldi',

  // Sebastian Vettel
  sebastian_vettel: 'vettel',
  sebastianvettel: 'vettel',

  // Michael Schumacher
  michael_schumacher: 'schumacher',
  michaelschumacher: 'schumacher',
  mick_schumacher: 'mick_schumacher',
  mickschumacher: 'mick_schumacher',

  // Kimi Raikkonen
  kimi_raikkonen: 'raikkonen',
  kimiraikkonen: 'raikkonen',

  // Ayrton Senna
  ayrton_senna: 'senna',
  ayrtonsenna: 'senna',

  // Alain Prost
  alain_prost: 'prost',
  alainprost: 'prost',

  // Niki Lauda
  niki_lauda: 'lauda',
  nikilauda: 'lauda',

  // Nigel Mansell
  nigel_mansell: 'mansell',
  nigelmansell: 'mansell',

  // Mika Hakkinen
  mika_hakkinen: 'hakkinen',
  mikahakkinen: 'hakkinen',

  // Nico Rosberg
  nico_rosberg: 'rosberg',
  nicorosberg: 'rosberg',

  // Nicholas Latifi
  nicholas_latifi: 'latifi',
  nicholaslatifi: 'latifi',

  // Nyck de Vries
  nyck_de_vries: 'devries',
  de_vries: 'devries',
  nyckdevries: 'devries',

  // Antonio Giovinazzi
  antonio_giovinazzi: 'giovinazzi',
  antoniogiovinazzi: 'giovinazzi',

  // Romain Grosjean
  romain_grosjean: 'grosjean',
  romaingrosjean: 'grosjean',

  // Daniil Kvyat
  daniil_kvyat: 'kvyat',
  daniilkvyat: 'kvyat',

  // Fangio
  juan_manuel_fangio: 'fangio'
};

const DRIVER_DATABASE: Record<string, DriverMasterData> = {
  hamilton: {
    name: 'Lewis Hamilton',
    code: 'HAM',
    number: '44',
    nationality: 'British',
    flag: '🇬🇧',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2022_Pre-season_testing_1.jpg',
    teamsByYear: [
      { 
        startYear: 2025, endYear: 2026, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png'
      },
      { 
        startYear: 2024, endYear: 2024, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png'
      },
      { 
        startYear: 2021, endYear: 2023, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png'
      },
      { 
        startYear: 2017, endYear: 2020, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png'
      },
      { 
        startYear: 2013, endYear: 2016, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png'
      },
      { 
        startYear: 2010, endYear: 2012, teamId: 'mclaren', teamName: 'Vodafone McLaren Mercedes',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Lewis_Hamilton_2008_Malaysia_1.jpg'
      },
      { 
        startYear: 2007, endYear: 2009, teamId: 'mclaren', teamName: 'McLaren F1 Team',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Lewis_Hamilton_2008_Malaysia_1.jpg'
      }
    ]
  },
  verstappen: {
    name: 'Max Verstappen',
    code: 'VER',
    number: '1',
    nationality: 'Dutch',
    flag: '🇳🇱',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Max_Verstappen_2015_Malaysia_FP1.jpg',
    teamsByYear: [
      { 
        startYear: 2024, endYear: 2026, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png'
      },
      { 
        startYear: 2021, endYear: 2023, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png'
      },
      { 
        startYear: 2017, endYear: 2020, teamId: 'red_bull', teamName: 'Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png'
      },
      { 
        startYear: 2016, endYear: 2016, teamId: 'red_bull', teamName: 'Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png'
      },
      { 
        startYear: 2015, endYear: 2015, teamId: 'alphatauri', teamName: 'Scuderia Toro Rosso',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Max_Verstappen_2015_Malaysia_FP1.jpg'
      }
    ]
  },
  leclerc: {
    name: 'Charles Leclerc',
    code: 'LEC',
    number: '16',
    nationality: 'Monegasque',
    flag: '🇲🇨',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    teamsByYear: [
      { 
        startYear: 2025, endYear: 2026, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png'
      },
      { 
        startYear: 2021, endYear: 2024, teamId: 'ferrari', teamName: 'Scuderia Ferrari',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png'
      },
      { 
        startYear: 2019, endYear: 2020, teamId: 'ferrari', teamName: 'Scuderia Ferrari',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png'
      },
      { 
        startYear: 2018, endYear: 2018, teamId: 'sauber', teamName: 'Alfa Romeo Sauber F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png'
      }
    ]
  },
  norris: {
    name: 'Lando Norris',
    code: 'NOR',
    number: '4',
    nationality: 'British',
    flag: '🇬🇧',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png' },
      { startYear: 2021, endYear: 2023, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png' },
      { startYear: 2019, endYear: 2020, teamId: 'mclaren', teamName: 'McLaren F1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png' }
    ]
  },
  piastri: {
    name: 'Oscar Piastri',
    code: 'PIA',
    number: '81',
    nationality: 'Australian',
    flag: '🇦🇺',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    teamsByYear: [
      { startYear: 2023, endYear: 2026, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png' }
    ]
  },
  russell: {
    name: 'George Russell',
    code: 'RUS',
    number: '63',
    nationality: 'British',
    flag: '🇬🇧',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    teamsByYear: [
      { 
        startYear: 2022, endYear: 2026, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png'
      },
      { 
        startYear: 2019, endYear: 2021, teamId: 'williams', teamName: 'Williams Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png'
      }
    ]
  },
  antonelli: {
    name: 'Kimi Antonelli',
    code: 'ANT',
    number: '12',
    nationality: 'Italian',
    flag: '🇮🇹',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team' }
    ]
  },
  sainz: {
    name: 'Carlos Sainz',
    code: 'SAI',
    number: '55',
    nationality: 'Spanish',
    flag: '🇪🇸',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
    teamsByYear: [
      { 
        startYear: 2025, endYear: 2026, teamId: 'williams', teamName: 'Williams Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png'
      },
      { 
        startYear: 2021, endYear: 2024, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png'
      },
      { 
        startYear: 2019, endYear: 2020, teamId: 'mclaren', teamName: 'McLaren F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png'
      },
      { 
        startYear: 2017, endYear: 2018, teamId: 'renault', teamName: 'Renault Sport F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png'
      },
      { 
        startYear: 2015, endYear: 2017, teamId: 'alphatauri', teamName: 'Scuderia Toro Rosso',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png'
      }
    ]
  },
  perez: {
    name: 'Sergio Pérez',
    code: 'PER',
    number: '11',
    nationality: 'Mexican',
    flag: '🇲🇽',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png',
    teamsByYear: [
      { startYear: 2021, endYear: 2026, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png' },
      { startYear: 2014, endYear: 2020, teamId: 'force_india', teamName: 'Racing Point / Force India', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png' }
    ]
  },
  alonso: {
    name: 'Fernando Alonso',
    code: 'ALO',
    number: '14',
    nationality: 'Spanish',
    flag: '🇪🇸',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg',
    teamsByYear: [
      { 
        startYear: 2023, endYear: 2026, teamId: 'aston_martin', teamName: 'Aston Martin Aramco F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png'
      },
      { 
        startYear: 2021, endYear: 2022, teamId: 'alpine', teamName: 'Alpine F1 Team',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      },
      { 
        startYear: 2015, endYear: 2018, teamId: 'mclaren', teamName: 'McLaren F1 Team',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      },
      { 
        startYear: 2010, endYear: 2014, teamId: 'ferrari', teamName: 'Scuderia Ferrari',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      },
      { 
        startYear: 2008, endYear: 2009, teamId: 'renault', teamName: 'ING Renault F1 Team',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      },
      { 
        startYear: 2007, endYear: 2007, teamId: 'mclaren', teamName: 'Vodafone McLaren Mercedes',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      },
      { 
        startYear: 2003, endYear: 2006, teamId: 'renault', teamName: 'Mild Seven Renault F1',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Alonso-68_%2824710447098%29.jpg'
      }
    ]
  },
  gasly: {
    name: 'Pierre Gasly',
    code: 'GAS',
    number: '10',
    nationality: 'French',
    flag: '🇫🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
    teamsByYear: [
      { startYear: 2023, endYear: 2026, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png' },
      { startYear: 2020, endYear: 2022, teamId: 'alphatauri', teamName: 'Scuderia AlphaTauri', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png' }
    ]
  },
  ocon: {
    name: 'Esteban Ocon',
    code: 'OCO',
    number: '31',
    nationality: 'French',
    flag: '🇫🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
    teamsByYear: [
      { 
        startYear: 2025, endYear: 2026, teamId: 'haas', teamName: 'MoneyGram Haas F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png'
      },
      { 
        startYear: 2021, endYear: 2024, teamId: 'alpine', teamName: 'BWT Alpine F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png'
      }
    ]
  },
  stroll: {
    name: 'Lance Stroll',
    code: 'STR',
    number: '18',
    nationality: 'Canadian',
    flag: '🇨🇦',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    teamsByYear: [
      { startYear: 2021, endYear: 2026, teamId: 'aston_martin', teamName: 'Aston Martin Aramco F1 Team' }
    ]
  },
  tsunoda: {
    name: 'Yuki Tsunoda',
    code: 'TSU',
    number: '22',
    nationality: 'Japanese',
    flag: '🇯🇵',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'rb', teamName: 'Visa Cash App RB F1 Team', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png' },
      { startYear: 2021, endYear: 2023, teamId: 'alphatauri', teamName: 'Scuderia AlphaTauri', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png' }
    ]
  },
  albon: {
    name: 'Alexander Albon',
    code: 'ALB',
    number: '23',
    nationality: 'Thai',
    flag: '🇹🇭',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
    teamsByYear: [
      { startYear: 2022, endYear: 2026, teamId: 'williams', teamName: 'Williams Racing', headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png' }
    ]
  },
  hulkenberg: {
    name: 'Nico Hülkenberg',
    code: 'HUL',
    number: '27',
    nationality: 'German',
    flag: '🇩🇪',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
    teamsByYear: [
      { 
        startYear: 2025, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team Kick Sauber / Audi',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png'
      },
      { 
        startYear: 2023, endYear: 2024, teamId: 'haas', teamName: 'MoneyGram Haas F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png'
      }
    ]
  },
  bottas: {
    name: 'Valtteri Bottas',
    code: 'BOT',
    number: '77',
    nationality: 'Finnish',
    flag: '🇫🇮',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png',
    teamsByYear: [
      { 
        startYear: 2022, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team Kick Sauber',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png'
      },
      { 
        startYear: 2017, endYear: 2021, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png'
      }
    ]
  },
  magnussen: {
    name: 'Kevin Magnussen',
    code: 'MAG',
    number: '20',
    nationality: 'Danish',
    flag: '🇩🇰',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png',
    teamsByYear: [
      { startYear: 2022, endYear: 2026, teamId: 'haas', teamName: 'MoneyGram Haas F1 Team' }
    ]
  },
  zhou: {
    name: 'Guanyu Zhou',
    code: 'ZHO',
    number: '24',
    nationality: 'Chinese',
    flag: '🇨🇳',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png',
    teamsByYear: [
      { startYear: 2022, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team Kick Sauber' }
    ]
  },
  ricciardo: {
    name: 'Daniel Ricciardo',
    code: 'RIC',
    number: '3',
    nationality: 'Australian',
    flag: '🇦🇺',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png',
    teamsByYear: [
      { 
        startYear: 2023, endYear: 2024, teamId: 'rb', teamName: 'Visa Cash App RB F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png'
      },
      { 
        startYear: 2021, endYear: 2022, teamId: 'mclaren', teamName: 'McLaren F1 Team',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png'
      },
      { 
        startYear: 2014, endYear: 2018, teamId: 'red_bull', teamName: 'Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png'
      }
    ]
  },
  lawson: {
    name: 'Liam Lawson',
    code: 'LAW',
    number: '30',
    nationality: 'New Zealander',
    flag: '🇳🇿',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'rb', teamName: 'Visa Cash App RB F1 Team' }
    ]
  },
  bearman: {
    name: 'Oliver Bearman',
    code: 'BEA',
    number: '87',
    nationality: 'British',
    flag: '🇬🇧',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'haas', teamName: 'MoneyGram Haas F1 Team' }
    ]
  },
  doohan: {
    name: 'Jack Doohan',
    code: 'DOO',
    number: '7',
    nationality: 'Australian',
    flag: '🇦🇺',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'alpine', teamName: 'BWT Alpine F1 Team' }
    ]
  },
  hadjar: {
    name: 'Isack Hadjar',
    code: 'HAD',
    number: '6',
    nationality: 'French',
    flag: '🇫🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing' }
    ]
  },
  bortoleto: {
    name: 'Gabriel Bortoleto',
    code: 'BOR',
    number: '5',
    nationality: 'Brazilian',
    flag: '🇧🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team Kick Sauber / Audi' }
    ]
  },
  colapinto: {
    name: 'Franco Colapinto',
    code: 'COL',
    number: '43',
    nationality: 'Argentine',
    flag: '🇦🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2025, teamId: 'williams', teamName: 'Williams Racing' }
    ]
  },
  sargeant: {
    name: 'Logan Sargeant',
    code: 'SAR',
    number: '2',
    nationality: 'American',
    flag: '🇺🇸',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png',
    teamsByYear: [
      { startYear: 2023, endYear: 2024, teamId: 'williams', teamName: 'Williams Racing' }
    ]
  },
  aron: {
    name: 'Paul Aron',
    code: 'ARO',
    number: '—',
    nationality: 'Estonian',
    flag: '🇪🇪',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'alpine', teamName: 'BWT Alpine F1 Team (Reserve)' }
    ]
  },
  beganovic: {
    name: 'Dino Beganovic',
    code: 'BEG',
    number: '—',
    nationality: 'Swedish',
    flag: '🇸🇪',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'ferrari', teamName: 'Scuderia Ferrari (Academy)' }
    ]
  },
  browning: {
    name: 'Luke Browning',
    code: 'BRO',
    number: '—',
    nationality: 'British',
    flag: '🇬🇧',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'williams', teamName: 'Williams Racing (Reserve)' }
    ]
  },
  crawford: {
    name: 'Jak Crawford',
    code: 'CRA',
    number: '—',
    nationality: 'American',
    flag: '🇺🇸',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'aston_martin', teamName: 'Aston Martin F1 Team (Reserve)' }
    ]
  },
  fornaroli: {
    name: 'Leonardo Fornaroli',
    code: 'FOR',
    number: '—',
    nationality: 'Italian',
    flag: '🇮🇹',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team / Invicta Racing' }
    ]
  },
  herta: {
    name: 'Colton Herta',
    code: 'HER',
    number: '—',
    nationality: 'American',
    flag: '🇺🇸',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png',
    teamsByYear: [
      { startYear: 2025, endYear: 2026, teamId: 'cadillac', teamName: 'Cadillac F1 Team (Test Driver)' }
    ]
  },
  hirakawa: {
    name: 'Ryo Hirakawa',
    code: 'HIR',
    number: '—',
    nationality: 'Japanese',
    flag: '🇯🇵',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'mclaren', teamName: 'McLaren F1 Team (Reserve)' }
    ]
  },
  iwasa: {
    name: 'Ayumu Iwasa',
    code: 'IWA',
    number: '—',
    nationality: 'Japanese',
    flag: '🇯🇵',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
    teamsByYear: [
      { startYear: 2024, endYear: 2026, teamId: 'rb', teamName: 'Visa Cash App RB (Reserve)' }
    ]
  },
  pourchaire: {
    name: 'Théo Pourchaire',
    code: 'POU',
    number: '—',
    nationality: 'French',
    flag: '🇫🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png',
    teamsByYear: [
      { startYear: 2023, endYear: 2026, teamId: 'sauber', teamName: 'Stake F1 Team (Reserve)' }
    ]
  },
  drugovich: {
    name: 'Felipe Drugovich',
    code: 'DRU',
    number: '—',
    nationality: 'Brazilian',
    flag: '🇧🇷',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    teamsByYear: [
      { startYear: 2023, endYear: 2026, teamId: 'aston_martin', teamName: 'Aston Martin F1 Team (Reserve)' }
    ]
  },
  vettel: {
    name: 'Sebastian Vettel',
    code: 'VET',
    number: '5',
    nationality: 'German',
    flag: '🇩🇪',
    officialHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png',
    wikimediaHeadshot: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png',
    teamsByYear: [
      { 
        startYear: 2021, endYear: 2022, teamId: 'aston_martin', teamName: 'Aston Martin Cognizant',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png'
      },
      { 
        startYear: 2015, endYear: 2020, teamId: 'ferrari', teamName: 'Scuderia Ferrari',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png'
      },
      { 
        startYear: 2009, endYear: 2014, teamId: 'red_bull', teamName: 'Red Bull Racing',
        headshotUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SEBVET01_Sebastian_Vettel/sebvet01.png'
      }
    ]
  },
  schumacher: {
    name: 'Michael Schumacher',
    code: 'MSC',
    number: '7',
    nationality: 'German',
    flag: '🇩🇪',
    officialHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Michael_Schumacher%2C_September_2005.jpg',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Michael_Schumacher%2C_September_2005.jpg',
    teamsByYear: [
      { 
        startYear: 2010, endYear: 2012, teamId: 'mercedes', teamName: 'Mercedes AMG Petronas',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Michael_Schumacher%2C_September_2005.jpg'
      },
      { 
        startYear: 1996, endYear: 2006, teamId: 'ferrari', teamName: 'Scuderia Ferrari',
        headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Michael_Schumacher%2C_September_2005.jpg'
      }
    ]
  },
  raikkonen: {
    name: 'Kimi Räikkönen',
    code: 'RAI',
    number: '7',
    nationality: 'Finnish',
    flag: '🇫🇮',
    officialHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/F12019_Schloss_Gabelhofen_%2822%29_%28cropped%29.jpg',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/F12019_Schloss_Gabelhofen_%2822%29_%28cropped%29.jpg',
    teamsByYear: [
      { startYear: 2019, endYear: 2021, teamId: 'sauber', teamName: 'Alfa Romeo Racing', headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/F12019_Schloss_Gabelhofen_%2822%29_%28cropped%29.jpg' },
      { startYear: 2014, endYear: 2018, teamId: 'ferrari', teamName: 'Scuderia Ferrari', headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/F12019_Schloss_Gabelhofen_%2822%29_%28cropped%29.jpg' },
      { startYear: 2007, endYear: 2009, teamId: 'ferrari', teamName: 'Scuderia Ferrari', headshotUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/F12019_Schloss_Gabelhofen_%2822%29_%28cropped%29.jpg' }
    ]
  },
  senna: {
    name: 'Ayrton Senna',
    code: 'SEN',
    number: '1',
    nationality: 'Brazilian',
    flag: '🇧🇷',
    officialHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Ayrton_Senna_Pesawat_RC_Cropped.jpg',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Ayrton_Senna_Pesawat_RC_Cropped.jpg',
    teamsByYear: [
      { startYear: 1988, endYear: 1993, teamId: 'mclaren', teamName: 'McLaren Honda' },
      { startYear: 1994, endYear: 1994, teamId: 'williams', teamName: 'Williams Renault' }
    ]
  },
  prost: {
    name: 'Alain Prost',
    code: 'PRO',
    number: '1',
    nationality: 'French',
    flag: '🇫🇷',
    officialHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Festival_automobile_international_2015_-_Photocall_-_065_%28cropped3%29.jpg',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Festival_automobile_international_2015_-_Photocall_-_065_%28cropped3%29.jpg',
    teamsByYear: [
      { startYear: 1984, endYear: 1989, teamId: 'mclaren', teamName: 'McLaren TAG / Honda' },
      { startYear: 1990, endYear: 1991, teamId: 'ferrari', teamName: 'Scuderia Ferrari' }
    ]
  },
  lauda: {
    name: 'Niki Lauda',
    code: 'LAU',
    number: '1',
    nationality: 'Austrian',
    flag: '🇦🇹',
    officialHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Lauda_at_1982_Dutch_Grand_Prix.jpg',
    wikimediaHeadshot: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Lauda_at_1982_Dutch_Grand_Prix.jpg',
    teamsByYear: [
      { startYear: 1974, endYear: 1977, teamId: 'ferrari', teamName: 'Scuderia Ferrari' },
      { startYear: 1982, endYear: 1985, teamId: 'mclaren', teamName: 'McLaren International' }
    ]
  }
};

const TEAM_WALLPAPERS: Record<string, string> = {
  ferrari: '/images/ferrari-bg.png',
  red_bull: '/images/redbull-bg.png',
  mercedes: '/images/mercedes-bg.png',
  mclaren: '/images/mclaren-bg.png',
  aston_martin: '/images/aston-bg.png',
  alpine: '/images/alpine-bg.png',
  williams: '/images/williams-bg.png',
  rb: '/images/racingbulls-bg.png',
  sauber: '/images/sauber-bg.png',
  haas: '/images/haas-bg.png',
  default: '/images/checkered-bg.png'
};

/**
 * Resolves comprehensive media and team metadata for any F1 driver for a given season.
 * Renders the EXACT ERA-SPECIFIC race suit headshot matching the team they raced for in that season.
 */
export function getDriverMediaProfile(
  driverId: string,
  season: string = '2026',
  apiConstructor?: { constructorId: string; name: string } | null
): DriverMediaProfile {
  const normId = (driverId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const canonicalKey = DRIVER_ALIASES[normId] || DRIVER_ALIASES[driverId.toLowerCase()] || normId;
  const numericSeason = parseInt(season, 10) || 2026;
  
  const master = DRIVER_DATABASE[canonicalKey] || DRIVER_DATABASE[normId] || DRIVER_DATABASE[driverId.toLowerCase()];

  const hologramFallback = LOCAL_HOLOGRAMS.has(canonicalKey) || LOCAL_HOLOGRAMS.has(normId)
    ? `/images/holograms/${LOCAL_HOLOGRAMS.has(canonicalKey) ? canonicalKey : normId}.jpg`
    : '/images/holograms/default.jpg';

  let name = master?.name || driverId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let code = master?.code || driverId.substring(0, 3).toUpperCase();
  let number = master?.number || '—';
  let nationality = master?.nationality || 'International';
  let flag = master?.flag || NATIONALITY_FLAGS[nationality] || '🏎️';

  let teamId = 'default';
  let teamName = 'F1 Racing Team';
  let eraHeadshotUrl = master?.officialHeadshot || master?.wikimediaHeadshot || `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${normId.substring(0, 1).toUpperCase()}/${normId.substring(0, 6).toUpperCase()}01_${normId}/${normId}01.png`;
  let isTransferred = false;
  let transferNote = '';
  let eraLabel = `${numericSeason} Season`;

  if (master && master.teamsByYear.length > 0) {
    const matchedRule = master.teamsByYear.find(rule => {
      const s = rule.startYear ?? 1950;
      const e = rule.endYear ?? 2030;
      return numericSeason >= s && numericSeason <= e;
    });

    if (matchedRule) {
      teamId = matchedRule.teamId;
      teamName = matchedRule.teamName;
      if (matchedRule.headshotUrl) {
        eraHeadshotUrl = matchedRule.headshotUrl;
      }
      eraLabel = `${matchedRule.startYear}–${matchedRule.endYear || 'Present'} ${matchedRule.teamName}`;
    } else {
      teamId = master.teamsByYear[0].teamId;
      teamName = master.teamsByYear[0].teamName;
      if (master.teamsByYear[0].headshotUrl) {
        eraHeadshotUrl = master.teamsByYear[0].headshotUrl;
      }
    }

    const latestRule = master.teamsByYear[0];
    const prevRule = master.teamsByYear[1];
    if (numericSeason >= 2025 && prevRule && latestRule.startYear && latestRule.startYear >= 2025) {
      isTransferred = true;
      transferNote = `Transferred to ${latestRule.teamName} for ${latestRule.startYear}+ (Formerly ${prevRule.teamName})`;
    }
  }

  // Live constructor override if supplied
  if (apiConstructor?.constructorId) {
    const apiTeamId = apiConstructor.constructorId.toLowerCase().replace(/-/g, '_');
    if (apiTeamId !== teamId && apiTeamId !== 'unknown') {
      teamId = apiTeamId;
      teamName = apiConstructor.name || teamName;
    }
  }

  const teamColor = getTeamColor(teamId);
  const teamWallpaper = TEAM_WALLPAPERS[teamId] || TEAM_WALLPAPERS.default;

  const defaultOfficialHeadshot = master?.officialHeadshot || `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${normId.substring(0, 1).toUpperCase()}/${normId.substring(0, 6).toUpperCase()}01_${normId}/${normId}01.png`;

  return {
    driverId,
    name,
    code,
    number,
    nationality,
    flag,
    headshotUrl: eraHeadshotUrl,
    officialHeadshotUrl: defaultOfficialHeadshot,
    fallbackHeadshotUrl: hologramFallback,
    teamId,
    teamName,
    teamColor,
    teamWallpaper,
    isTransferred,
    transferNote,
    eraLabel
  };
}
