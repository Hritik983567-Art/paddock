-- Migration: 20261021_002_postgrest_explicit_grants.sql
-- Description: Explicit Data API grants for public schema tables (Supabase October 30+ PostgREST Compliance)
-- Note: Row Level Security (RLS) continues to strictly enforce row-level access control on all tables.

-- 1. Profiles Table & Public View
GRANT SELECT ON public.public_profiles TO authenticated, anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2. Telemetry Presets Table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telemetry_presets TO authenticated;
GRANT ALL ON public.telemetry_presets TO service_role;

-- 3. Race Prediction Snapshots Table
GRANT SELECT ON public.race_prediction_snapshots TO anon;
GRANT SELECT ON public.race_prediction_snapshots TO authenticated;
GRANT ALL ON public.race_prediction_snapshots TO service_role;
