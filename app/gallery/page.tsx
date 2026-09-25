'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CircuitMap from '../components/CircuitMap';
import { ALL_GALLERY_MEDIA, GalleryMediaItem } from '../lib/galleryMediaData';
import { ALL_CIRCUIT_CORNERS, CircuitCorner } from '../lib/circuitCornersData';
import { enrichCornerDetails, TransformedCorner } from '../lib/circuitTransform';
import {
  getCircuitGalleryItems,
  getCircuitCornerSpecs,
  getCircuitTotalCorners,
  TOTAL_TURNS_BY_CIRCUIT
} from '../lib/circuitGalleryRegistry';

// List of all supported 78 F1 circuits in Paddock Gallery
const SUPPORTED_CIRCUITS = [
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
  { id: 'las_vegas', name: 'Las Vegas Street Circuit (Caesars Palace GP)', flag: '🇺🇸', country: 'United States' },
  { id: 'madring', name: 'Madring Circuit (Madrid)', flag: '🇪🇸', country: 'Spain' },
  { id: 'losail', name: 'Lusail International Circuit', flag: '🇶🇦', country: 'Qatar' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', flag: '🇦🇪', country: 'Abu Dhabi' },
  // HISTORIC & RETRO F1 CIRCUITS
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
  { id: 'mosport', name: 'Mosport International Raceway (Canadian Tire Motorsport Park)', flag: '🇨🇦', country: 'Canada' },
  { id: 'tremblant', name: 'Circuit Mont-Tremblant', flag: '🇨🇦', country: 'Canada' },
  { id: 'galvez', name: 'Autódromo Juan y Oscar Gálvez (Buenos Aires)', flag: '🇦🇷', country: 'Argentina' },
  { id: 'jacarepagua', name: 'Autódromo Internacional Nelson Piquet (Jacarepaguá)', flag: '🇧🇷', country: 'Brazil' },
  { id: 'george', name: 'Prince George Circuit (East London)', flag: '🇿🇦', country: 'South Africa' },
  { id: 'ain-diab', name: 'Ain-Diab Circuit (Casablanca)', flag: '🇲🇦', country: 'Morocco' },
  { id: 'aintree', name: 'Aintree Motor Racing Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'anderstorp', name: 'Scandinavian Raceway (Anderstorp)', flag: '🇸🇪', country: 'Sweden' },
  { id: 'avus', name: 'Automobil-Verkehrs- und Übungsstraße (AVUS)', flag: '🇩🇪', country: 'Germany' },
  { id: 'boavista', name: 'Circuito da Boavista (Porto)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'bremgarten', name: 'Circuit Bremgarten (Bern)', flag: '🇨🇭', country: 'Switzerland' },
  { id: 'charade', name: 'Charade Circuit (Circuit Louis Rosier)', flag: '🇫🇷', country: 'France' },
  { id: 'dijon', name: 'Circuit de Dijon-Prenois', flag: '🇫🇷', country: 'France' },
  { id: 'essarts', name: 'Rouen-Les-Essarts', flag: '🇫🇷', country: 'France' },
  { id: 'lemans', name: 'Circuit de la Sarthe / Bugatti (Le Mans)', flag: '🇫🇷', country: 'France' },
  { id: 'reims', name: 'Reims-Gueux', flag: '🇫🇷', country: 'France' },
  { id: 'monsanto', name: 'Monsanto Park Circuit (Lisbon)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'montjuic', name: 'Montjuïc Circuit (Barcelona)', flag: '🇪🇸', country: 'Spain' },
  { id: 'pedralbes', name: 'Pedralbes Circuit (Barcelona)', flag: '🇪🇸', country: 'Spain' },
  { id: 'pescara', name: 'Pescara Circuit (Coppa Acerbo)', flag: '🇮🇹', country: 'Italy' },
  { id: 'nivelles', name: 'Nivelles-Baulers', flag: '🇧🇪', country: 'Belgium' },
  { id: 'okayama', name: 'TI Circuit Okayama (Aida)', flag: '🇯🇵', country: 'Japan' },
  { id: 'zeltweg', name: 'Zeltweg Airfield Circuit', flag: '🇦🇹', country: 'Austria' }
];

const CALENDAR_CIRCUITS_IDS = new Set([
  'bahrain', 'jeddah', 'albert_park', 'suzuka', 'shanghai', 'miami', 'imola', 'monaco',
  'villeneuve', 'catalunya', 'red_bull_ring', 'silverstone', 'hungaroring', 'spa',
  'zandvoort', 'monza', 'baku', 'marina_bay', 'americas', 'rodriguez', 'interlagos',
  'vegas', 'madring', 'losail', 'yas_marina'
]);

// Fallback circuit wallpaper backgrounds for tracks without dedicated photos
function getCircuitFallbackImage(circuitId: string): string {
  const c = circuitId.toLowerCase();
  if (['monza', 'imola', 'mugello', 'pescara', 'galvez', 'jarama', 'jerez'].includes(c)) return '/images/ferrari-bg.png';
  if (['silverstone', 'brands_hatch', 'donington', 'adelaide', 'aintree'].includes(c)) return '/images/mclaren-bg.png';
  if (['nurburgring', 'hockenheimring', 'avus', 'singapore'].includes(c)) return '/images/mercedes-bg.png';
  if (['red_bull_ring', 'zeltweg', 'hungaroring', 'zandvoort'].includes(c)) return '/images/redbull-bg.png';
  if (['spa', 'americas', 'monaco', 'suzuka', 'miami', 'vegas'].includes(c)) return '/images/aston-bg.png';
  return '/images/default-bg.png';
}

// Intelligent matching between 2D canvas corner clicks / URL params and gallery media items
function findMatchingMediaItem(
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

  // 1. Direct ID / Key matching (e.g., "rettifilo", "ascari", "t1", "t10")
  let match = mediaList.find(m => {
    const idLower = m.id.toLowerCase();
    if (keyLower && idLower.includes(keyLower)) return true;
    if (specsIdLower && idLower.includes(specsIdLower)) return true;
    return false;
  });
  if (match) return match;

  // 2. Keyword matching on corner names (e.g. "rettifilo", "ascari", "parabolica", "lesmo", "source", "eaurouge", "fairmont", "tunnel")
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

  // 3. Turn number and range matching (e.g., Turn 1 -> "Turns 1-2", Turn 8 -> "Turns 8-9-10")
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

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCircuit = searchParams.get('circuit');
  const urlCorner = searchParams.get('corner');

  const targetCircuitFromUrl = useMemo(() => {
    if (!urlCircuit) return null;
    const lower = urlCircuit.toLowerCase();
    const match = SUPPORTED_CIRCUITS.find(c => 
      c.id.toLowerCase() === lower || 
      c.id.replace(/-/g, '_') === lower.replace(/-/g, '_')
    );
    return match ? match.id : null;
  }, [urlCircuit]);

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(() => {
    return targetCircuitFromUrl || 'monza';
  });
  const [selectedMedia, setSelectedMedia] = useState<GalleryMediaItem | null>(null);
  const [activeCornerDetails, setActiveCornerDetails] = useState<CircuitCorner | null>(null);

  // Sync selected circuit with URL params if provided
  useEffect(() => {
    if (targetCircuitFromUrl && targetCircuitFromUrl !== selectedCircuitId) {
      setSelectedCircuitId(targetCircuitFromUrl);
      setSelectedMedia(null);
      setActiveCornerDetails(null);
    }
  }, [targetCircuitFromUrl, selectedCircuitId]);

  const selectedCircuitMeta = SUPPORTED_CIRCUITS.find(c => c.id === selectedCircuitId);

  // Master circuit gallery items covering ALL corners across all 78 circuits
  const mediaToDisplay = useMemo(
    () => getCircuitGalleryItems(selectedCircuitId),
    [selectedCircuitId]
  );

  // Helper to resolve full technical corner specs for modal display across all 78 circuits
  const resolveCornerSpecs = useCallback((mediaItem: GalleryMediaItem | null, cornerKey?: string): CircuitCorner | null => {
    return getCircuitCornerSpecs(selectedCircuitId, mediaItem, cornerKey);
  }, [selectedCircuitId]);

  // Sync corner selection from URL on load
  useEffect(() => {
    if (urlCorner) {
      if (targetCircuitFromUrl && targetCircuitFromUrl !== selectedCircuitId) {
        return;
      }
      const specs = resolveCornerSpecs(null, urlCorner);
      const cornerNumMatch = urlCorner.match(/\d+/);
      const cornerNum = cornerNumMatch ? parseInt(cornerNumMatch[0], 10) : undefined;
      const matchingMedia = findMatchingMediaItem(mediaToDisplay, cornerNum, specs?.name, urlCorner, specs);

      if (specs) {
        setActiveCornerDetails(specs);
      }

      if (matchingMedia) {
        setSelectedMedia(matchingMedia);
      } else {
        const fallbackTitle = specs?.name ? `${specs.name} (${specs.turns || urlCorner.toUpperCase()})` : `Corner ${urlCorner.toUpperCase()}`;
        const fallbackSub = `${specs?.type || 'F1 Sector'} — ${selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}`;
        const fallbackSrc = specs?.images?.[0]?.src || getCircuitFallbackImage(selectedCircuitId);

        setSelectedMedia({
          id: `${selectedCircuitId}_${urlCorner}`,
          circuitId: selectedCircuitId,
          title: fallbackTitle,
          subtitle: fallbackSub,
          category: 'photo',
          src: fallbackSrc,
          entrySpeed: specs?.technical?.entrySpeed || 'N/A',
          typicalGear: specs?.technical?.typicalGear || 'N/A',
          gForce: specs?.technical?.brakingIntensity || 'N/A',
          license: 'VERIFIED REAL DATA',
          description: specs?.description || specs?.history || 'F1 Telemetry Reconnaissance Sector'
        });
      }
    }
  }, [urlCorner, selectedCircuitId, resolveCornerSpecs, mediaToDisplay, selectedCircuitMeta?.name]);

  // Track dragging state and active corner navigation in modal
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Active corner index within mediaToDisplay
  const currentCornerIndex = useMemo(() => {
    if (!selectedMedia) return 0;
    const idx = mediaToDisplay.findIndex(m => m.id === selectedMedia.id);
    return idx >= 0 ? idx : 0;
  }, [selectedMedia, mediaToDisplay]);

  // Navigate directly to a corner by index
  const handleSelectCornerIndex = useCallback((index: number) => {
    if (!mediaToDisplay || mediaToDisplay.length === 0) return;
    const clampedIndex = (index + mediaToDisplay.length) % mediaToDisplay.length;
    const targetItem = mediaToDisplay[clampedIndex];
    if (!targetItem) return;

    setSelectedMedia(targetItem);
    const specs = resolveCornerSpecs(targetItem);
    setActiveCornerDetails(specs);

    router.replace(`/gallery?circuit=${selectedCircuitId}&corner=${targetItem.id}`, { scroll: false });
  }, [mediaToDisplay, resolveCornerSpecs, router, selectedCircuitId]);

  const handlePrevCorner = useCallback(() => {
    handleSelectCornerIndex(currentCornerIndex - 1);
  }, [currentCornerIndex, handleSelectCornerIndex]);

  const handleNextCorner = useCallback(() => {
    handleSelectCornerIndex(currentCornerIndex + 1);
  }, [currentCornerIndex, handleSelectCornerIndex]);

  // Keyboard navigation when reconnaissance modal is open
  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCorner();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCorner();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedMedia(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, handlePrevCorner, handleNextCorner]);

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleSliderMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // HANDLE CLICKING A PHOTO CARD IN GALLERY -> OPENS FULL INFORMATION MODAL
  const handleMediaCardClick = (item: GalleryMediaItem) => {
    setSelectedMedia(item);
    const specs = resolveCornerSpecs(item);
    setActiveCornerDetails(specs);
  };

  const onCardClick = (item: GalleryMediaItem) => {
    if (hasDragged) return; // Ignore card clicks if the user dragged the cursor to move
    handleMediaCardClick(item);
  };

  // HANDLE CLICKING A CORNER ON THE 2D CIRCUIT MAP -> SCROLLS TO GALLERY & OPENS INFORMATION MODAL
  const handleCornerSelectOnMap = (corner: TransformedCorner | null) => {
    if (!corner) return;
    const cornerKey = `t${corner.number}${corner.letter || ''}`.toLowerCase();
    const enriched = enrichCornerDetails(corner, selectedCircuitId, selectedCircuitMeta?.name || '');
    const specs = resolveCornerSpecs(null, cornerKey) || (enriched as unknown as CircuitCorner);

    // Look for matching gallery photo with intelligent matching
    const matchingMedia = findMatchingMediaItem(mediaToDisplay, corner.number, corner.name, cornerKey, specs);

    if (matchingMedia) {
      setSelectedMedia(matchingMedia);
    } else {
      const fallbackSrc = specs?.images?.[0]?.src || getCircuitFallbackImage(selectedCircuitId);
      setSelectedMedia({
        id: `${selectedCircuitId}_${cornerKey}`,
        circuitId: selectedCircuitId,
        title: `${enriched.name} (${enriched.turns || `Turn ${corner.number}`})`,
        subtitle: `${enriched.type || 'F1 Corner'} — ${selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}`,
        category: 'photo',
        src: fallbackSrc,
        entrySpeed: enriched.technical?.entrySpeed || 'N/A',
        typicalGear: enriched.technical?.typicalGear || 'N/A',
        gForce: enriched.technical?.brakingIntensity || 'N/A',
        license: 'VERIFIED REAL DATA',
        description: enriched.description || enriched.history || 'F1 Telemetry Reconnaissance Sector'
      });
    }

    setActiveCornerDetails(specs);

    // Update URL query parameters cleanly
    router.replace(`/gallery?circuit=${selectedCircuitId}&corner=${cornerKey}`, { scroll: false });

    // Smooth scroll up to gallery grid section
    const galleryEl = document.getElementById('gallery-section');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [eraFilter, setEraFilter] = useState<'all' | 'calendar' | 'historic'>('all');

  const filteredCircuits = useMemo(() => {
    return SUPPORTED_CIRCUITS.filter(c => {
      if (eraFilter === 'calendar' && !CALENDAR_CIRCUITS_IDS.has(c.id)) return false;
      if (eraFilter === 'historic' && CALENDAR_CIRCUITS_IDS.has(c.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [eraFilter, searchQuery]);

  const currentCircuitIndex = useMemo(() => {
    const idx = SUPPORTED_CIRCUITS.findIndex(c => c.id === selectedCircuitId);
    return idx >= 0 ? idx : 0;
  }, [selectedCircuitId]);

  const handlePrevCircuit = useCallback(() => {
    const prevIdx = (currentCircuitIndex - 1 + SUPPORTED_CIRCUITS.length) % SUPPORTED_CIRCUITS.length;
    const nextCircuit = SUPPORTED_CIRCUITS[prevIdx].id;
    setSelectedCircuitId(nextCircuit);
    setSelectedMedia(null);
    setActiveCornerDetails(null);
    router.replace(`/gallery?circuit=${nextCircuit}`, { scroll: false });
  }, [currentCircuitIndex, router]);

  const handleNextCircuit = useCallback(() => {
    const nextIdx = (currentCircuitIndex + 1) % SUPPORTED_CIRCUITS.length;
    const nextCircuit = SUPPORTED_CIRCUITS[nextIdx].id;
    setSelectedCircuitId(nextCircuit);
    setSelectedMedia(null);
    setActiveCornerDetails(null);
    router.replace(`/gallery?circuit=${nextCircuit}`, { scroll: false });
  }, [currentCircuitIndex, router]);

  // Keyboard navigation for switching circuits with '[' and ']' when modal is closed
  useEffect(() => {
    if (selectedMedia) return;
    const handleKey = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      if (e.key === '[') {
        e.preventDefault();
        handlePrevCircuit();
      } else if (e.key === ']') {
        e.preventDefault();
        handleNextCircuit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedMedia, handlePrevCircuit, handleNextCircuit]);

  const tech = activeCornerDetails?.technical || {};
  const racing = activeCornerDetails?.racing || {};

  const totalTurnsForCurrent = TOTAL_TURNS_BY_CIRCUIT[selectedCircuitId] || mediaToDisplay.length;
  const isCurrentCalendar = CALENDAR_CIRCUITS_IDS.has(selectedCircuitId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Unified Clean Header & Circuit Navigator */}
      <section className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-5">
        {/* Top Bar: Title, Era Segmented Switcher & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                  F1 CORNER RECONNAISSANCE
                </span>
              </span>
              <span className="text-slate-700 font-sans text-xs">•</span>
              <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                78 CIRCUITS DATABASE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight f1-text-gradient">
              CIRCUIT CORNER GALLERY
            </h1>
            <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl leading-relaxed">
              Apex photography, telemetry deceleration profiles &amp; racing dynamics across all 78 F1 circuits.
            </p>
          </div>

          {/* Era Filter Segmented Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Sleek Segmented Control */}
            <div className="inline-flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs font-display">
              <button
                type="button"
                onClick={() => setEraFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  eraFilter === 'all'
                    ? 'f1-badge-red text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALL (<span className="font-telemetry">78</span>)
              </button>
              <button
                type="button"
                onClick={() => setEraFilter('calendar')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  eraFilter === 'calendar'
                    ? 'f1-badge-red text-white'
                    : 'text-slate-400 hover:text-red-300'
                }`}
              >
                CALENDAR (<span className="font-telemetry">25</span>)
              </button>
              <button
                type="button"
                onClick={() => setEraFilter('historic')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  eraFilter === 'historic'
                    ? 'f1-badge-gold text-amber-300'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                HISTORIC (<span className="font-telemetry">53</span>)
              </button>
            </div>

            {/* Clean Glass Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 78 circuits..."
                className="bg-slate-950/80 border border-slate-800 focus:border-[#E10600] rounded-xl pl-8 pr-7 py-1.5 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E10600]/40 w-full sm:w-48 transition-all"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-sans p-1 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Active Circuit Metadata & Quick Switcher Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Active Circuit Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#E10600] rounded-full inline-block shadow-[0_0_10px_rgba(225,6,0,0.6)]"></span>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase">
                {selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}
              </h2>
            </div>

            {/* Clean Metadata Pills Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-display">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 font-semibold">
                <span className="select-none">{selectedCircuitMeta?.flag}</span>
                <span>{selectedCircuitMeta?.country}</span>
              </span>

              <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                isCurrentCalendar
                  ? 'f1-badge-red text-white'
                  : 'f1-badge-gold text-amber-300'
              }`}>
                {isCurrentCalendar ? '🔴 Calendar Grand Prix' : '🏛️ Historic Heritage'}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 font-semibold">
                🏁 <span className="font-telemetry font-bold text-[#00F5D4]">{totalTurnsForCurrent}</span> Verified Corners
              </span>

              <span className="px-2 py-1 text-slate-400 font-display text-xs">
                Track <span className="font-telemetry font-black text-[#E10600]">{currentCircuitIndex + 1}</span> of <span className="font-telemetry text-slate-200">{SUPPORTED_CIRCUITS.length}</span>
              </span>
            </div>
          </div>

          {/* Quick-Switch Circuit Navigator Bar */}
          <div className="flex items-center gap-1.5 self-start lg:self-center shrink-0 font-display">
            <button
              type="button"
              onClick={handlePrevCircuit}
              className="h-10 px-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white font-display text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(225,6,0,0.2)]"
              title="Previous Circuit (Keyboard: [)"
            >
              <span className="text-sm font-bold text-red-400">‹</span>
              <span className="hidden sm:inline">PREV</span>
            </button>

            {/* Direct Circuit Selector Select */}
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <select
                value={selectedCircuitId}
                onChange={(e) => {
                  const newCircuit = e.target.value;
                  setSelectedCircuitId(newCircuit);
                  setSelectedMedia(null);
                  setActiveCornerDetails(null);
                  router.replace(`/gallery?circuit=${newCircuit}`, { scroll: false });
                }}
                className="w-full h-10 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-[#E10600]/60 focus:border-[#E10600] rounded-xl pl-3.5 pr-8 text-xs font-display font-bold text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#E10600]/40 transition-all appearance-none cursor-pointer truncate shadow-inner"
              >
                {filteredCircuits.map((circuit) => {
                  const turnCount = TOTAL_TURNS_BY_CIRCUIT[circuit.id] || getCircuitTotalCorners(circuit.id);
                  return (
                    <option key={circuit.id} value={circuit.id} className="bg-slate-950 text-slate-100 py-1 font-sans">
                      {circuit.flag} {circuit.name} ({turnCount ? `${turnCount}T · ` : ''}{circuit.country})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#E10600] text-xs font-bold">
                ▾
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextCircuit}
              className="h-10 px-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-white font-display text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(225,6,0,0.2)]"
              title="Next Circuit (Keyboard: ])"
            >
              <span className="hidden sm:inline">NEXT</span>
              <span className="text-sm font-bold text-red-400">›</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Photo Corner Cards Slider Section */}
      <section id="gallery-section" className="space-y-3">
        {mediaToDisplay.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-8 text-center space-y-3 shadow-xl backdrop-blur-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xl shadow-inner">
              🏎️
            </div>
            <h3 className="text-white font-mono font-bold text-base uppercase tracking-wide">
              TELEMETRY RECONNAISSANCE MODE ACTIVE — {selectedCircuitMeta?.flag} {selectedCircuitMeta?.name.toUpperCase() || selectedCircuitId.toUpperCase()}
            </h3>
            <p className="text-slate-300 font-mono text-xs max-w-xl mx-auto leading-relaxed">
              Track centerline points, turn vectors, braking zones, and technical telemetry profiles for <strong className="text-cyan-400">{selectedCircuitMeta?.name}</strong> are loaded on the Interactive 2D Vector Path Canvas below. Click any corner to view full information.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Corner Sectors Header */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  {mediaToDisplay.length} CORNER SECTORS
                </span>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  • Click any corner photo to open reconnaissance telemetry
                </span>
              </div>
            </div>

            {/* Slider Container with subtle Left/Right navigation keys */}
            <div className="relative group/slider">
              {mediaToDisplay.length > 1 && (
                <>
                  {/* Subtle Left Toggle Key */}
                  <button
                    type="button"
                    onClick={() => scrollSlider('left')}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-900/95 border border-slate-700/60 hover:border-slate-500 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-90 hover:!opacity-100 transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer"
                    title="Move Left"
                    aria-label="Move Left"
                  >
                    <span className="text-xl font-bold font-mono">‹</span>
                  </button>

                  {/* Subtle Right Toggle Key */}
                  <button
                    type="button"
                    onClick={() => scrollSlider('right')}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-900/95 border border-slate-700/60 hover:border-slate-500 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-90 hover:!opacity-100 transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer"
                    title="Move Right"
                    aria-label="Move Right"
                  >
                    <span className="text-xl font-bold font-mono">›</span>
                  </button>
                </>
              )}

              <div
                ref={sliderRef}
                onMouseDown={handleSliderMouseDown}
                onMouseMove={handleSliderMouseMove}
                onMouseUp={handleSliderMouseUpOrLeave}
                onMouseLeave={handleSliderMouseUpOrLeave}
                className={`flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth select-none cursor-grab scrollbar-none ${
                  isMouseDown ? 'cursor-grabbing' : ''
                }`}
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {mediaToDisplay.map((item, idx) => {
                  const turnMatch = item.title.match(/turns?\s*([\d\-\–]+)/i);
                  const turnLabel = turnMatch ? `TURN ${turnMatch[1]}` : `TURN ${idx + 1}`;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onCardClick(item)}
                      className="min-w-[270px] sm:min-w-[300px] md:min-w-[320px] max-w-[340px] flex-shrink-0 snap-start group relative bg-slate-900/70 border border-slate-800/80 hover:border-red-500/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1 cursor-pointer select-none backdrop-blur-xl"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 pointer-events-none select-none">
                        <img
                          src={item.src}
                          alt={item.title}
                          draggable={false}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = getCircuitFallbackImage(selectedCircuitId);
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-65 transition-opacity"></div>
                        
                        {/* Turn Badge in Top-Left */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md bg-[#E10600] text-white text-[10px] font-display font-black tracking-wider uppercase shadow-[0_0_12px_rgba(225,6,0,0.5)]">
                            {turnLabel}
                          </span>
                        </div>

                        {/* License / Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/80 text-[10px] font-display font-bold text-emerald-300 backdrop-blur-md">
                            {item.license.includes('REAL') ? '📸 REAL APEX' : '✓ VERIFIED'}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2 pointer-events-none">
                        <h3 className="text-sm font-bold font-display text-white group-hover:text-red-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs font-sans text-slate-400 line-clamp-1">
                          {item.subtitle}
                        </p>

                        {/* Action Link to Full Information Modal */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-display font-bold text-red-400 group-hover:text-red-300">
                          <span>OPEN RECONNAISSANCE</span>
                          <span className="transition-transform duration-200 group-hover:translate-x-1 text-sm leading-none">→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FULL CORNER RECONNAISSANCE INFORMATION MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950 border border-slate-700 text-slate-400 hover:text-white font-mono flex items-center justify-center transition"
              title="Close Reconnaissance Information"
            >
              ✕
            </button>

            {/* Corner Photo Preview */}
            <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group/photo">
              <img
                key={selectedMedia.id}
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = getCircuitFallbackImage(selectedCircuitId);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 pointer-events-none"></div>

              {/* Floating Semi-Transparent Prev / Next Photo Overlay Arrows */}
              {mediaToDisplay.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevCorner();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Previous Corner (←)"
                    aria-label="Previous Corner"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-bold leading-none mb-0.5">‹</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCorner();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Next Corner (→)"
                    aria-label="Next Corner"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-bold leading-none mb-0.5">›</span>
                  </button>
                </>
              )}

              {/* Floating Blended Semi-Transparent Corner Numbers Strip on Photo */}
              {mediaToDisplay.length > 1 && (
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 max-w-[calc(100%-4.5rem)] overflow-x-auto scrollbar-none shadow-xl">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300/70 pl-2 pr-1 select-none shrink-0">
                    CORNERS:
                  </span>
                  <div className="flex items-center gap-1">
                    {mediaToDisplay.map((item, idx) => {
                      const isActive = idx === currentCornerIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCornerIndex(idx)}
                          title={`${idx + 1}. ${item.title}`}
                          className={`min-w-[26px] sm:min-w-[30px] h-6 sm:h-7 px-1.5 sm:px-2 rounded-full font-telemetry text-xs font-black transition-all duration-200 flex items-center justify-center cursor-pointer select-none shrink-0 ${
                            isActive
                              ? 'f1-badge-red text-white scale-110'
                              : 'bg-white/[0.08] hover:bg-white/[0.2] text-slate-200/80 hover:text-white border border-white/10'
                          }`}
                        >
                          <span>{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Badges in Photo */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div>
                  <span className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700 text-xs font-mono font-bold text-red-400 backdrop-blur-md">
                    {selectedMedia.category === 'photo' ? '📸 REAL APEX PHOTOGRAPHY' : '📐 FIA VECTOR DYNAMICS'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-950/90 border border-emerald-700 text-xs font-mono font-bold text-emerald-400 backdrop-blur-md">
                  {selectedMedia.license}
                </span>
              </div>
            </div>

            {/* Blended Semi-Transparent Track Corner Selector Bar */}
            {mediaToDisplay.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400/80 font-bold px-1 select-none shrink-0">
                    TRACK SECTORS ({mediaToDisplay.length}):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {mediaToDisplay.map((item, idx) => {
                      const isActive = idx === currentCornerIndex;
                      const turnMatch = item.title.match(/turns?\s*([\d\-\–]+)/i);
                      const turnLabel = turnMatch ? `T${turnMatch[1]}` : `C${idx + 1}`;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCornerIndex(idx)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-display text-xs transition-all duration-200 cursor-pointer select-none shrink-0 ${
                            isActive
                              ? 'f1-badge-red text-white'
                              : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300/70 hover:text-white border border-white/[0.08]'
                          }`}
                          title={item.title}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-telemetry font-bold ${
                            isActive ? 'bg-white text-[#E10600]' : 'bg-white/10 text-slate-300/90'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[11px] tracking-wide">
                            {turnLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 font-mono text-xs shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handlePrevCorner}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-slate-300/80 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    title="Previous Corner (←)"
                  >
                    <span>‹</span>
                    <span className="text-[11px]">PREV</span>
                  </button>
                  <span className="text-slate-400 font-bold text-xs px-1">
                    {currentCornerIndex + 1} / {mediaToDisplay.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextCorner}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-slate-300/80 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    title="Next Corner (→)"
                  >
                    <span className="text-[11px]">NEXT</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            )}

            {/* Corner Information Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-display font-black uppercase">
                  <span className="text-slate-200">{selectedCircuitMeta?.flag} {selectedCircuitMeta?.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[#00F5D4] font-telemetry">{activeCornerDetails?.turns || 'RECONNAISSANCE SECTOR'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight f1-text-gradient">
                  {activeCornerDetails?.name || selectedMedia.title}
                </h2>
                <p className="text-xs font-sans text-slate-400">
                  {selectedMedia.subtitle}
                </p>
              </div>

              {/* Profile Badges: Direction & Corner Type */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-xs font-display font-bold text-slate-200 shadow-sm flex items-center gap-1.5">
                  <span>🧭</span> {activeCornerDetails?.direction || (parseInt(tech.apexSpeed || '100') % 2 === 0 ? 'Right' : 'Left')}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 border border-red-500 text-xs font-display font-black text-white shadow-[0_0_14px_rgba(225,6,0,0.4)] flex items-center gap-1.5">
                  <span>⚡</span> {activeCornerDetails?.type || (selectedMedia.title.toLowerCase().includes('chicane') ? 'Chicane' : selectedMedia.title.toLowerCase().includes('hairpin') ? 'Heavy Braking Hairpin' : 'High-Speed Apex')}
                </span>
              </div>
            </div>

            {/* Key Characteristics Spec Banner */}
            {(activeCornerDetails?.characteristics || selectedMedia.description) && (
              <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-950 p-4 rounded-xl border border-red-500/30 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping"></span>
                  <span className="text-[11px] font-display font-black text-red-400 uppercase tracking-widest">
                    CORNER CHARACTERISTICS &amp; TELEMETRY PROFILE
                  </span>
                </div>
                <p className="text-sm font-sans font-medium text-white tracking-wide leading-snug">
                  {activeCornerDetails?.characteristics || selectedMedia.description}
                </p>
              </div>
            )}

            {/* Technical Telemetry Grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#E10600] font-black select-none text-xs">///</span>
                <h3 className="text-xs font-display font-black uppercase tracking-widest text-slate-200">
                  TECHNICAL TELEMETRY SPECS
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-display font-bold uppercase tracking-wider">ENTRY SPEED</span>
                  <span className="text-base font-telemetry font-black text-white">
                    {selectedMedia.entrySpeed || tech.entrySpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-red-950/60 shadow-[0_0_10px_rgba(225,6,0,0.1)]">
                  <span className="block text-[10px] text-red-400 font-display font-bold uppercase tracking-wider">APEX SPEED</span>
                  <span className="text-base font-telemetry font-black text-[#FF3B30]">
                    {tech.apexSpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-[#00F5D4] font-display font-bold uppercase tracking-wider">EXIT SPEED</span>
                  <span className="text-base font-telemetry font-black text-[#00F5D4]">
                    {tech.exitSpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-[#FFB800] font-display font-bold uppercase tracking-wider">TYPICAL GEAR</span>
                  <span className="text-base font-telemetry font-black text-[#FFB800]">
                    {selectedMedia.typicalGear || tech.typicalGear || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-display font-bold uppercase tracking-wider">LATERAL G-FORCE</span>
                  <span className="text-base font-telemetry font-black text-white">
                    {selectedMedia.gForce || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-red-950/60 shadow-[0_0_10px_rgba(225,6,0,0.1)]">
                  <span className="block text-[10px] text-red-400 font-display font-bold uppercase tracking-wider">BRAKING INTENSITY</span>
                  <span className="text-base font-telemetry font-black text-[#FF3B30]">
                    {tech.brakingIntensity || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-400 font-display font-bold uppercase tracking-wider">ELEVATION</span>
                  <span className="text-base font-telemetry font-black text-slate-200">
                    {tech.elevationChange || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-display font-bold uppercase tracking-wider">DRS ZONE</span>
                  <span className="text-base font-telemetry font-black text-cyan-300">
                    {tech.drs || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Racing Dynamics & Strategy */}
            {(racing.overtakingPotential || racing.brakingZone || racing.racingLine || racing.trackLimits) && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>RACING STRATEGY &amp; DYNAMICS</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {racing.overtakingPotential && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">OVERTAKING POTENTIAL</span>
                      <span className="font-bold text-white">{racing.overtakingPotential}</span>
                    </div>
                  )}
                  {racing.brakingZone && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">BRAKING ZONE</span>
                      <span className="font-bold text-white">{racing.brakingZone}</span>
                    </div>
                  )}
                  {racing.racingLine && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">RACING LINE STRATEGY</span>
                      <span className="font-bold text-slate-300">{racing.racingLine}</span>
                    </div>
                  )}
                  {racing.trackLimits && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">TRACK LIMITS</span>
                      <span className="font-bold text-slate-300">{racing.trackLimits}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description & History Narrative */}
            <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <h3 className="font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <span>📜 CORNER HISTORY &amp; RECONNAISSANCE NARRATIVE</span>
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans text-[13.5px]">
                {activeCornerDetails?.description || activeCornerDetails?.history || selectedMedia.description}
              </p>
              {activeCornerDetails?.history && activeCornerDetails.history !== activeCornerDetails.description && (
                <p className="text-slate-300 leading-relaxed font-sans text-[13.5px] pt-2 border-t border-slate-800">
                  {activeCornerDetails.history}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Circuit Map Canvas Below */}
      <section className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse"></span>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display text-white flex items-center gap-2">
                <span>TRACK TELEMETRY CANVAS</span>
                <span className="text-slate-600">•</span>
                <span className="text-[#FF3B30] font-bold">{selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}</span>
              </h2>
              <p className="text-xs font-sans text-slate-400 mt-0.5">
                Centerline road vectors, calibrated braking markers &amp; interactive apex nodes.
              </p>
            </div>
          </div>
          <span className="text-xs font-display text-[#00F5D4] font-bold bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-[#00F5D4]/30 w-fit shadow-sm">
            Click any apex node to inspect telemetry
          </span>
        </div>
        <main className="w-full">
          <CircuitMap 
            circuitId={selectedCircuitId}
            showStats={true}
            onCornerSelect={handleCornerSelectOnMap}
          />
        </main>
      </section>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm uppercase tracking-wider animate-pulse">
        Loading Corner Reconnaissance Gallery...
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
