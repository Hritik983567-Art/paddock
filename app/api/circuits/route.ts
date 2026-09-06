import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const circuitsDir = path.join(process.cwd(), 'public', 'data', 'circuits');
    const indexPath = path.join(circuitsDir, 'index.json');

    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      return NextResponse.json(JSON.parse(content));
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
