import { NextResponse } from 'next/server';

const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in-memory server cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path ? path.join('/') : '';
    const targetUrl = `https://api.jolpica.net/ergast/f1/${pathString}.json`;

    // Check Cache
    const cached = cache.get(targetUrl);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=300' }
      });
    }

    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'PaddockAnalytics/2.0' },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      if (cached) {
        return NextResponse.json(cached.data, { headers: { 'X-Cache': 'STALE' } });
      }
      return NextResponse.json({ MRData: { RaceTable: { Races: [] } }, error: 'Upstream API unavailable' }, { status: 502 });
    }

    const data = await res.json();
    cache.set(targetUrl, { timestamp: Date.now(), data });

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=300' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server proxy failure' }, { status: 500 });
  }
}
