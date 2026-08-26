import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export interface SupabaseUserProfile {
  id: string;
  email: string;
  full_name: string;
  preferred_team: string;
  role: string;
  created_at: string;
}

export interface SavedTelemetryPreset {
  id: string;
  user_id: string;
  preset_name: string;
  circuit_id: string;
  driver_1: string;
  driver_2: string;
  created_at: string;
}
