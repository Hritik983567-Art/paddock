-- Migration: 20261021_001_create_race_prediction_snapshots.sql
-- Description: Non-destructive addition of immutable prediction snapshots table for Paddock Race Predictor.

CREATE TABLE IF NOT EXISTS public.race_prediction_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id TEXT NOT NULL,
    season INTEGER NOT NULL,
    round INTEGER NOT NULL,
    circuit_id TEXT NOT NULL,
    circuit_name TEXT NOT NULL,
    prediction_stage TEXT NOT NULL DEFAULT 'after_qualifying',
    model_version TEXT NOT NULL,
    feature_schema_version TEXT NOT NULL,
    input_hash TEXT NOT NULL,
    qualifying_status TEXT NOT NULL DEFAULT 'completed',
    status TEXT NOT NULL DEFAULT 'success',
    predicted_winner_id TEXT,
    predicted_winner_code TEXT,
    predicted_winner_prob NUMERIC(7, 4),
    predictions_payload JSONB NOT NULL,
    explanatory_factors JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_race_prediction_snapshot UNIQUE (race_id, model_version, input_hash)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.race_prediction_snapshots ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone (authenticated engineers and public analysts) can read immutable predictions
CREATE POLICY "Public read access for race prediction snapshots."
    ON public.race_prediction_snapshots FOR SELECT
    USING (true);

-- Insert policy: Only server / service-role can insert predictions
CREATE POLICY "Service role insert for race prediction snapshots."
    ON public.race_prediction_snapshots FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'postgres');

-- Immutability guard: Updates and deletes are disallowed to preserve historical integrity
CREATE POLICY "Prevent updates to immutable race prediction snapshots."
    ON public.race_prediction_snapshots FOR UPDATE
    USING (false);

CREATE POLICY "Prevent deletions of historical race prediction snapshots."
    ON public.race_prediction_snapshots FOR DELETE
    USING (false);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_race_pred_snapshots_race_id ON public.race_prediction_snapshots(race_id);
CREATE INDEX IF NOT EXISTS idx_race_pred_snapshots_season_round ON public.race_prediction_snapshots(season, round);
CREATE INDEX IF NOT EXISTS idx_race_pred_snapshots_lookup ON public.race_prediction_snapshots(race_id, model_version, input_hash);

-- Explicit Data API Grants (Supabase PostgREST 2026 / October 30+ Requirement)
GRANT SELECT ON TABLE public.race_prediction_snapshots TO anon;
GRANT SELECT ON TABLE public.race_prediction_snapshots TO authenticated;
GRANT ALL ON TABLE public.race_prediction_snapshots TO service_role;

