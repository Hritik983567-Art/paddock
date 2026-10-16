import { signJWT, verifyJWT } from '../app/lib/jwt';
import { describe, it, expect } from 'vitest';

describe('JWT Utility', () => {
  it('should sign and verify valid JWT token', async () => {
    process.env.JWT_SECRET = 'test-secret-key-32-chars-long-security';
    const payload = { userId: 'usr_123', role: 'admin' };
    const token = await signJWT(payload);
    
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = await verifyJWT(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('usr_123');
    expect(decoded?.role).toBe('admin');
  });

  it('should reject invalid JWT token', async () => {
    process.env.JWT_SECRET = 'test-secret-key-32-chars-long-security';
    const invalidToken = 'invalid.jwt.token';
    const decoded = await verifyJWT(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should reject expired JWT token', async () => {
    process.env.JWT_SECRET = 'test-secret-key-32-chars-long-security';
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // expired 1 hour ago
    const expiredToken = await signJWT({ userId: 'usr_exp', exp: pastExp });
    const decoded = await verifyJWT(expiredToken);
    expect(decoded).toBeNull();
  });

  it('should reject tampered token signature', async () => {
    process.env.JWT_SECRET = 'test-secret-key-32-chars-long-security';
    const token = await signJWT({ userId: 'usr_valid' });
    const parts = token.split('.');
    // Tamper with payload
    const tampered = `${parts[0]}.${Buffer.from('{"userId":"attacker"}').toString('base64url')}.${parts[2]}`;
    const decoded = await verifyJWT(tampered);
    expect(decoded).toBeNull();
  });
});
