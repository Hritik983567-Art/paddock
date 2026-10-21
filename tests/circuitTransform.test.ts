import { describe, it, expect } from 'vitest';
import {
  enrichCornerDetails,
  calculateSimTelemetry,
  TransformedCorner,
  TransformedPoint
} from '../app/lib/circuitTransform';

describe('Circuit Transform Logic', () => {
  it('should enrich corner details with default fallback values', () => {
    const rawCorner: TransformedCorner = {
      number: 1,
      letter: '',
      anchorX: 100,
      anchorY: 200,
      labelX: 110,
      labelY: 210,
      angle: 45,
      distance: 50,
      nearestTrackDistance: 2,
      alignmentValid: true,
      name: 'Variante del Rettifilo T1',
      speed_kph: 350
    };

    const enriched = enrichCornerDetails(rawCorner, 'monza', 'Autodromo Nazionale Monza');

    expect(enriched).toBeDefined();
    expect(enriched.id).toBe('t1');
    expect(enriched.name).toBe('Variante del Rettifilo T1');
    expect(enriched.speed_kph).toBe(350);
    expect(enriched.turns).toContain('Turn 1');
  });

  it('should calculate full throttle and zero brake on high speed straights', () => {
    const pts: TransformedPoint[] = Array.from({ length: 100 }, (_, i) => ({ x: i * 10, y: 100 }));
    const corners: TransformedCorner[] = [
      {
        number: 1,
        letter: '',
        anchorX: 900,
        anchorY: 100,
        labelX: 900,
        labelY: 80,
        angle: 90,
        distance: 900,
        nearestTrackDistance: 0,
        alignmentValid: true,
        speed_kph: 80,
        gear: 2,
        trackPointIndex: 90
      } as any
    ];
    const speedSegments = Array.from({ length: 50 }, () => ({ speed: 330 }));

    const telemetry = calculateSimTelemetry(0.1, pts, corners, speedSegments);
    expect(telemetry).not.toBeNull();
    if (telemetry) {
      expect(telemetry.brake).toBe(0);
      expect(telemetry.throttle).toBe(100);
      expect(telemetry.gear).toBe('8th');
    }
  });

  it('should dynamically engage brake and cut throttle when entering a corner braking zone', () => {
    const pts: TransformedPoint[] = Array.from({ length: 100 }, (_, i) => ({ x: i * 10, y: 100 }));
    const corners: TransformedCorner[] = [
      {
        number: 1,
        letter: '',
        anchorX: 500,
        anchorY: 100,
        labelX: 500,
        labelY: 80,
        angle: 110,
        distance: 500,
        nearestTrackDistance: 0,
        alignmentValid: true,
        speed_kph: 75,
        gear: 2,
        trackPointIndex: 50
      } as any
    ];

    const speedSegments = Array.from({ length: 50 }, (_, i) => {
      if (i < 22) return { speed: 320 };
      if (i === 22) return { speed: 280 };
      if (i === 23) return { speed: 180 };
      if (i === 24) return { speed: 110 };
      if (i === 25) return { speed: 75 };
      return { speed: 280 };
    });

    const telemetryApproaching = calculateSimTelemetry(0.45, pts, corners, speedSegments);
    expect(telemetryApproaching).not.toBeNull();
    if (telemetryApproaching) {
      expect(telemetryApproaching.brake).toBeGreaterThan(50);
      expect(telemetryApproaching.throttle).toBe(0);
      expect(telemetryApproaching.gForce).toContain('-5.');
    }
  });

  it('should release brake and apply throttle on corner exit', () => {
    const pts: TransformedPoint[] = Array.from({ length: 100 }, (_, i) => ({ x: i * 10, y: 100 }));
    const corners: TransformedCorner[] = [
      {
        number: 1,
        letter: '',
        anchorX: 200,
        anchorY: 100,
        labelX: 200,
        labelY: 80,
        angle: 90,
        distance: 200,
        nearestTrackDistance: 0,
        alignmentValid: true,
        speed_kph: 80,
        gear: 2,
        trackPointIndex: 20
      } as any
    ];
    const speedSegments = Array.from({ length: 50 }, (_, i) => {
      if (i < 10) return { speed: 120 };
      if (i < 15) return { speed: 180 };
      return { speed: 280 };
    });

    const telemetryExiting = calculateSimTelemetry(0.22, pts, corners, speedSegments);
    expect(telemetryExiting).not.toBeNull();
    if (telemetryExiting) {
      expect(telemetryExiting.brake).toBe(0);
      expect(telemetryExiting.throttle).toBeGreaterThan(30);
    }
  });
});
