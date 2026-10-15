-- PADDOCK ANALYTICS SUPABASE POSTGRESQL SCHEMA
-- Enterprise-hardened RLS, Engineer Profiles, Telemetry Presets, and Role Guards

-- 1. Profiles Table (Engineer Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    preferred_team TEXT DEFAULT 'Scuderia Ferrari / Paddock Telemetry',
    role TEXT DEFAULT 'Registered Telemetry Analyst',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
-- Users can view their own full profile including email
CREATE POLICY "Users can view their own profile." 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Authenticated users can view public engineer directory
CREATE POLICY "Authenticated users can view engineer directory." 
    ON public.profiles FOR SELECT TO authenticated
    USING (true);

-- Users can insert their own profile upon registration
CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can update own profile, but cannot self-elevate the 'role' field
CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    );

-- Trigger to strictly guard role modifications against self-escalation
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND current_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'Modifying profile authorization role is not permitted.';
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_role();

-- Public view exposing only non-sensitive display fields for engineer profiles
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, preferred_team, role, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;


-- 2. Telemetry Presets Table (Saved Pit-Wall Strategy Sessions)
CREATE TABLE IF NOT EXISTS public.telemetry_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    preset_name TEXT NOT NULL,
    circuit_id TEXT NOT NULL,
    driver_1 TEXT NOT NULL,
    driver_2 TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Telemetry Presets
ALTER TABLE public.telemetry_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Telemetry Presets (Full CRUD for owner)
CREATE POLICY "Users can view their own telemetry presets." 
    ON public.telemetry_presets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telemetry presets." 
    ON public.telemetry_presets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telemetry presets." 
    ON public.telemetry_presets FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telemetry presets." 
    ON public.telemetry_presets FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_telemetry_presets_user_id ON public.telemetry_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_presets_circuit ON public.telemetry_presets(circuit_id);


-- 3. Trigger for Automatic User Creation from Supabase Auth
-- Hardened with explicit pinned search_path to prevent search-path injection
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_team)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'preferred_team', 'Scuderia Ferrari / Paddock Telemetry')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
