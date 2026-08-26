-- PADDOCK ANALYTICS SUPABASE POSTGRESQL SCHEMA
-- Enable RLS and setup tables for Engineers, Telemetry Presets, and Strategy Notes

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
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);


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

-- RLS Policies for Telemetry Presets
CREATE POLICY "Users can view their own telemetry presets." 
    ON public.telemetry_presets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telemetry presets." 
    ON public.telemetry_presets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telemetry presets." 
    ON public.telemetry_presets FOR DELETE USING (auth.uid() = user_id);


-- 3. Trigger for Automatic User Creation from Supabase Auth
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
