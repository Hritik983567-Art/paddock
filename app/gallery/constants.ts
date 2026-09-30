import { GalleryMediaItem } from '../lib/galleryMediaData';
import { CircuitCorner } from '../lib/circuitCornersData';

export interface CircuitInfo {
  id: string;
  name: string;
  flag: string;
  country: string;
}

export const SUPPORTED_CIRCUITS: CircuitInfo[] = [
  { id: 'monza', name: 'Autodromo Nazionale Monza', flag: '🇮🇹', country: 'Italy' },
  { id: 'silverstone', name: 'Silverstone Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', flag: '🇧🇪', country: 'Belgium' },
  { id: 'monaco', name: 'Circuit de Monaco', flag: '🇲🇨', country: 'Monaco' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', flag: '🇯🇵', country: 'Japan' },
  { id: 'bahrain', name: 'Bahrain International Circuit', flag: '🇧🇭', country: 'Bahrain' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', flag: '🇸🇦', country: 'Saudi Arabia' },
  { id: 'albert_park', name: 'Albert Park Circuit', flag: '🇦🇺', country: 'Australia' },
  { id: 'shanghai', name: 'Shanghai International Circuit', flag: '🇨🇳', country: 'China' },
  { id: 'miami', name: 'Miami International Autodrome', flag: '🇺🇸', country: 'United States' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari (Imola)', flag: '🇮🇹', country: 'Italy' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', flag: '🇪🇸', country: 'Spain' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', flag: '🇨🇦', country: 'Canada' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', flag: '🇦🇹', country: 'Austria' },
  { id: 'hungaroring', name: 'Hungaroring', flag: '🇭🇺', country: 'Hungary' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', flag: '🇳🇱', country: 'Netherlands' },
  { id: 'baku', name: 'Baku City Circuit', flag: '🇦🇿', country: 'Azerbaijan' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', flag: '🇸🇬', country: 'Singapore' },
  { id: 'americas', name: 'Circuit of the Americas (COTA)', flag: '🇺🇸', country: 'United States' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', flag: '🇲🇽', country: 'Mexico' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace (Interlagos)', flag: '🇧🇷', country: 'Brazil' },
  { id: 'vegas', name: 'Las Vegas Strip Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'losail', name: 'Lusail International Circuit', flag: '🇶🇦', country: 'Qatar' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', flag: '🇦🇪', country: 'Abu Dhabi' },
  { id: 'madring', name: 'Madring Circuit (Madrid 2026)', flag: '🇪🇸', country: 'Spain' },
  { id: 'las_vegas', name: 'Las Vegas Street Circuit (Caesars Palace GP)', flag: '🇺🇸', country: 'United States' },
  { id: 'nurburgring', name: 'Nürburgring Nordschleife & GP-Strecke', flag: '🇩🇪', country: 'Germany' },
  { id: 'hockenheimring', name: 'Hockenheimring Baden-Württemberg', flag: '🇩🇪', country: 'Germany' },
  { id: 'sepang', name: 'Sepang International Circuit', flag: '🇲🇾', country: 'Malaysia' },
  { id: 'indianapolis', name: 'Indianapolis Motor Speedway (IMS)', flag: '🇺🇸', country: 'United States' },
  { id: 'kyalami', name: 'Kyalami Grand Prix Circuit', flag: '🇿🇦', country: 'South Africa' },
  { id: 'brands_hatch', name: 'Brands Hatch Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'fuji', name: 'Fuji Speedway', flag: '🇯🇵', country: 'Japan' },
  { id: 'istanbul', name: 'Intercity Istanbul Park', flag: '🇹🇷', country: 'Turkey' },
  { id: 'ricard', name: 'Circuit Paul Ricard (Le Castellet)', flag: '🇫🇷', country: 'France' },
  { id: 'portimao', name: 'Autódromo Internacional do Algarve (Portimão)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'mugello', name: 'Autodromo Internazionale del Mugello', flag: '🇮🇹', country: 'Italy' },
  { id: 'sochi', name: 'Sochi Autodrom', flag: '🇷🇺', country: 'Russia' },
  { id: 'magny_cours', name: 'Circuit de Nevers Magny-Cours', flag: '🇫🇷', country: 'France' },
  { id: 'estoril', name: 'Autódromo do Estoril', flag: '🇵🇹', country: 'Portugal' },
  { id: 'adelaide', name: 'Adelaide Street Circuit', flag: '🇦🇺', country: 'Australia' },
  { id: 'buddh', name: 'Buddh International Circuit (Greater Noida)', flag: '🇮🇳', country: 'India' },
  { id: 'yeongam', name: 'Korean International Circuit (Yeongam)', flag: '🇰🇷', country: 'South Korea' },
  { id: 'valencia', name: 'Valencia Street Circuit', flag: '🇪🇸', country: 'Spain' },
  { id: 'watkins_glen', name: 'Watkins Glen International', flag: '🇺🇸', country: 'United States' },
  { id: 'zolder', name: 'Circuit Zolder', flag: '🇧🇪', country: 'Belgium' },
  { id: 'donington', name: 'Donington Park', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'jerez', name: 'Circuito de Jerez-Ángel Nieto', flag: '🇪🇸', country: 'Spain' },
  { id: 'jarama', name: 'Circuito del Jarama', flag: '🇪🇸', country: 'Spain' },
  { id: 'long_beach', name: 'Long Beach Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'detroit', name: 'Detroit Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'dallas', name: 'Fair Park Dallas Grand Prix Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'phoenix', name: 'Phoenix Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'riverside', name: 'Riverside International Raceway', flag: '🇺🇸', country: 'United States' },
  { id: 'sebring', name: 'Sebring International Raceway', flag: '🇺🇸', country: 'United States' },
  { id: 'mosport', name: 'Mosport International Raceway', flag: '🇨🇦', country: 'Canada' },
  { id: 'tremblant', name: 'Circuit Mont-Tremblant', flag: '🇨🇦', country: 'Canada' },
  { id: 'galvez', name: 'Autódromo Juan y Oscar Gálvez (Buenos Aires)', flag: '🇦🇷', country: 'Argentina' },
  { id: 'jacarepagua', name: 'Autódromo Internacional Nelson Piquet', flag: '🇧🇷', country: 'Brazil' },
  { id: 'george', name: 'Prince George Circuit', flag: '🇿🇦', country: 'South Africa' },
  { id: 'ain_diab', name: 'Ain-Diab Circuit', flag: '🇲🇦', country: 'Morocco' },
  { id: 'aintree', name: 'Aintree Motor Racing Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'anderstorp', name: 'Scandinavian Raceway', flag: '🇸🇪', country: 'Sweden' },
  { id: 'avus', name: 'Automobil-Verkehrs- und Übungsstraße (AVUS)', flag: '🇩🇪', country: 'Germany' },
  { id: 'boavista', name: 'Circuito da Boavista', flag: '🇵🇹', country: 'Portugal' },
  { id: 'bremgarten', name: 'Circuit Bremgarten', flag: '🇨🇭', country: 'Switzerland' },
  { id: 'charade', name: 'Charade Circuit', flag: '🇫🇷', country: 'France' },
  { id: 'dijon', name: 'Circuit de Dijon-Prenois', flag: '🇫🇷', country: 'France' },
  { id: 'essarts', name: 'Rouen-Les-Essarts', flag: '🇫🇷', country: 'France' },
  { id: 'lemans', name: 'Circuit de la Sarthe / Bugatti', flag: '🇫🇷', country: 'France' },
  { id: 'reims', name: 'Reims-Gueux', flag: '🇫🇷', country: 'France' },
  { id: 'monsanto', name: 'Monsanto Park Circuit', flag: '🇵🇹', country: 'Portugal' },
  { id: 'montjuic', name: 'Montjuïc Circuit', flag: '🇪🇸', country: 'Spain' },
  { id: 'pedralbes', name: 'Pedralbes Circuit', flag: '🇪🇸', country: 'Spain' },
  { id: 'pescara', name: 'Pescara Circuit', flag: '🇮🇹', country: 'Italy' },
  { id: 'nivelles', name: 'Nivelles-Baulers', flag: '🇧🇪', country: 'Belgium' },
  { id: 'okayama', name: 'TI Circuit Okayama', flag: '🇯🇵', country: 'Japan' },
  { id: 'zeltweg', name: 'Zeltweg Airfield Circuit', flag: '🇦🇹', country: 'Austria' }
];

export const CALENDAR_CIRCUITS_IDS = new Set([
  'bahrain', 'jeddah', 'albert_park', 'suzuka', 'shanghai', 'miami', 'imola', 'monaco',
  'villeneuve', 'catalunya', 'red_bull_ring', 'silverstone', 'hungaroring', 'spa',
  'zandvoort', 'monza', 'madring', 'baku', 'sepang', 'marina_bay', 'americas', 'rodriguez', 'interlagos',
  'vegas', 'losail', 'yas_marina'
]);

export function getCircuitFallbackImage(circuitId: string): string {
  const c = circuitId.toLowerCase().replace(/-/g, '_');
  if (['monza', 'imola', 'mugello', 'pescara', 'galvez', 'jarama', 'jerez', 'madring'].includes(c)) return '/images/ferrari-bg.png';
  if (['silverstone', 'brands_hatch', 'donington', 'adelaide', 'aintree'].includes(c)) return '/images/mclaren-bg.png';
  if (['nurburgring', 'hockenheimring', 'avus', 'singapore'].includes(c)) return '/images/mercedes-bg.png';
  if (['red_bull_ring', 'zeltweg', 'hungaroring', 'zandvoort'].includes(c)) return '/images/redbull-bg.png';
  if (['spa', 'americas', 'monaco', 'suzuka', 'miami', 'vegas', 'las_vegas'].includes(c)) return '/images/aston-bg.png';
  return '/images/default-bg.png';
}

export function findMatchingMediaItem(
  mediaList: GalleryMediaItem[],
  cornerNumber?: number,
  cornerName?: string,
  cornerKey?: string,
  specs?: CircuitCorner | null
): GalleryMediaItem | undefined {
  if (!mediaList || mediaList.length === 0) return undefined;

  const keyLower = (cornerKey || '').toLowerCase();
  const nameLower = (cornerName || '').toLowerCase();
  const specsNameLower = (specs?.name || '').toLowerCase();
  const specsIdLower = (specs?.id || '').toLowerCase();

  let match = mediaList.find(m => {
    const idLower = m.id.toLowerCase();
    if (keyLower && idLower.includes(keyLower)) return true;
    if (specsIdLower && idLower.includes(specsIdLower)) return true;
    return false;
  });
  if (match) return match;

  const nameToSearch = specsNameLower || nameLower;
  if (nameToSearch) {
    const keywords = nameToSearch
      .split(/[\s\-_\/()]+/)
      .filter(w => w.length > 3 && !['turn', 'turns', 'curva', 'variante', 'del', 'della', 'the', 'corner', 'circuit'].includes(w.toLowerCase()));

    for (const kw of keywords) {
      match = mediaList.find(m => {
        const titleLower = m.title.toLowerCase();
        const idLower = m.id.toLowerCase();
        return titleLower.includes(kw.toLowerCase()) || idLower.includes(kw.toLowerCase());
      });
      if (match) return match;
    }
  }

  if (typeof cornerNumber === 'number' && !isNaN(cornerNumber)) {
    const num = cornerNumber;
    match = mediaList.find(m => {
      const titleLower = m.title.toLowerCase();
      const subLower = m.subtitle.toLowerCase();

      const regexSingle = new RegExp(`\\bturns?\\s*${num}\\b`, 'i');
      if (regexSingle.test(titleLower) || regexSingle.test(subLower)) return true;

      const ranges = titleLower.matchAll(/\bturns?\s*(\d+)(?:[-–\s]+(\d+))?(?:[-–\s]+(\d+))?\b/gi);
      for (const r of ranges) {
        const nums = [r[1], r[2], r[3]].filter(Boolean).map(n => parseInt(n, 10));
        if (nums.length === 1 && nums[0] === num) return true;
        if (nums.length >= 2) {
          const minNum = Math.min(...nums);
          const maxNum = Math.max(...nums);
          if (num >= minNum && num <= maxNum) return true;
        }
      }
      return false;
    });
    if (match) return match;
  }

  return undefined;
}
