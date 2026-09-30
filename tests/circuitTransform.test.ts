import { describe, it, expect } from 'vitest';
import { enrichCornerDetails, TransformedCorner } from '../app/lib/circuitTransform';

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
});
