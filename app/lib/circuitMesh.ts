import * as THREE from 'three';

export interface CornerROMItem {
  id: string;
  name?: string;
  speed_kph?: number;
  track_pct?: number;
  dist_pct?: number;
  [key: string]: any;
}

/**
 * Normalizes raw circuit coordinates and builds a smooth, non-intersecting 3D track line & corner markers
 * @param {Array<[number, number]>} rawCoordinates - Array of [lon, lat] or [x, y] points in strict lap sequence
 * @param {Array<CornerROMItem>} cornerROM - The corner details ROM [{ id: "T1", dist_pct: 0.05, ... }]
 * @param {number} targetScale - Normalized scale size in 3D units (e.g. 100)
 */
export function buildCircuitMesh(
  rawCoordinates: Array<[number, number]>,
  cornerROM: CornerROMItem[] = [],
  targetScale: number = 100
) {
  if (!rawCoordinates || rawCoordinates.length === 0) {
    const circuitGroup = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(0, 0, -10)
      ],
      true,
      'centripetal'
    );
    return { circuitGroup, curve };
  }

  // 1. Center & normalize bounding box to eliminate camera clipping & axis mismatch
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of rawCoordinates) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scale = targetScale / Math.max(rangeX, rangeY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // 2. Map coordinates correctly to 3D X-Z ground plane (Z is inverted latitude)
  const points3D = rawCoordinates.map(([x, y]) => {
    const normX = (x - centerX) * scale;
    const normZ = -(y - centerY) * scale; // Invert to preserve clockwise/counter-clockwise orientation
    return new THREE.Vector3(normX, 0, normZ);
  });

  // 3. Create a smooth CatmullRomCurve3 (closed loop)
  const curve = new THREE.CatmullRomCurve3(points3D, true, 'centripetal');

  // 4. Sample equidistant points so the ribbon never self-crosses or bunches up
  const equidistantPoints = curve.getSpacedPoints(1000);
  const trackGeometry = new THREE.BufferGeometry().setFromPoints(equidistantPoints);

  const trackMaterial = new THREE.LineBasicMaterial({
    color: 0x00d2be,
    linewidth: 3
  });
  const trackLine = new THREE.LineLoop(trackGeometry, trackMaterial);

  // 5. Accurate Corner Placement along the curve
  const cornerMarkers = new THREE.Group();
  cornerROM.forEach(corner => {
    const pct = corner.track_pct ?? corner.dist_pct ?? 0;
    const clampedPct = Math.max(0, Math.min(1, pct));
    // Lookup position along the parametric curve (0.0 to 1.0)
    const pos = curve.getPointAt(clampedPct);

    // Tag mesh
    const markerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xff1e27 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(pos);
    marker.userData = { id: corner.id, name: corner.name, speed: corner.speed_kph };

    cornerMarkers.add(marker);
  });

  const circuitGroup = new THREE.Group();
  circuitGroup.add(trackLine);
  circuitGroup.add(cornerMarkers);

  return { circuitGroup, curve };
}
