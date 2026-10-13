import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

let cachedCircuits: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1-hour cache TTL

export async function GET() {
  try {
    if (cachedCircuits && (Date.now() - cachedCircuits.timestamp < CACHE_TTL_MS)) {
      return NextResponse.json(cachedCircuits.data, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
      });
    }

    const circuitsDir = path.join(process.cwd(), 'public', 'data', 'circuits');
    const indexPath = path.join(circuitsDir, 'index.json');

    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      const parsed = JSON.parse(content);
      cachedCircuits = { data: parsed, timestamp: Date.now() };
      return NextResponse.json(parsed, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
      });
    }

    // Fallback: list year directories and files
    const result: any[] = [];
    if (fs.existsSync(circuitsDir)) {
      const years = fs.readdirSync(circuitsDir).filter(y => fs.statSync(path.join(circuitsDir, y)).isDirectory());
      for (const year of years) {
        const yearDir = path.join(circuitsDir, year);
        const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const circuitId = file.replace('.json', '');
          const filePath = path.join(yearDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (data.circuit) {
            result.push({
              id: circuitId,
              name: data.circuit.name,
              country: data.circuit.country,
              year: Number(year),
              cornerCount: data.corners ? data.corners.length : 0,
              pointCount: data.layout && data.layout.points ? data.layout.points.length : 0,
              sourceSession: data.sourceSession
            });
          }
        }
      }
    }

    return NextResponse.json({ circuits: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
