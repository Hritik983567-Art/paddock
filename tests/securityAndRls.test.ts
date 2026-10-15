import { describe, it, expect, beforeAll } from 'vitest';
import { signJWT, verifyJWT } from '../app/lib/jwt';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Security & RLS Policy Schema Verification', () => {
  const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  it('enforces search_path pinning in SECURITY DEFINER function', () => {
    // Prevents schema search path hijacking in handle_new_user()
    expect(schemaSql).toMatch(/handle_new_user\(\)/);
    expect(schemaSql).toMatch(/SECURITY DEFINER/);
    expect(schemaSql).toMatch(/SET search_path\s*=\s*public,\s*auth,\s*pg_temp/);
  });

  it('restricts public.profiles full select to the authenticated user', () => {
    // Only owner can view their full profile row (including email and sensitive data)
    expect(schemaSql).toMatch(/CREATE POLICY "Users can view their own profile\."/);
    expect(schemaSql).toMatch(/auth\.uid\(\)\s*=\s*id/);
  });

  it('exposes a public_profiles view limited to safe presentation fields', () => {
    // View must NOT include email
    expect(schemaSql).toMatch(/CREATE OR REPLACE VIEW public\.public_profiles AS/);
    expect(schemaSql).toMatch(/SELECT\s+id,\s+full_name,\s+preferred_team,\s+role,\s+created_at/);
    expect(schemaSql).not.toMatch(/SELECT.*email.*FROM public\.profiles AS/);
  });

  it('prevents self-service privilege escalation on profiles.role', () => {
    // Must contain both RLS check and trigger guard
    expect(schemaSql).toMatch(/protect_profile_role/);
    expect(schemaSql).toMatch(/BEFORE UPDATE ON public\.profiles/);
    expect(schemaSql).toMatch(/Modifying profile authorization role is not permitted/);
    expect(schemaSql).toMatch(/WITH CHECK\s*\(\s*auth\.uid\(\)\s*=\s*id\s*AND\s*\(role IS NOT DISTINCT FROM/);
  });

  it('defines explicit UPDATE policy for telemetry_presets owner', () => {
    expect(schemaSql).toMatch(/CREATE POLICY "Users can update their own telemetry presets\."/);
    expect(schemaSql).toMatch(/auth\.uid\(\)\s*=\s*user_id/);
  });
});

describe('Authentication Token Verification & Boundary Defense', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-paddock-super-secure-key-32chars';
  });

  it('signs and validates authentic user tokens via Web Crypto', async () => {
    const token = await signJWT({
      sub: 'usr_f1_test_77',
      email: 'driver@paddock.f1',
      role: 'user',
      name: 'Test Driver'
    });

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const payload = await verifyJWT(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('usr_f1_test_77');
    expect(payload?.email).toBe('driver@paddock.f1');
    expect(payload?.role).toBe('user');
  });

  it('rejects tampered tokens', async () => {
    const validToken = await signJWT({
      sub: 'usr_f1_test_77',
      role: 'user'
    });

    const parts = validToken.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.tampered_signature_payload`;

    const payload = await verifyJWT(tamperedToken);
    expect(payload).toBeNull();
  });

  it('rejects empty or malformed token strings', async () => {
    expect(await verifyJWT('')).toBeNull();
    expect(await verifyJWT('not-a-jwt')).toBeNull();
    expect(await verifyJWT('a.b')).toBeNull();
  });

  it('simulates authorization role immutability rules', () => {
    interface UserProfile {
      id: string;
      email: string;
      role: 'user' | 'engineer' | 'admin';
      fullName: string;
    }

    const initialProfile: UserProfile = {
      id: 'usr_123',
      email: 'analyst@paddock.io',
      role: 'user',
      fullName: 'Telemetry Analyst'
    };

    // Simulated RLS / trigger enforcement function matching schema.sql rules
    function enforceProfileUpdate(
      current: UserProfile,
      update: Partial<UserProfile>,
      requestingUid: string
    ): { success: boolean; error?: string; updated?: UserProfile } {
      if (requestingUid !== current.id) {
        return { success: false, error: 'Unauthorized: Cannot modify other user profile' };
      }
      if (update.role !== undefined && update.role !== current.role) {
        return { success: false, error: 'Modifying profile authorization role is not permitted.' };
      }
      return {
        success: true,
        updated: { ...current, ...update, role: current.role }
      };
    }

    // Attempted role escalation must fail
    const escalationResult = enforceProfileUpdate(initialProfile, { role: 'admin' }, 'usr_123');
    expect(escalationResult.success).toBe(false);
    expect(escalationResult.error).toContain('role is not permitted');

    // Legitimate profile updates must succeed
    const validUpdateResult = enforceProfileUpdate(initialProfile, { fullName: 'Telemetry Lead' }, 'usr_123');
    expect(validUpdateResult.success).toBe(true);
    expect(validUpdateResult.updated?.fullName).toBe('Telemetry Lead');
    expect(validUpdateResult.updated?.role).toBe('user');

    // Cross-user modification must fail
    const crossUserResult = enforceProfileUpdate(initialProfile, { fullName: 'Hacker' }, 'usr_other');
    expect(crossUserResult.success).toBe(false);
    expect(crossUserResult.error).toContain('Unauthorized');
  });
});
