// Unified Master Gallery Registry for all 78 F1 Circuits
// Data loaded from static JSON to optimize build time, memory usage, and IDE responsiveness.

import { CircuitCorner } from './circuitCornersData';
import { GalleryMediaItem } from './galleryMediaData';
import registryData from '../../public/data/circuitGalleryRegistry.json';

export const TOTAL_TURNS_BY_CIRCUIT = registryData.TOTAL_TURNS_BY_CIRCUIT as Record<string, number>;
export const ALL_GALLERY_ITEMS_BY_CIRCUIT = registryData.ALL_GALLERY_ITEMS_BY_CIRCUIT as unknown as Record<string, GalleryMediaItem[]>;
export const ALL_SPECS_BY_CIRCUIT = registryData.ALL_SPECS_BY_CIRCUIT as unknown as Record<string, Record<string, CircuitCorner>>;

export function getCircuitGalleryItems(circuitId: string): GalleryMediaItem[] {
  const normId = (circuitId || '').toLowerCase().replace(/-/g, '_');
  return ALL_GALLERY_ITEMS_BY_CIRCUIT[normId] || ALL_GALLERY_ITEMS_BY_CIRCUIT[circuitId.toLowerCase()] || [];
}

export function getCircuitCornerSpecs(
  circuitId: string,
  mediaItem?: GalleryMediaItem | null,
  cornerKey?: string
): CircuitCorner | null {
  const normId = (circuitId || '').toLowerCase().replace(/-/g, '_');
  const circuitSpecs = ALL_SPECS_BY_CIRCUIT[normId] || ALL_SPECS_BY_CIRCUIT[circuitId.toLowerCase()];
  if (!circuitSpecs) return null;

  if (cornerKey) {
    const keyLower = cornerKey.toLowerCase();
    if (circuitSpecs[keyLower]) return circuitSpecs[keyLower];
    const m = keyLower.match(/\d+/);
    if (m && circuitSpecs['t' + m[0]]) return circuitSpecs['t' + m[0]];
  }

  if (mediaItem) {
    const idLower = mediaItem.id.toLowerCase();
    if (circuitSpecs[idLower]) return circuitSpecs[idLower];
    const m = idLower.match(/t(\d+)/);
    if (m && circuitSpecs['t' + m[1]]) return circuitSpecs['t' + m[1]];
    const titleMatch = mediaItem.title.match(/turns?\s*(\d+)/i);
    if (titleMatch && circuitSpecs['t' + titleMatch[1]]) return circuitSpecs['t' + titleMatch[1]];
  }

  return null;
}

export function getCircuitTotalCorners(circuitId: string): number {
  const normId = (circuitId || '').toLowerCase().replace(/-/g, '_');
  return TOTAL_TURNS_BY_CIRCUIT[normId] || TOTAL_TURNS_BY_CIRCUIT[circuitId.toLowerCase()] || 0;
}
