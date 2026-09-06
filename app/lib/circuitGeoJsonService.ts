/**
 * Circuit GeoJSON ROM Generator Service
 * Fetches standard Formula 1 GeoJSON coordinate loops and calculates normalized cumulative distance splines.
 */

export const BASE_URL = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/';

export const CIRCUIT_REGISTRY: Record<string, string> = {
  monza: 'it-1922.geojson',
  silverstone: 'gb-1948.geojson',
  spa: 'be-1925.geojson',
  monaco: 'mc-1929.geojson',
  suzuka: 'jp-1962.geojson',
  bahrain: 'bh-2004.geojson',
  catalunya: 'es-1991.geojson',
  red_bull_ring: 'at-1969.geojson',
  interlagos: 'br-1940.geojson'
};

export interface SplinePoint {
  idx: number;
  x: number;
  y: number;
  pct: number;
}

export interface CircuitROMResult {
  circuit_id: string;
  spline_point_count: number;
  spline_data: SplinePoint[];
}

/**
 * Normalizes a list of 2D coordinates [lon, lat] or [x, y] into a cumulative-distance parametric spline
 */
export function processCoordinatesToROM(circuit_id: string, coords: Array<[number, number]>): CircuitROMResult {
  if (!coords || coords.length === 0) {
    return {
      circuit_id,
      spline_point_count: 0,
      spline_data: []
    };
  }

  // Calculate cumulative segment lengths
  const cumDist: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    cumDist.push(cumDist[i - 1] + dist);
  }

  const totalLen = cumDist[cumDist.length - 1] || 1.0;

  const spline_data: SplinePoint[] = coords.map((pt, i) => ({
    idx: i,
    x: Number(pt[0].toFixed(6)),
    y: Number(pt[1].toFixed(6)),
    pct: Number((cumDist[i] / totalLen).toFixed(4))
  }));

  return {
    circuit_id,
    spline_point_count: spline_data.length,
    spline_data
  };
}

/**
 * Fetches clean GeoJSON data from GitHub and generates normalized circuit ROM
 */
export async function generateCleanROM(circuit_id: string, fileName?: string): Promise<CircuitROMResult> {
  const file = fileName || CIRCUIT_REGISTRY[circuit_id];
  if (!file) {
    throw new Error(`Circuit ID "${circuit_id}" not found in registry.`);
  }

  const url = `${BASE_URL}${file}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch circuit GeoJSON from ${url} (Status: ${response.status})`);
  }

  const data = await response.json();
  const coords: Array<[number, number]> = [];

  if (Array.isArray(data.features)) {
    for (const feature of data.features) {
      const geomType = feature?.geometry?.type;
      if (geomType === 'LineString' || geomType === 'Polygon') {
        let rawPts = feature.geometry.coordinates;
        if (geomType === 'Polygon' && Array.isArray(rawPts[0])) {
          rawPts = rawPts[0];
        }
        coords.push(...rawPts);
        break;
      }
    }
  }

  return processCoordinatesToROM(circuit_id, coords);
}
