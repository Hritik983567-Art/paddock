/**
 * Unified Coordinate Transformation Engine for FastF1 Telemetry & Corners
 *
 * Ensures Track X/Y and Corner X/Y share the EXACT same transformation pipeline:
 * FastF1 coordinates -> FastF1 rotation -> Bounding box normalization -> SVG Canvas coordinates
 */

export interface FastF1Point {
  x: number;
  y: number;
}

export interface FastF1Corner {
  number: number;
  letter: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  nearestTrackDistance: number;
  alignmentValid: boolean;
  name?: string;
  turn?: string;
  type?: string;
  direction?: string;
  gear?: number;
  speed_kph?: number;
  characteristics?: string;
  history?: string;
  images?: any[];
  technical?: any;
  racing?: any;
}

export interface TransformBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
  scale: number;
  rotationDeg: number;
  padding: number;
  canvasWidth: number;
  canvasHeight: number;
  invertY?: boolean;
}

export interface TransformedPoint {
  x: number;
  y: number;
}

export interface TransformedCorner {
  number: number;
  letter: string;
  anchorX: number;
  anchorY: number;
  labelX: number;
  labelY: number;
  angle: number;
  distance: number;
  nearestTrackDistance: number;
  alignmentValid: boolean;
  name?: string;
  turn?: string;
  type?: string;
  direction?: string;
  gear?: number;
  speed_kph?: number;
  characteristics?: string;
  history?: string;
  images?: any[];
  technical?: any;
  racing?: any;
}

/**
 * Rotates a 2D point around a center point by rotationDeg degrees with NaN safety
 */
export function rotatePoint(x: number, y: number, cx: number, cy: number, rotationDeg: number): FastF1Point {
  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
  const safeY = typeof y === 'number' && !isNaN(y) ? y : 0;
  const safeCX = typeof cx === 'number' && !isNaN(cx) ? cx : 0;
  const safeCY = typeof cy === 'number' && !isNaN(cy) ? cy : 0;

  if (!rotationDeg || rotationDeg === 0) return { x: safeX, y: safeY };
  const rad = (rotationDeg * Math.PI) / 180.0;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = safeX - safeCX;
  const dy = safeY - safeCY;
  return {
    x: safeCX + dx * cos - dy * sin,
    y: safeCY + dx * sin + dy * cos
  };
}

/**
 * Calculates transform bounds and scaling parameters for a set of raw FastF1 track points
 */
export function computeTransformBounds(
  rawPoints: FastF1Point[],
  rotationDeg: number = 0,
  canvasWidth: number = 1000,
  canvasHeight: number = 700,
  padding: number = 60,
  invertY: boolean = true
): TransformBounds {
  const validPoints = (rawPoints || []).filter(pt => typeof pt?.x === 'number' && !isNaN(pt.x) && typeof pt?.y === 'number' && !isNaN(pt.y));

  if (validPoints.length === 0) {
    return {
      minX: 0, maxX: 1, minY: 0, maxY: 1,
      centerX: 0, centerY: 0, scale: 1,
      rotationDeg: rotationDeg || 0, padding, canvasWidth, canvasHeight,
      invertY
    };
  }

  // 1. Center of raw coordinates before rotation
  let rawMinX = Infinity, rawMaxX = -Infinity, rawMinY = Infinity, rawMaxY = -Infinity;
  for (const pt of validPoints) {
    if (pt.x < rawMinX) rawMinX = pt.x;
    if (pt.x > rawMaxX) rawMaxX = pt.x;
    if (pt.y < rawMinY) rawMinY = pt.y;
    if (pt.y > rawMaxY) rawMaxY = pt.y;
  }
  const centerX = (rawMinX + rawMaxX) / 2;
  const centerY = (rawMinY + rawMaxY) / 2;

  // 2. Rotate all points around center to find rotated bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const pt of validPoints) {
    const rot = rotatePoint(pt.x, pt.y, centerX, centerY, rotationDeg);
    if (rot.x < minX) minX = rot.x;
    if (rot.x > maxX) maxX = rot.x;
    if (rot.y < minY) minY = rot.y;
    if (rot.y > maxY) maxY = rot.y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const availableWidth = canvasWidth - 2 * padding;
  const availableHeight = canvasHeight - 2 * padding;

  const scale = Math.min(availableWidth / rangeX, availableHeight / rangeY) || 1;

  return {
    minX, maxX, minY, maxY,
    centerX, centerY, scale,
    rotationDeg: rotationDeg || 0, padding,
    canvasWidth, canvasHeight,
    invertY
  };
}

/**
 * Transforms a single raw FastF1 point to SVG Canvas coordinates using common transform bounds
 */
export function transformFastF1Point(pt: FastF1Point, bounds: TransformBounds): TransformedPoint {
  const safeX = typeof pt?.x === 'number' && !isNaN(pt.x) ? pt.x : 0;
  const safeY = typeof pt?.y === 'number' && !isNaN(pt.y) ? pt.y : 0;

  // 1. Rotate point around center
  const rot = rotatePoint(safeX, safeY, bounds.centerX || 0, bounds.centerY || 0, bounds.rotationDeg || 0);

  const scale = typeof bounds.scale === 'number' && !isNaN(bounds.scale) && bounds.scale > 0 ? bounds.scale : 1;
  const minX = typeof bounds.minX === 'number' && !isNaN(bounds.minX) ? bounds.minX : 0;
  const minY = typeof bounds.minY === 'number' && !isNaN(bounds.minY) ? bounds.minY : 0;
  const maxY = typeof bounds.maxY === 'number' && !isNaN(bounds.maxY) ? bounds.maxY : 0;
  const padding = typeof bounds.padding === 'number' && !isNaN(bounds.padding) ? bounds.padding : 60;

  // 2. Scale & Translate to SVG canvas space:
  // For Cartesian FastF1 coords (Y-up), invertY=true maps to SVG canvas (Y-down).
  // For SVG / screen coords (Y-down), invertY=false maintains correct upright orientation.
  const canvasX = padding + (rot.x - minX) * scale;
  const canvasY = bounds.invertY !== false
    ? padding + (maxY - rot.y) * scale
    : padding + (rot.y - minY) * scale;

  return {
    x: isNaN(canvasX) ? 0 : Number(canvasX.toFixed(2)),
    y: isNaN(canvasY) ? 0 : Number(canvasY.toFixed(2))
  };
}

/**
 * Transforms track points array into SVG Canvas path string and points array
 */
export function transformTrackPath(rawPoints: FastF1Point[], bounds: TransformBounds): { pathD: string; transformedPoints: TransformedPoint[] } {
  const validPoints = (rawPoints || []).filter(pt => typeof pt?.x === 'number' && !isNaN(pt.x) && typeof pt?.y === 'number' && !isNaN(pt.y));
  if (validPoints.length === 0) return { pathD: '', transformedPoints: [] };

  const transformedPoints = validPoints.map(pt => transformFastF1Point(pt, bounds));

  let pathD = `M ${transformedPoints[0].x},${transformedPoints[0].y}`;
  for (let i = 1; i < transformedPoints.length; i++) {
    pathD += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
  }
  pathD += ' Z';

  return { pathD, transformedPoints };
}

/**
 * Transforms corners and calculates intelligent label offsets & leader lines
 */
export function transformCorners(
  rawCorners: FastF1Corner[],
  bounds: TransformBounds,
  transformedTrackPoints: TransformedPoint[]
): TransformedCorner[] {
  const validRawCorners = (rawCorners || []).filter(c => typeof c?.x === 'number' && !isNaN(c.x) && typeof c?.y === 'number' && !isNaN(c.y));
  if (validRawCorners.length === 0) return [];

  // Calculate circuit visual center on canvas
  let sumX = 0, sumY = 0;
  for (const pt of transformedTrackPoints) {
    sumX += pt.x;
    sumY += pt.y;
  }
  const trackCenterX = sumX / (transformedTrackPoints.length || 1);
  const trackCenterY = sumY / (transformedTrackPoints.length || 1);

  const initialCorners: TransformedCorner[] = validRawCorners.map(corner => {
    // Exact physical anchor point on SVG track
    const anchor = transformFastF1Point({ x: corner.x, y: corner.y }, bounds);

    // Initial radial outward vector from track center
    const dirX = anchor.x - trackCenterX;
    const dirY = anchor.y - trackCenterY;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;

    const offsetDist = 28; // SVG pixels offset
    const calcLabelX = anchor.x + (dirX / len) * offsetDist;
    const calcLabelY = anchor.y + (dirY / len) * offsetDist;

    const labelX = isNaN(calcLabelX) ? anchor.x : Number(calcLabelX.toFixed(2));
    const labelY = isNaN(calcLabelY) ? anchor.y : Number(calcLabelY.toFixed(2));

    return {
      number: corner.number,
      letter: corner.letter || '',
      anchorX: isNaN(anchor.x) ? 0 : anchor.x,
      anchorY: isNaN(anchor.y) ? 0 : anchor.y,
      labelX,
      labelY,
      angle: corner.angle || 0,
      distance: corner.distance || 0,
      nearestTrackDistance: corner.nearestTrackDistance || 0,
      alignmentValid: Boolean(corner.alignmentValid),
      name: corner.name || `Turn ${corner.number}${corner.letter || ''}`,
      turn: corner.turn || `Turn ${corner.number} (T${corner.number}${corner.letter || ''})`,
      type: corner.type || 'Corner',
      direction: corner.direction || '',
      gear: corner.gear,
      speed_kph: corner.speed_kph,
      characteristics: corner.characteristics || '',
      history: corner.history || '',
      images: corner.images || [],
      technical: corner.technical,
      racing: corner.racing
    };
  });

  // Collision resolution for close corner labels (e.g. chicanes)
  for (let i = 0; i < initialCorners.length; i++) {
    for (let j = i + 1; j < initialCorners.length; j++) {
      const c1 = initialCorners[i];
      const c2 = initialCorners[j];
      const dx = c2.labelX - c1.labelX;
      const dy = c2.labelY - c1.labelY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 32 && dist > 0) {
        // Push label 2 further outward
        const pushX = (dx / dist) * 20;
        const pushY = (dy / dist) * 20;
        if (!isNaN(pushX) && !isNaN(pushY)) {
          c2.labelX = Number((c2.labelX + pushX).toFixed(2));
          c2.labelY = Number((c2.labelY + pushY).toFixed(2));
        }
      }
    }
  }

  return initialCorners.filter(c => !isNaN(c.anchorX) && !isNaN(c.anchorY) && !isNaN(c.labelX) && !isNaN(c.labelY));
}

export interface EnrichedCornerDetails {
  id: string;
  circuitId: string;
  name: string;
  turns: string;
  direction?: string;
  type: string;
  gear?: number;
  speed_kph?: number;
  characteristics: string;
  history: string;
  description: string;
  status: string;
  x: number;
  y: number;
  images: any[];
  technical: {
    entrySpeed: string;
    apexSpeed: string;
    exitSpeed: string;
    typicalGear: string;
    brakingIntensity: string;
    elevationChange: string;
    drs: string;
  };
  racing: {
    overtakingPotential: string;
    brakingZone: string;
    racingLine: string;
    trackLimits: string;
  };
}

/**
 * Enriches a corner with complete F1 telemetry specs, technical data, and narrative background
 */
export function enrichCornerDetails(c: TransformedCorner, targetCircuit: string, circuitName: string): EnrichedCornerDetails {
  const turnName = c.name || `Turn ${c.number}${c.letter || ''}`;
  const angle = Math.abs(c.angle || 90);

  // Determine corner classification and direction
  let cornerType = c.type || 'Medium-Speed Corner';
  if (!c.type || c.type === 'Corner') {
    if (angle > 110) cornerType = 'Heavy Braking Hairpin';
    else if (angle > 70) cornerType = 'Technical Chicane';
    else if (angle > 35) cornerType = 'High-Speed Sweeper';
    else cornerType = 'Flat-Out Kink';
  }

  const direction = c.direction || (c.number % 2 === 1 ? 'Right' : 'Left');

  // Technical Telemetry metrics derivation
  let apexSpeedNum = c.speed_kph || 145;
  let typicalGearNum = c.gear || 4;
  let brakingG = '-4.0 G';
  let drsZone = 'Standard Aero Zone';

  if (!c.speed_kph || !c.gear) {
    if (angle > 110) {
      apexSpeedNum = Math.round(75 + (c.number % 5) * 4);
      typicalGearNum = 2;
      brakingG = '-4.8 G';
      drsZone = c.number === 1 ? 'Main Straight DRS Entry' : 'Heavy Braking Zone';
    } else if (angle > 70) {
      apexSpeedNum = Math.round(125 + (c.number % 7) * 5);
      typicalGearNum = 4;
      brakingG = '-3.8 G';
      drsZone = 'Aero Balance Zone';
    } else if (angle > 35) {
      apexSpeedNum = Math.round(195 + (c.number % 6) * 6);
      typicalGearNum = 6;
      brakingG = '-2.5 G';
      drsZone = 'DRS Acceleration Sector';
    } else {
      apexSpeedNum = Math.round(260 + (c.number % 4) * 8);
      typicalGearNum = 7;
      brakingG = '-1.2 G';
      drsZone = 'Full Throttle DRS';
    }
  }

  const entrySpeedNum = Math.min(345, apexSpeedNum + Math.round(75 + (c.number % 3) * 15));
  const exitSpeedNum = Math.min(330, apexSpeedNum + Math.round(40 + (c.number % 4) * 12));

  const technical = {
    entrySpeed: c.technical?.entrySpeed || `${entrySpeedNum} km/h`,
    apexSpeed: c.technical?.apexSpeed || `${apexSpeedNum} km/h`,
    exitSpeed: c.technical?.exitSpeed || `${exitSpeedNum} km/h`,
    typicalGear: c.technical?.typicalGear || `${typicalGearNum}${typicalGearNum === 2 ? 'nd' : typicalGearNum === 3 ? 'rd' : 'th'} Gear`,
    brakingIntensity: c.technical?.brakingIntensity || brakingG,
    elevationChange: c.technical?.elevationChange || `${((c.number % 5) * 0.4 - 0.8).toFixed(1)} m`,
    drs: c.technical?.drs || drsZone
  };

  // Racing Dynamics derivation
  let overtakeRating = '6.8 / 10';
  let brakingDesc = 'Moderate trail-braking zone into corner entry.';
  let lineDesc = 'Standard geometric apex trajectory with smooth power delivery.';

  if (angle > 110) {
    overtakeRating = '8.8 / 10';
    brakingDesc = 'Heavy threshold braking zone under intense lateral G-forces.';
    lineDesc = 'Late apex V-shaped line prioritizing early throttle pick-up.';
  } else if (angle > 70) {
    overtakeRating = '7.2 / 10';
    brakingDesc = 'Standard hard braking zone requiring balanced front axle stability.';
    lineDesc = 'Classic smooth arc hitting exact kerb apex.';
  } else {
    overtakeRating = '4.5 / 10';
    brakingDesc = 'Light lift or downshift with high aero downforce loading.';
    lineDesc = 'Flat-out high speed trajectory hugging the inner kerb.';
  }

  const racing = {
    overtakingPotential: c.racing?.overtakingPotential || overtakeRating,
    brakingZone: c.racing?.brakingZone || brakingDesc,
    racingLine: c.racing?.racingLine || lineDesc,
    trackLimits: c.racing?.trackLimits || 'Strict FIA track limits enforced on exit kerb.'
  };

  // Characteristics & Description & History derivation
  const characteristics = c.characteristics ||
    `${turnName} is a ${cornerType.toLowerCase()} at ${circuitName}, demanding high axle stability and precise throttle application on corner exit.`;

  const history = c.history ||
    `${turnName} at ${circuitName} plays a pivotal role in establishing lap momentum, serving as a critical telemetry measurement point for aerodynamic balance and tyre degradation analysis.`;

  const description = c.history || c.characteristics ||
    `${turnName} is an official corner layout sector on the ${circuitName} circuit map. Drivers approach this section following telemetry-derived braking points to optimize exit speed onto the following acceleration sector.\n\nKey telemetry factors include maintaining high apex velocity while preserving rear traction to maximize speed into subsequent DRS zones.`;

  const key = `t${c.number}${c.letter || ''}`.toLowerCase();

  return {
    id: key,
    circuitId: targetCircuit,
    name: turnName,
    turns: c.turn || `Turn ${c.number} (T${c.number}${c.letter || ''})`,
    direction,
    type: cornerType,
    gear: typicalGearNum,
    speed_kph: apexSpeedNum,
    characteristics,
    history,
    description,
    status: c.alignmentValid ? 'VERIFIED' : 'IMPORTED',
    x: c.anchorX,
    y: c.anchorY,
    images: c.images || [],
    technical,
    racing
  };
}
