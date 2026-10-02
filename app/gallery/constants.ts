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

const GENERIC_FALLBACK_IMAGES = new Set([
  '/images/mclaren-bg.png',
  '/images/ferrari-bg.png',
  '/images/mercedes-bg.png',
  '/images/redbull-bg.png',
  '/images/aston-bg.png',
  '/images/alpine-bg.png',
  '/images/default-bg.png',
  '/images/checkered-bg.png'
]);

export function isGenericFallbackImage(src?: string): boolean {
  if (!src) return true;
  return GENERIC_FALLBACK_IMAGES.has(src);
}

export function generateCornerTelemetryBlueprintSvg(
  item: { title?: string; subtitle?: string; entrySpeed?: string; typicalGear?: string; gForce?: string; turnNumber?: number; id?: string },
  circuitId: string,
  turnNum: number,
  specs?: any
): string {
  const rawTitle = item.title || specs?.name || `Turn ${turnNum}`;
  const turnName = rawTitle.replace(/turn\s*\d+\s*[-—:]*\s*/i, '').trim() || rawTitle;
  const speed = item.entrySpeed || specs?.technical?.entrySpeed || '285 km/h';
  const gear = item.typicalGear || specs?.technical?.typicalGear || '4th Gear';
  const gForce = item.gForce || specs?.technical?.brakingIntensity || '-4.0 G';
  const circuitName = (circuitId || 'F1 CIRCUIT').replace(/_/g, ' ').toUpperCase();

  const sector = turnNum <= 6 ? 1 : (turnNum <= 12 ? 2 : 3);
  const accentColor = sector === 1 ? '#06B6D4' : (sector === 2 ? '#F59E0B' : '#E11D48');
  const accentGlow = sector === 1 ? '#22D3EE' : (sector === 2 ? '#FBBF24' : '#F43F5E');

  let dPath = 'M 120 370 C 220 120 450 120 580 370';
  let apexCx = 350;
  let apexCy = 180;

  const mode = (turnNum + (circuitId.charCodeAt(0) || 0)) % 4;
  if (mode === 1) {
    dPath = 'M 100 380 C 220 380 260 110 400 110 C 540 110 580 380 700 380';
    apexCx = 400;
    apexCy = 110;
  } else if (mode === 2) {
    dPath = 'M 160 390 C 160 100 640 100 640 390';
    apexCx = 400;
    apexCy = 100;
  } else if (mode === 3) {
    dPath = 'M 100 380 C 300 90 600 90 750 250';
    apexCx = 480;
    apexCy = 135;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="bg_${turnNum}_${circuitId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04060E" />
      <stop offset="50%" stop-color="#0E1322" />
      <stop offset="100%" stop-color="#04060A" />
    </linearGradient>
    <radialGradient id="glow_${turnNum}_${circuitId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid_${turnNum}_${circuitId}" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="800" height="450" fill="url(#bg_${turnNum}_${circuitId})" />
  <rect width="800" height="450" fill="url(#grid_${turnNum}_${circuitId})" />
  <circle cx="${apexCx}" cy="${apexCy}" r="240" fill="url(#glow_${turnNum}_${circuitId})" />

  <!-- Circuit Name Watermark -->
  <text x="400" y="45" font-family="monospace" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle" letter-spacing="3">${circuitName} • RECONNAISSANCE BLUEPRINT</text>

  <!-- Track Vector Path -->
  <path d="${dPath}" fill="none" stroke="#0B0E17" stroke-width="46" stroke-linecap="round" />
  <path d="${dPath}" fill="none" stroke="${accentColor}" stroke-width="30" stroke-linecap="round" opacity="0.9" />
  <path d="${dPath}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="14 14" stroke-linecap="round" />

  <!-- Apex Reticle -->
  <circle cx="${apexCx}" cy="${apexCy}" r="16" fill="${accentColor}" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="${apexCx}" cy="${apexCy}" r="28" fill="none" stroke="${accentGlow}" stroke-width="2" opacity="0.8" />

  <!-- Top Sector & Turn Badges -->
  <rect x="30" y="30" width="210" height="38" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="${accentColor}" stroke-width="1.5" />
  <text x="45" y="54" font-family="monospace" font-size="11" font-weight="bold" fill="${accentGlow}" letter-spacing="1.5">SECTOR ${sector} APEX</text>

  <rect x="610" y="30" width="160" height="38" rx="6" fill="#E10600" />
  <text x="690" y="55" font-family="monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">TURN ${turnNum}</text>

  <!-- Corner Name -->
  <text x="400" y="95" font-family="sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${turnName.toUpperCase()}</text>

  <!-- Bottom HUD Bar -->
  <rect x="30" y="370" width="740" height="54" rx="8" fill="rgba(11, 15, 25, 0.92)" stroke="rgba(51, 65, 85, 0.8)" stroke-width="1.5" />

  <text x="150" y="392" font-family="monospace" font-size="10" fill="#94A3B8" text-anchor="middle">ENTRY SPEED</text>
  <text x="150" y="412" font-family="monospace" font-size="14" font-weight="bold" fill="#10B981" text-anchor="middle">${speed}</text>

  <text x="400" y="392" font-family="monospace" font-size="10" fill="#94A3B8" text-anchor="middle">TYPICAL GEAR</text>
  <text x="400" y="412" font-family="monospace" font-size="14" font-weight="bold" fill="#38BDF8" text-anchor="middle">${gear}</text>

  <text x="650" y="392" font-family="monospace" font-size="10" fill="#94A3B8" text-anchor="middle">LATERAL G-FORCE</text>
  <text x="650" y="412" font-family="monospace" font-size="14" font-weight="bold" fill="#F59E0B" text-anchor="middle">${gForce}</text>
</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
}

export function getCornerVisualSrc(
  item: Partial<GalleryMediaItem> & { id?: string; title?: string; src?: string },
  circuitId: string,
  indexOrTurnNumber?: number,
  specs?: any
): string {
  if (item?.src && !isGenericFallbackImage(item.src) && !item.src.includes('blueprint') && !item.src.endsWith('.svg')) {
    return item.src;
  }

  let turnNum = indexOrTurnNumber;
  if (!turnNum && item?.title) {
    const m = item.title.match(/turns?\s*(\d+)/i) || item.title.match(/T(\d+)/i);
    if (m) turnNum = parseInt(m[1], 10);
  }
  if (!turnNum && item?.id) {
    const m = item.id.match(/t(\d+)/i);
    if (m) turnNum = parseInt(m[1], 10);
  }
  if (!turnNum) turnNum = 1;

  return generateCornerTelemetryBlueprintSvg(item || {}, circuitId, turnNum, specs);
}

export function getCircuitFallbackImage(circuitId: string): string {
  return getCornerVisualSrc({}, circuitId, 1, null);
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
