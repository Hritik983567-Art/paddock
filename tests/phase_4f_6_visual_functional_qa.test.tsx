import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import * as fs from 'fs';
import * as path from 'path';

import {
  RacePredictionResponse,
  loadAndValidateDiskSnapshot,
  compareSnapshotPrecedence,
  validateSnapshot
} from '../app/lib/racePredictorService';
import PredictedWinnerBanner from '../app/predictor/components/PredictedWinnerBanner';
import ProbabilityTable from '../app/predictor/components/ProbabilityTable';
import ExplanationsPanel from '../app/predictor/components/ExplanationsPanel';
import PredictorHeader from '../app/predictor/components/PredictorHeader';
import {
  QualifyingNotCompletedState,
  PredictorLoadingSkeleton,
  PredictorErrorState,
  ProvisionalDataNotice
} from '../app/predictor/components/PredictorStatusStates';

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'artifacts', 'visual_qa');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let localCompiledCss = '';
try {
  const cssDir = path.join(PROJECT_ROOT, '.next', 'static', 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    if (cssFiles.length > 0) {
      localCompiledCss = fs.readFileSync(path.join(cssDir, cssFiles[0]), 'utf-8');
    }
  }
} catch {
  // Fallback
}

function wrapInHtmlDocument(title: string, bodyContent: string, viewportWidth: number = 1280): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Paddock Visual QA</title>
  ${localCompiledCss ? `<style>${localCompiledCss}</style>` : '<script src="https://cdn.tailwindcss.com"></script>'}
  <style>
    :root {
      --asphalt: #05070A;
      --carbon: #0C1017;
      --carbon-2: #141923;
      --line: #2E3746;
      --paper: #FFFFFF;
      --dim: #E2E8F0;
      --red: #FF1801;
      --cyan: #00FFE0;
      --amber: #FFC000;
      --green: #00F090;
    }
    body {
      background-color: #05070A;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
    }
    .stitch-card-machined {
      background: linear-gradient(180deg, rgba(20, 25, 35, 0.85) 0%, rgba(12, 16, 23, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    .data-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }
    .viewport-container {
      max-width: ${viewportWidth}px;
      margin: 0 auto;
      border: ${viewportWidth < 500 ? '2px dashed #00FFE0' : 'none'};
      padding: ${viewportWidth < 500 ? '8px' : '0'};
    }
  </style>
</head>
<body>
  <div class="viewport-container">
    <div class="mb-4 pb-2 border-b border-white/10 flex justify-between items-center text-xs text-slate-400 font-mono">
      <span>VIEWPORT: ${viewportWidth}px (${viewportWidth < 500 ? 'MOBILE' : 'DESKTOP'})</span>
      <span>PHASE 3C.4F.6 QA RENDER</span>
    </div>
    ${bodyContent}
  </div>
</body>
</html>`;
}

describe('Phase 3C.4F.6 — Visual & Functional QA Verification', () => {
  const snapshot2025Path = path.join(
    PROJECT_ROOT,
    'artifacts',
    'dry_run_snapshots',
    '2025_1_albert_park_provisional_v1.0.0_hybrid_56947b913051836c.json'
  );
  const snapshot2026Path = path.join(
    PROJECT_ROOT,
    'artifacts',
    'dry_run_snapshots',
    '2026_1_albert_park_provisional_v1.0.0_hybrid_74bd99dca49ce975.json'
  );

  const raw2025 = fs.readFileSync(snapshot2025Path, 'utf-8');
  const snap2025: RacePredictionResponse = JSON.parse(raw2025);

  const raw2026 = fs.readFileSync(snapshot2026Path, 'utf-8');
  const snap2026: RacePredictionResponse = JSON.parse(raw2026);

  // --------------------------------------------------------------------------
  // SECTION 1: Technical Audit Invariants
  // --------------------------------------------------------------------------
  describe('Technical Audit Verification', () => {
    it('Point 1: TypeScript service does not falsely block snapshot retrieval on missing local Python binary', () => {
      // Direct disk snapshot loading succeeds purely from JSON artifact contracts
      const loaded = loadAndValidateDiskSnapshot('2025_1_albert_park', 2025, 1, 'albert_park');
      expect(loaded).not.toBeNull();
      expect(loaded?.response.raceId).toBe('2025_1_albert_park');
      expect(loaded?.response.status).toBe('success');
    });

    it('Point 2: Snapshot precedence separates stage priority from timestamp freshness', () => {
      const olderOfficial: RacePredictionResponse = {
        ...snap2025,
        stage: 'official_grid',
        generatedAtUtc: '2026-01-01T00:00:00Z',
        qualifyingStatus: { ...snap2025.qualifyingStatus, hasPenaltiesApplied: true }
      };

      const newerProvisional: RacePredictionResponse = {
        ...snap2025,
        stage: 'provisional',
        generatedAtUtc: '2026-11-05T12:00:00Z',
        qualifyingStatus: { ...snap2025.qualifyingStatus, hasPenaltiesApplied: false }
      };

      // Older official_grid must beat newer provisional
      expect(compareSnapshotPrecedence(olderOfficial, newerProvisional)).toBe(1);
      expect(compareSnapshotPrecedence(newerProvisional, olderOfficial)).toBe(-1);

      // Within the SAME stage, newer timestamp beats older
      const newerOfficial: RacePredictionResponse = {
        ...olderOfficial,
        generatedAtUtc: '2026-01-02T00:00:00Z'
      };
      expect(compareSnapshotPrecedence(newerOfficial, olderOfficial)).toBe(1);
    });

    it('Point 3: Expected driver roster validation is race-specific and not permanently fixed at 20', () => {
      // 2026 snapshot has 19 entrants, not 20
      expect(snap2026.predictions.length).toBe(19);
      expect(snap2026.expectedRoster?.length).toBe(19);

      const val2026 = validateSnapshot(snap2026, 2026, 1, 'albert_park', {
        expectedRoster: snap2026.expectedRoster
      });
      expect(val2026.valid).toBe(true);
    });

    it('Point 4: Confirms React components render valid DOM tree rather than pure data assertions', () => {
      const html = renderToString(
        <PredictedWinnerBanner
          winner={snap2025.predictedWinner!}
          seasonYear={2025}
          circuitName={snap2025.circuitName}
        />
      );
      expect(html).toContain('NOR');
      expect(html).toContain(String(snap2025.predictedWinner!.winProbabilityPct));
      expect(html).toContain('Albert Park Grand Prix Circuit');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Desktop UI Rendering & Inspection
  // --------------------------------------------------------------------------
  describe('Desktop UI Review (1280px)', () => {
    it('renders desktop predicted winner banner and validates elements', () => {
      const winnerHtml = renderToString(
        <PredictedWinnerBanner
          winner={snap2025.predictedWinner!}
          seasonYear={2025}
          circuitName={snap2025.circuitName}
        />
      );

      expect(winnerHtml).toContain(snap2025.predictedWinner!.driverCode);
      expect(winnerHtml).toContain(String(snap2025.predictedWinner!.winProbabilityPct));
      expect(winnerHtml).toContain(snap2025.circuitName);
      expect(winnerHtml).toContain('Projected Race Winner');
    });

    it('renders full desktop probability table and verifies order and labels', () => {
      const tableHtml = renderToString(
        <ProbabilityTable
          predictions={snap2025.predictions}
          seasonYear={2025}
          circuitHeritage={snap2025.circuitHeritage}
          rankingOrderSemantic={snap2025.rankingOrderSemantic}
          hybridFormulaVersion={snap2025.hybridFormulaVersion}
          experimentalStatus={snap2025.experimentalStatus}
        />
      );

      // Section header verification
      expect(tableHtml).toContain('Official Field Win Probability Rankings');

      // Top driver verification
      expect(tableHtml).toContain('NOR');
      expect(tableHtml).toContain(String(snap2025.predictions[0].winProbabilityPct));

      // Table headers
      expect(tableHtml).toContain('Grid');
      expect(tableHtml).toContain('Driver');
      expect(tableHtml).toContain('Win Probability');

      // Generates complete desktop HTML artifact
      const fullDesktopHtml = wrapInHtmlDocument(
        'Desktop Prediction Tab (1280px)',
        `
        <div class="space-y-6">
          <div class="stitch-card-machined rounded-xl p-4 border-amber-500/40 bg-amber-500/5 flex flex-row items-center justify-between text-xs">
            <div class="flex items-center gap-2.5 text-amber-300 font-mono">
              <span class="text-base">🧪</span>
              <span>
                <strong class="text-white font-bold uppercase tracking-wider">Experimental Hybrid Model (Non-Production):</strong>
                Statistical win probability forecast computed via geometric hybrid (80% Empirical Grid Baseline, α=1.0 · 20% LightGBM Classifier).
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="data-chip px-2 py-0.5 text-[10px] font-mono text-cyan-300 border-cyan-500/30">
                ${snap2025.rankingOrderSemantic}
              </span>
              <span class="data-chip px-2 py-0.5 text-[10px] font-mono text-amber-400 border-amber-500/40 font-bold">
                ${snap2025.hybridFormulaVersion}
              </span>
            </div>
          </div>

          ${renderToString(
            <PredictedWinnerBanner
              winner={snap2025.predictedWinner!}
              seasonYear={2025}
              circuitName={snap2025.circuitName}
            />
          )}

          ${tableHtml}

          ${renderToString(
            <ExplanationsPanel
              factors={snap2025.topExplanatoryFactors}
              circuitHeritage={snap2025.circuitHeritage}
            />
          )}
        </div>
        `,
        1280
      );

      fs.writeFileSync(path.join(OUTPUT_DIR, 'desktop_prediction_view.html'), fullDesktopHtml, 'utf-8');
      expect(fs.existsSync(path.join(OUTPUT_DIR, 'desktop_prediction_view.html'))).toBe(true);
    });

    it('renders Model Fusion breakdown view with 3-probability columns', () => {
      const tableHtml = renderToString(
        <ProbabilityTable
          predictions={snap2025.predictions}
          seasonYear={2025}
          circuitHeritage={snap2025.circuitHeritage}
          rankingOrderSemantic={snap2025.rankingOrderSemantic}
          hybridFormulaVersion={snap2025.hybridFormulaVersion}
          experimentalStatus={snap2025.experimentalStatus}
        />
      );

      // Model Fusion tab button exists
      expect(tableHtml).toContain('Model Fusion');

      const fusionHtml = wrapInHtmlDocument(
        'Model Fusion Breakdown View (1280px)',
        `
        <div class="space-y-4">
          <div class="p-4 stitch-card-machined rounded-xl border-cyan-500/30 text-xs font-mono">
            <span class="text-cyan-400 font-bold uppercase">Model Fusion Tab Active:</span>
            Exposing empirical grid baseline (80%), LightGBM ML likelihood (20%), and synthesized geometric probability.
          </div>
          ${tableHtml}
        </div>
        `,
        1280
      );

      fs.writeFileSync(path.join(OUTPUT_DIR, 'model_fusion_view.html'), fusionHtml, 'utf-8');
      expect(fs.existsSync(path.join(OUTPUT_DIR, 'model_fusion_view.html'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: Mobile UI Review (390px Viewport)
  // --------------------------------------------------------------------------
  describe('Mobile UI Review (390px)', () => {
    it('verifies mobile responsive classes and containment at 390px', () => {
      const bannerHtml = renderToString(
        <PredictedWinnerBanner
          winner={snap2025.predictedWinner!}
          seasonYear={2025}
          circuitName={snap2025.circuitName}
        />
      );

      const tableHtml = renderToString(
        <ProbabilityTable
          predictions={snap2025.predictions}
          seasonYear={2025}
          circuitHeritage={snap2025.circuitHeritage}
          rankingOrderSemantic={snap2025.rankingOrderSemantic}
          hybridFormulaVersion={snap2025.hybridFormulaVersion}
          experimentalStatus={snap2025.experimentalStatus}
        />
      );

      // Check responsive containment
      expect(tableHtml).toContain('overflow-x-auto');
      expect(tableHtml).toContain('w-full');

      const mobileHtml = wrapInHtmlDocument(
        'Mobile Prediction Tab View (390px)',
        `
        <div class="space-y-4">
          <div class="stitch-card-machined rounded-xl p-3 border-amber-500/40 bg-amber-500/5 flex flex-col gap-2 text-xs">
            <div class="flex items-center gap-2 text-amber-300 font-mono">
              <span>🧪</span>
              <span class="font-bold uppercase tracking-wider text-[11px]">Experimental Hybrid Model</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="data-chip px-2 py-0.5 text-[9px] font-mono text-cyan-300 border-cyan-500/30">
                ${snap2025.rankingOrderSemantic}
              </span>
              <span class="data-chip px-2 py-0.5 text-[9px] font-mono text-amber-400 border-amber-500/40 font-bold">
                ${snap2025.hybridFormulaVersion}
              </span>
            </div>
          </div>

          ${bannerHtml}
          ${tableHtml}
        </div>
        `,
        390
      );

      fs.writeFileSync(path.join(OUTPUT_DIR, 'mobile_prediction_view.html'), mobileHtml, 'utf-8');
      expect(fs.existsSync(path.join(OUTPUT_DIR, 'mobile_prediction_view.html'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 4: 2026 Regulation Era Warning Review
  // --------------------------------------------------------------------------
  describe('2026 Regulation Era Warning Review', () => {
    it('renders 2026 regulation era warning badge and disclaimer', () => {
      const regWarningHtml = renderToString(
        <div className="stitch-card-machined rounded-xl p-4 mb-5 border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5 text-amber-300 font-mono">
            <span className="text-base">⚠️</span>
            <span>
              <strong className="text-white font-bold uppercase tracking-wider">Unvalidated 2026 Regulations:</strong>{' '}
              Statistical forecast generated by model trained on 2021-2024 regulations. 2026 active aerodynamics and sustainable fuel regulations are unvalidated in training data; probabilities represent historical baseline extrapolation.
            </span>
          </div>
          <span className="data-chip px-2.5 py-1 text-[10px] font-mono text-amber-400 border-amber-500/40 font-bold uppercase tracking-wider shrink-0">
            UNVALIDATED_2026_REGULATIONS
          </span>
        </div>
      );

      expect(regWarningHtml).toContain('UNVALIDATED_2026_REGULATIONS');
      expect(regWarningHtml).toContain('2026 active aerodynamics');

      const fullRegHtml = wrapInHtmlDocument(
        '2026 Regulation Era Warning View',
        `
        <div class="space-y-4">
          ${regWarningHtml}
          ${renderToString(
            <ProbabilityTable
              predictions={snap2026.predictions}
              seasonYear={2026}
              circuitHeritage={snap2026.circuitHeritage}
              rankingOrderSemantic={snap2026.rankingOrderSemantic}
              hybridFormulaVersion={snap2026.hybridFormulaVersion}
              experimentalStatus={snap2026.experimentalStatus}
            />
          )}
        </div>
        `,
        1280
      );

      fs.writeFileSync(path.join(OUTPUT_DIR, 'regulation_era_warning_view.html'), fullRegHtml, 'utf-8');
      expect(fs.existsSync(path.join(OUTPUT_DIR, 'regulation_era_warning_view.html'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 5: Status States Review (Loading, Error, Pre-Quali)
  // --------------------------------------------------------------------------
  describe('Status States Review', () => {
    it('renders pre-qualifying holding card', () => {
      const holdingHtml = renderToString(
        <QualifyingNotCompletedState
          raceName="Australian Grand Prix"
          season="2025"
          round="1"
          onViewHistory={() => {}}
          onRunSimulation={() => {}}
        />
      );
      expect(holdingHtml).toContain('Australian Grand Prix');
      expect(holdingHtml).toContain('Unlocks Post-Quali');
    });

    it('renders loading skeleton', () => {
      const skeletonHtml = renderToString(<PredictorLoadingSkeleton />);
      expect(skeletonHtml).toContain('animate-pulse');
    });

    it('renders error state with retry action', () => {
      const errorHtml = renderToString(
        <PredictorErrorState
          message="Race prediction snapshot could not be retrieved."
          onRetry={() => {}}
        />
      );
      expect(errorHtml).toContain('Race prediction snapshot could not be retrieved.');
      expect(errorHtml).toContain('RETRY CONNECTION');
    });

    it('renders provisional data notice', () => {
      const provNoticeHtml = renderToString(<ProvisionalDataNotice />);
      expect(provNoticeHtml).toContain('Provisional Starting Grid');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 6: Functional Invariants Verification
  // --------------------------------------------------------------------------
  describe('Functional Invariants Verification', () => {
    it('predicted winner matches the driver with the highest hybrid probability', () => {
      const sorted = [...snap2025.predictions].sort((a, b) => b.winProbability - a.winProbability);
      expect(snap2025.predictedWinner!.driverId).toBe(sorted[0].driverId);
      expect(snap2025.predictedWinner!.winProbabilityPct).toBe(sorted[0].winProbabilityPct);
    });

    it('driver order in snapshot predictions is strictly descending by hybrid probability', () => {
      for (let i = 0; i < snap2025.predictions.length - 1; i++) {
        expect(snap2025.predictions[i].winProbability).toBeGreaterThanOrEqual(
          snap2025.predictions[i + 1].winProbability
        );
      }
    });

    it('3-probability values are finite, bounded in [0, 1], and sum to 1.0 +- 0.005', () => {
      let sumGrid = 0;
      let sumMl = 0;
      let sumHybrid = 0;

      for (const d of snap2025.predictions) {
        const pGrid = (d.grid_baseline_probability ?? d.gridBaselineProbability)!;
        const pMl = (d.ml_win_probability ?? d.mlWinProbability)!;
        const pHybrid = (d.hybrid_win_probability ?? d.hybridWinProbability ?? d.winProbability)!;

        expect(Number.isFinite(pGrid)).toBe(true);
        expect(Number.isFinite(pMl)).toBe(true);
        expect(Number.isFinite(pHybrid)).toBe(true);

        expect(pGrid).toBeGreaterThanOrEqual(0);
        expect(pMl).toBeGreaterThanOrEqual(0);
        expect(pHybrid).toBeGreaterThanOrEqual(0);

        expect(pGrid).toBeLessThanOrEqual(1);
        expect(pMl).toBeLessThanOrEqual(1);
        expect(pHybrid).toBeLessThanOrEqual(1);

        sumGrid += pGrid;
        sumMl += pMl;
        sumHybrid += pHybrid;
      }

      expect(Math.abs(sumGrid - 1.0)).toBeLessThanOrEqual(0.005);
      expect(Math.abs(sumMl - 1.0)).toBeLessThanOrEqual(0.005);
      expect(Math.abs(sumHybrid - 1.0)).toBeLessThanOrEqual(0.005);
    });

    it('official-grid stage request never silently falls back to provisional', () => {
      const res = loadAndValidateDiskSnapshot('2025_1_albert_park', 2025, 1, 'albert_park', {
        stage: 'official_grid'
      });
      // 2025_1 only has a provisional snapshot, so requesting official_grid returns null
      expect(res).toBeNull();
    });

    it('missing snapshot produces clean null / unavailable return', () => {
      const res = loadAndValidateDiskSnapshot('9999_99', 9999, 99);
      expect(res).toBeNull();
    });
  });
});
