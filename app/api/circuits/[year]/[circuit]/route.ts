import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TRACKS_REGISTRY } from '@/app/lib/tracksRegistry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; circuit: string }> }
) {
  try {
    const { year, circuit } = await params;
    const circuitId = circuit.toLowerCase();
    const altId = circuitId.includes('-') ? circuitId.replace(/-/g, '_') : circuitId.replace(/_/g, '-');
    const normId = circuitId.replace(/-/g, '_');
    const circuitsDir = path.join(process.cwd(), 'public', 'data', 'circuits');
    
    let filePath = path.join(circuitsDir, year, `${circuitId}.json`);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(circuitsDir, year, `${altId}.json`);
    }

    // 1. Search across all cached year directories if not found in requested year folder
    if (!fs.existsSync(filePath) && fs.existsSync(circuitsDir)) {
      const yearDirs = fs.readdirSync(circuitsDir).filter(y => {
        const full = path.join(circuitsDir, y);
        return fs.statSync(full).isDirectory();
      }).sort((a, b) => Number(b) - Number(a)); // Search newest year first

      for (const yDir of yearDirs) {
        const p1 = path.join(circuitsDir, yDir, `${circuitId}.json`);
        const p2 = path.join(circuitsDir, yDir, `${altId}.json`);
        if (fs.existsSync(p1)) {
          filePath = p1;
          break;
        } else if (fs.existsSync(p2)) {
          filePath = p2;
          break;
        }
      }
    }

    let circuitData: any = null;

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      if (parsed.status !== "DATA UNAVAILABLE") {
        const innerId = (parsed.circuit?.id || '').toLowerCase();
        if (!innerId || innerId === circuitId || innerId === altId || innerId.replace(/-/g, '_') === normId) {
          circuitData = parsed;
        }
      }
    }

    // 2. Alternative Fallback: If FastF1 telemetry file is missing or marked UNAVAILABLE, use TRACKS_REGISTRY & Heritage Dataset
    if (!circuitData) {
      const trackDef = TRACKS_REGISTRY[circuitId] || TRACKS_REGISTRY[altId] || TRACKS_REGISTRY[normId];
      const heritageFilePath = path.join(process.cwd(), 'paddock_f1_2026_circuit_corners.json');
      let heritageCorners: any[] = [];
      let circuitName = trackDef?.name || circuitId.replace(/_/g, ' ').toUpperCase();
      let country = trackDef?.country || '';

      if (fs.existsSync(heritageFilePath)) {
        try {
          const hContent = fs.readFileSync(heritageFilePath, 'utf8');
          const hJson = JSON.parse(hContent);
          const matchedCircuit = hJson.circuits?.find((c: any) => c.id === circuitId || c.id === altId || c.id === normId);
          if (matchedCircuit) {
            circuitName = matchedCircuit.name || circuitName;
            country = matchedCircuit.country || country;
            if (Array.isArray(matchedCircuit.corners)) {
              heritageCorners = matchedCircuit.corners;
            }
          }
        } catch (e) {
          console.error('Error loading heritage JSON for fallback:', e);
        }
      }

      if (trackDef && trackDef.path && trackDef.path.length > 0) {
        const points = trackDef.path.map(pt => ({ x: pt[0], y: pt[1] }));
        const formattedCorners = heritageCorners.map((c: any) => ({
          number: c.turnNumber || parseInt(c.id.replace('t', ''), 10) || 1,
          letter: '',
          name: c.name || `Turn ${c.turnNumber || c.id}`,
          turn: c.turn || `Turn ${c.turnNumber || c.id}`,
          x: c.x,
          y: c.y,
          angle: 45.0,
          distance: 0.0,
          nearestTrackDistance: 0.0,
          alignmentValid: true,
          type: c.type || 'Corner',
          direction: c.direction || '',
          gear: c.gear,
          speed_kph: c.speed_kph,
          characteristics: c.characteristics || '',
          history: c.history || '',
          images: c.images || [],
          technical: c.technical,
          racing: c.racing
        }));

        circuitData = {
          circuit: {
            id: circuitId,
            name: circuitName,
            country: country,
            location: country,
            year: Number(year)
          },
          sourceSession: "Heritage Circuit Registry",
          telemetryDriver: "HISTORIC",
          telemetryLap: 1,
          rotation: 0,
          layout: {
            source: "Circuit Registry Centerline",
            coordinateSystem: "registry_xy",
            pointCount: points.length,
            points: points
          },
          corners: formattedCorners
        };
      }
    }

    if (!circuitData) {
      return NextResponse.json(
        {
          circuit: { id: circuitId, year: Number(year) },
          status: "DATA UNAVAILABLE",
          reason: `No FastF1 position telemetry or registry dataset available for circuit "${circuitId}".`
        },
        { status: 404 }
      );
    }

    // 3. Dynamically enrich corners with rich heritage details if missing
    const heritageFilePath = path.join(process.cwd(), 'paddock_f1_2026_circuit_corners.json');
    if (fs.existsSync(heritageFilePath)) {
      try {
        const heritageContent = fs.readFileSync(heritageFilePath, 'utf8');
        const heritageJson = JSON.parse(heritageContent);
        const circuitHeritage = heritageJson.circuits?.find((c: any) => c.id === circuitId || c.id === altId || c.id === normId);

        if (circuitHeritage && Array.isArray(circuitHeritage.corners)) {
          if (!circuitData.corners || circuitData.corners.length === 0) {
            const points = circuitData.layout?.points || [];
            const turnCount = circuitHeritage.corners.length;
            circuitData.corners = circuitHeritage.corners.map((c: any, k: number) => {
              const pt = points.length > 0 ? points[Math.floor((k / turnCount) * points.length)] : { x: 0, y: 0 };
              return {
                number: c.turnNumber || (k + 1),
                letter: '',
                name: c.name || `Turn ${c.turnNumber || (k + 1)}`,
                turn: c.turn || `Turn ${c.turnNumber || (k + 1)}`,
                x: c.x !== undefined ? c.x : pt.x,
                y: c.y !== undefined ? c.y : pt.y,
                angle: 45.0,
                distance: 0.0,
                nearestTrackDistance: 0.0,
                alignmentValid: true,
                type: c.type || 'Corner',
                direction: c.direction || '',
                gear: c.gear,
                speed_kph: c.speed_kph,
                characteristics: c.characteristics || '',
                history: c.history || '',
                images: c.images || [],
                technical: c.technical,
                racing: c.racing
              };
            });
          } else {
            const cornerMap = new Map<number, any>();
            circuitHeritage.corners.forEach((c: any) => {
              if (c.turnNumber !== undefined) {
                cornerMap.set(c.turnNumber, c);
              }
            });

            circuitData.corners = circuitData.corners.map((corner: any) => {
              const hItem = cornerMap.get(corner.number) || {};
              return {
                ...corner,
                name: corner.name || hItem.name || `Turn ${corner.number}${corner.letter || ''}`,
                turn: corner.turn || hItem.turn || `Turn ${corner.number} (T${corner.number}${corner.letter || ''})`,
                type: corner.type || hItem.type || 'Corner',
                direction: corner.direction || hItem.direction || '',
                gear: corner.gear ?? hItem.gear,
                speed_kph: corner.speed_kph ?? hItem.speed_kph,
                characteristics: corner.characteristics || hItem.characteristics || '',
                history: corner.history || hItem.history || '',
                images: (corner.images && corner.images.length > 0) ? corner.images : (hItem.images || []),
                technical: corner.technical || hItem.technical,
                racing: corner.racing || hItem.racing
              };
            });
          }
        }
      } catch (err) {
        console.error('Error enriching circuit corners with heritage data:', err);
      }
    }

    return NextResponse.json(circuitData);
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: error.message },
      { status: 500 }
    );
  }
}
