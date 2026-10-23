export interface FiaSectorConfig {
  s1AfterTurn: number;
  s2AfterTurn: number;
  speedTrapBeforeTurn: number;
  fallbackRatios: {
    s1: number;
    s2: number;
    speedTrap: number;
  };
}

// Authoritative FIA Intermediate Timing Split Specifications for Formula 1 Circuits
export const FIA_TRACK_SECTOR_SPECS: Record<string, FiaSectorConfig> = {
  // Circuit of the Americas (COTA)
  // I1: 65m before T7 (exit of Esses, after T6)
  // I2: 65m before T13 (after T12 hairpin, entering stadium)
  // Speed Trap: 180m before T12 on 1.02km back straight
  'americas': {
    s1AfterTurn: 6,
    s2AfterTurn: 12,
    speedTrapBeforeTurn: 12,
    fallbackRatios: { s1: 0.28, s2: 0.66, speedTrap: 0.58 }
  },
  // Autodromo Nazionale Monza
  // I1: after Curva Grande / before Variante della Roggia (T4)
  // I2: after Lesmo 2 (T7) / before Variante Ascari (T8)
  // Speed Trap: end of main Rettifilo straight before T1
  'monza': {
    s1AfterTurn: 3,
    s2AfterTurn: 7,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.26, s2: 0.60, speedTrap: 0.94 }
  },
  // Silverstone Circuit
  // I1: after Aintree (T5) / onto Wellington Straight
  // I2: after Chapel (T14) / onto Hangar Straight
  // Speed Trap: on Hangar Straight before Stowe (T15)
  'silverstone': {
    s1AfterTurn: 5,
    s2AfterTurn: 14,
    speedTrapBeforeTurn: 15,
    fallbackRatios: { s1: 0.29, s2: 0.72, speedTrap: 0.68 }
  },
  // Circuit de Spa-Francorchamps
  // I1: after Raidillon (T4) / onto Kemmel Straight
  // I2: after Campus/Stavelot (T14) / before Paul Frere (T15)
  // Speed Trap: Kemmel Straight before Les Combes (T5)
  'spa': {
    s1AfterTurn: 4,
    s2AfterTurn: 14,
    speedTrapBeforeTurn: 5,
    fallbackRatios: { s1: 0.25, s2: 0.72, speedTrap: 0.22 }
  },
  // Circuit de Monaco
  // I1: after Casino Square (T4) / before Mirabeau Haute (T5)
  // I2: after Louis Chiron (T14) / before Rascasse (T15)
  // Speed Trap: before Nouvelle Chicane (T10) tunnel exit
  'monaco': {
    s1AfterTurn: 4,
    s2AfterTurn: 14,
    speedTrapBeforeTurn: 10,
    fallbackRatios: { s1: 0.28, s2: 0.70, speedTrap: 0.48 }
  },
  // Suzuka International Racing Course
  // I1: after Dunlop Curve (T7) / before Degner 1 (T8)
  // I2: after Spoon Curve (T14) / before 130R (T15)
  // Speed Trap: before Casio Triangle (T16)
  'suzuka': {
    s1AfterTurn: 7,
    s2AfterTurn: 14,
    speedTrapBeforeTurn: 16,
    fallbackRatios: { s1: 0.32, s2: 0.75, speedTrap: 0.88 }
  },
  // Bahrain International Circuit (Sakhir)
  // I1: after Turn 4 / before Turn 5 sweepers
  // I2: after Turn 12 / before Turn 13
  // Speed Trap: before Turn 1 (end of pit straight)
  'bahrain': {
    s1AfterTurn: 4,
    s2AfterTurn: 12,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.28, s2: 0.68, speedTrap: 0.94 }
  },
  // Jeddah Corniche Circuit
  // I1: after Turn 12 / before Turn 13 hairpin
  // I2: after Turn 22 / before Turn 23
  // Speed Trap: before Turn 27
  'jeddah': {
    s1AfterTurn: 12,
    s2AfterTurn: 22,
    speedTrapBeforeTurn: 27,
    fallbackRatios: { s1: 0.35, s2: 0.73, speedTrap: 0.92 }
  },
  // Albert Park Circuit (Melbourne)
  // I1: after Turn 5 / before Turn 6
  // I2: after Turn 10 lakeside sweeper / before Turn 11 chicane
  // Speed Trap: before Turn 11
  'albert_park': {
    s1AfterTurn: 5,
    s2AfterTurn: 10,
    speedTrapBeforeTurn: 11,
    fallbackRatios: { s1: 0.32, s2: 0.69, speedTrap: 0.65 }
  },
  // Shanghai International Circuit
  // I1: after Turn 6 / before Turn 7
  // I2: after Turn 13 / before 1.2km back straight
  // Speed Trap: before Turn 14 hairpin
  'shanghai': {
    s1AfterTurn: 6,
    s2AfterTurn: 13,
    speedTrapBeforeTurn: 14,
    fallbackRatios: { s1: 0.30, s2: 0.64, speedTrap: 0.82 }
  },
  // Miami International Autodrome
  // I1: after Turn 8 / before Turn 9
  // I2: after Turn 16 / before 1.28km back straight
  // Speed Trap: before Turn 17 hairpin
  'miami': {
    s1AfterTurn: 8,
    s2AfterTurn: 16,
    speedTrapBeforeTurn: 17,
    fallbackRatios: { s1: 0.31, s2: 0.68, speedTrap: 0.84 }
  },
  // Autodromo Enzo e Dino Ferrari (Imola)
  // I1: after Villeneuve chicane (T4) / before Tosa (T7)
  // I2: after Acque Minerali (T12) / before Variante Alta (T14)
  // Speed Trap: before Tamburello (T2)
  'imola': {
    s1AfterTurn: 4,
    s2AfterTurn: 12,
    speedTrapBeforeTurn: 2,
    fallbackRatios: { s1: 0.28, s2: 0.68, speedTrap: 0.95 }
  },
  // Circuit de Barcelona-Catalunya
  // I1: after Turn 4 / before Turn 5 Seat
  // I2: after Campsa (T9) / before Turn 10
  // Speed Trap: before Turn 1
  'catalunya': {
    s1AfterTurn: 4,
    s2AfterTurn: 9,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.28, s2: 0.65, speedTrap: 0.95 }
  },
  // Circuit Gilles Villeneuve (Montreal)
  // I1: after Turn 5 / before Turn 6
  // I2: after Turn 9 / before Turn 10 hairpin
  // Speed Trap: on Casino straight before Turn 13
  'villeneuve': {
    s1AfterTurn: 5,
    s2AfterTurn: 9,
    speedTrapBeforeTurn: 13,
    fallbackRatios: { s1: 0.30, s2: 0.63, speedTrap: 0.86 }
  },
  // Red Bull Ring (Spielberg)
  // I1: after Turn 1 / before Remus Turn 3
  // I2: after Turn 6 / before Turn 7
  // Speed Trap: before Turn 3 Remus
  'red_bull_ring': {
    s1AfterTurn: 1,
    s2AfterTurn: 6,
    speedTrapBeforeTurn: 3,
    fallbackRatios: { s1: 0.26, s2: 0.67, speedTrap: 0.24 }
  },
  // Hungaroring
  // I1: after Turn 3 / before Turn 4
  // I2: after Turn 11 / before Turn 12
  // Speed Trap: before Turn 1
  'hungaroring': {
    s1AfterTurn: 3,
    s2AfterTurn: 11,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.28, s2: 0.72, speedTrap: 0.95 }
  },
  // Circuit Zandvoort
  // I1: after Hugenholtz (T3) / onto Hunserug
  // I2: after Turn 10 / before Hans Ernst (T11)
  // Speed Trap: before Tarzan (T1)
  'zandvoort': {
    s1AfterTurn: 3,
    s2AfterTurn: 10,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.26, s2: 0.68, speedTrap: 0.95 }
  },
  // Baku City Circuit
  // I1: after Turn 4 / before Turn 5
  // I2: after Turn 15 / before Turn 16 onto 2.2km flat out section
  // Speed Trap: before Turn 1
  'baku': {
    s1AfterTurn: 4,
    s2AfterTurn: 15,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.27, s2: 0.64, speedTrap: 0.95 }
  },
  // Marina Bay Street Circuit (Singapore)
  // I1: after Turn 5 / onto Raffles Boulevard
  // I2: after Turn 13 / before Turn 14
  // Speed Trap: before Turn 7
  'marina_bay': {
    s1AfterTurn: 5,
    s2AfterTurn: 13,
    speedTrapBeforeTurn: 7,
    fallbackRatios: { s1: 0.29, s2: 0.68, speedTrap: 0.35 }
  },
  // Autodromo Hermanos Rodriguez (Mexico)
  // I1: after Turn 3 / before Turn 4
  // I2: after Turn 11 / before stadium Turn 12
  // Speed Trap: before Turn 1
  'rodriguez': {
    s1AfterTurn: 3,
    s2AfterTurn: 11,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.27, s2: 0.66, speedTrap: 0.95 }
  },
  // Autodromo Jose Carlos Pace (Interlagos)
  // I1: after Curva do Sol (T3) / onto Reta Oposta
  // I2: after Mergulho (T11) / before Juncao (T12)
  // Speed Trap: on Subida dos Boxes
  'interlagos': {
    s1AfterTurn: 3,
    s2AfterTurn: 11,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.26, s2: 0.67, speedTrap: 0.90 }
  },
  // Las Vegas Strip Circuit
  // I1: after Sphere (T4) / before Turn 5
  // I2: after Turn 12 / before Turn 14 on Strip
  // Speed Trap: before Turn 14
  'vegas': {
    s1AfterTurn: 4,
    s2AfterTurn: 12,
    speedTrapBeforeTurn: 14,
    fallbackRatios: { s1: 0.28, s2: 0.68, speedTrap: 0.85 }
  },
  // Lusail International Circuit (Qatar)
  // I1: after Turn 5 / before Turn 6
  // I2: after Turn 11 / before triple apex Turn 12
  // Speed Trap: before Turn 1
  'losail': {
    s1AfterTurn: 5,
    s2AfterTurn: 11,
    speedTrapBeforeTurn: 1,
    fallbackRatios: { s1: 0.30, s2: 0.68, speedTrap: 0.95 }
  },
  // Yas Marina Circuit (Abu Dhabi)
  // I1: after Turn 4 / before north hairpin Turn 5
  // I2: after west hairpin Turn 9 / before marina Turn 10
  // Speed Trap: back straight before Turn 6
  'yas_marina': {
    s1AfterTurn: 4,
    s2AfterTurn: 9,
    speedTrapBeforeTurn: 6,
    fallbackRatios: { s1: 0.28, s2: 0.66, speedTrap: 0.44 }
  }
};

export function getFiaSectorIndices(
  circuitId: string,
  totalPts: number,
  transformedCorners: Array<{ number: number; trackPointIndex?: number; anchorX: number; anchorY: number }>,
  trackMetaSectors?: Array<{ id: string; markerIndex: number }>,
  trackMetaSpeedTrap?: number,
  refPtsCount?: number
): { s1Idx: number; s2Idx: number; stIdx: number } {
  if (totalPts < 5) {
    return { s1Idx: 1, s2Idx: 2, stIdx: 1 };
  }

  const normId = (circuitId || '').toLowerCase().replace(/-/g, '_');
  const spec = FIA_TRACK_SECTOR_SPECS[normId] || FIA_TRACK_SECTOR_SPECS[circuitId.toLowerCase()];

  // Helper to find corner by number
  const findCorner = (num: number) => {
    return transformedCorners.find(c => c.number === num);
  };

  let s1Idx = -1;
  let s2Idx = -1;
  let stIdx = -1;

  if (spec && transformedCorners.length >= 3) {
    const cS1 = findCorner(spec.s1AfterTurn);
    const cS1Next = findCorner(spec.s1AfterTurn + 1);

    if (cS1 && typeof cS1.trackPointIndex === 'number' && cS1.trackPointIndex >= 0) {
      if (cS1Next && typeof cS1Next.trackPointIndex === 'number' && cS1Next.trackPointIndex > cS1.trackPointIndex) {
        s1Idx = Math.floor((cS1.trackPointIndex + cS1Next.trackPointIndex) / 2);
      } else {
        s1Idx = Math.min(totalPts - 2, cS1.trackPointIndex + Math.max(2, Math.floor(totalPts * 0.02)));
      }
    }

    const cS2 = findCorner(spec.s2AfterTurn);
    const cS2Next = findCorner(spec.s2AfterTurn + 1);

    if (cS2 && typeof cS2.trackPointIndex === 'number' && cS2.trackPointIndex >= 0) {
      if (cS2Next && typeof cS2Next.trackPointIndex === 'number' && cS2Next.trackPointIndex > cS2.trackPointIndex) {
        s2Idx = Math.floor((cS2.trackPointIndex + cS2Next.trackPointIndex) / 2);
      } else {
        s2Idx = Math.min(totalPts - 2, cS2.trackPointIndex + Math.max(2, Math.floor(totalPts * 0.02)));
      }
    }

    const cSt = findCorner(spec.speedTrapBeforeTurn);
    if (cSt && typeof cSt.trackPointIndex === 'number' && cSt.trackPointIndex >= 0) {
      const offset = Math.max(4, Math.floor(totalPts * 0.04));
      stIdx = (cSt.trackPointIndex - offset + totalPts) % totalPts;
    }
  }

  // Fallback 1: Pre-calibrated spec fallback ratios
  if (s1Idx <= 0 && spec) {
    s1Idx = Math.floor(totalPts * spec.fallbackRatios.s1);
  }
  if (s2Idx <= 0 && spec) {
    s2Idx = Math.floor(totalPts * spec.fallbackRatios.s2);
  }
  if (stIdx <= 0 && spec) {
    stIdx = Math.floor(totalPts * spec.fallbackRatios.speedTrap);
  }

  // Fallback 2: Meta registry ratio
  const refPts = refPtsCount || totalPts;
  if (s1Idx <= 0) {
    const rawS1 = trackMetaSectors?.[0]?.markerIndex;
    if (typeof rawS1 === 'number' && refPts > 0) {
      s1Idx = Math.floor(totalPts * (rawS1 / refPts));
    } else {
      s1Idx = Math.floor(totalPts * 0.31);
    }
  }

  if (s2Idx <= 0) {
    const rawS2 = trackMetaSectors?.[1]?.markerIndex;
    if (typeof rawS2 === 'number' && refPts > 0) {
      s2Idx = Math.floor(totalPts * (rawS2 / refPts));
    } else {
      s2Idx = Math.floor(totalPts * 0.67);
    }
  }

  if (stIdx <= 0) {
    if (typeof trackMetaSpeedTrap === 'number' && refPts > 0) {
      stIdx = Math.floor(totalPts * (trackMetaSpeedTrap / refPts));
    } else {
      stIdx = Math.floor(totalPts * 0.58);
    }
  }

  // Sanity check order: 0 < s1Idx < s2Idx < totalPts
  if (s1Idx >= s2Idx) {
    s1Idx = Math.floor(totalPts * 0.31);
    s2Idx = Math.floor(totalPts * 0.67);
  }

  s1Idx = Math.max(1, Math.min(totalPts - 2, s1Idx));
  s2Idx = Math.max(s1Idx + 1, Math.min(totalPts - 2, s2Idx));
  stIdx = Math.max(0, Math.min(totalPts - 1, stIdx));

  return { s1Idx, s2Idx, stIdx };
}
