import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ALL_PREDICTOR_FEATURE_COLUMNS } from '../app/lib/predictorDatasetSchema';

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'predictor');
const CSV_PATH = path.join(DATA_DIR, 'f1_race_predictor_dataset.csv');
const DICT_PATH = path.join(DATA_DIR, 'feature_dictionary.json');
const REPORT_PATH = path.join(DATA_DIR, 'DATA_QUALITY_REPORT.md');

describe('Paddock Race Predictor — Historical Dataset Validation', () => {
  it('should verify dataset artifacts exist on disk', () => {
    expect(fs.existsSync(CSV_PATH), `CSV file not found at ${CSV_PATH}`).toBe(true);
    expect(fs.existsSync(DICT_PATH), `Feature dictionary not found at ${DICT_PATH}`).toBe(true);
    expect(fs.existsSync(REPORT_PATH), `Data quality report not found at ${REPORT_PATH}`).toBe(true);
  });

  it('should verify data quality report confirms PASSED validation status', () => {
    const reportContent = fs.readFileSync(REPORT_PATH, 'utf-8');
    expect(reportContent).toContain('**Overall Validation Status**: `PASSED`');
    expect(reportContent).toContain('1. Row Counts & Primary Key Uniqueness');
    expect(reportContent).toContain('4. Single Winner Conservation Invariant');
    expect(reportContent).toContain('5. Temporal Leakage & Rolling Window Audit');
  });

  it('should verify feature dictionary contains all documented columns', () => {
    const dictRaw = fs.readFileSync(DICT_PATH, 'utf-8');
    const dict = JSON.parse(dictRaw);
    for (const col of ALL_PREDICTOR_FEATURE_COLUMNS) {
      expect(dict[col], `Column ${col} missing from feature dictionary`).toBeDefined();
      expect(dict[col].type).toBeDefined();
      expect(dict[col].source).toBeDefined();
      expect(dict[col].leakage_rule).toBeDefined();
    }
  });

  describe('CSV Row-Level Verification', () => {
    let rows: Record<string, string>[] = [];
    let headers: string[] = [];

    // Helper to parse simple CSV
    function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
      const lines = content.trim().split(/\r?\n/);
      if (lines.length < 2) return { headers: [], rows: [] };
      const parsedHeaders = lines[0].split(',');
      const parsedRows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const vals = line.split(',');
        const rowObj: Record<string, string> = {};
        for (let j = 0; j < parsedHeaders.length; j++) {
          rowObj[parsedHeaders[j]] = vals[j] !== undefined ? vals[j] : '';
        }
        parsedRows.push(rowObj);
      }
      return { headers: parsedHeaders, rows: parsedRows };
    }

    it('should parse CSV and verify exact schema header consistency', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const parsed = parseCSV(content);
      headers = parsed.headers;
      rows = parsed.rows;

      expect(rows.length).toBeGreaterThan(0);

      // Verify all required feature columns are in CSV headers
      for (const col of ALL_PREDICTOR_FEATURE_COLUMNS) {
        expect(headers).toContain(col);
      }
    });

    it('should have zero duplicate (season, round, driver_id) observations', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const { rows: parsedRows } = parseCSV(content);

      const seenKeys = new Set<string>();
      const duplicates: string[] = [];

      for (const r of parsedRows) {
        const key = `${r.season}_${r.round}_${r.driver_id}`;
        if (seenKeys.has(key)) {
          duplicates.push(key);
        }
        seenKeys.add(key);
      }

      expect(duplicates).toEqual([]);
    });

    it('should respect physical position bounds [1, 30] and entity IDs', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const { rows: parsedRows } = parseCSV(content);

      for (const r of parsedRows) {
        const grid = parseInt(r.grid_position, 10);
        const quali = parseInt(r.quali_position, 10);
        const penalty = parseInt(r.grid_penalty_delta, 10);

        expect(grid).toBeGreaterThanOrEqual(1);
        expect(grid).toBeLessThanOrEqual(30);

        expect(quali).toBeGreaterThanOrEqual(1);
        expect(quali).toBeLessThanOrEqual(30);

        expect(penalty).toBe(grid - quali);

        expect(r.driver_id.length).toBeGreaterThan(0);
        expect(r.constructor_id.length).toBeGreaterThan(0);
      }
    });

    it('should strictly conserve the Single Winner Invariant (exactly 1 winner per race)', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const { rows: parsedRows } = parseCSV(content);

      const raceWinners: Record<string, number> = {};
      for (const r of parsedRows) {
        const raceId = r.race_id;
        const won = parseInt(r.won_race, 10);
        raceWinners[raceId] = (raceWinners[raceId] || 0) + won;
      }

      for (const [raceId, winnerCount] of Object.entries(raceWinners)) {
        expect(winnerCount, `Race ${raceId} does not have exactly 1 winner (found ${winnerCount})`).toBe(1);
      }
    });

    it('should prevent temporal leakage (Round 1 pre-race points are exactly 0.0)', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const { rows: parsedRows } = parseCSV(content);

      const r1Rows = parsedRows.filter(r => parseInt(r.round, 10) === 1);
      expect(r1Rows.length).toBeGreaterThan(0);

      for (const r of r1Rows) {
        const driverPts = parseFloat(r.driver_season_points_before_gp);
        const constPts = parseFloat(r.constructor_season_points_before_gp);

        expect(driverPts).toBe(0);
        expect(constPts).toBe(0);
      }
    });

    it('should have valid provenance and no invented weather data', () => {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const { rows: parsedRows } = parseCSV(content);

      for (const r of parsedRows) {
        expect(['jolpica', 'jolpica+fastf1']).toContain(r.data_provenance);

        if (r.data_provenance === 'jolpica') {
          // Weather columns should be empty or string representation of null/empty
          expect(r.quali_air_temp_c === '' || r.quali_air_temp_c === 'null' || r.quali_air_temp_c === undefined).toBe(true);
        }
      }
    });
  });
});
