/**
 * Zero-dependency Web Crypto JWT Utility for Next.js
 * HMAC-SHA256 Signing and Verification
 */

const JWT_SECRET = process.env.JWT_SECRET || 'paddock-f1-telemetry-secret-key-2026';

export async function signJWT(payload: Record<string, any>, secret: string = JWT_SECRET): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const base64UrlEncode = (data: string | Uint8Array) => {
    const base64 = typeof data === 'string' 
      ? Buffer.from(data, 'utf-8').toString('base64')
      : Buffer.from(data).toString('base64');
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const tokenData = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(tokenData)
  );

  const sigB64 = base64UrlEncode(new Uint8Array(signature));
  return `${tokenData}.${sigB64}`;
}

export async function verifyJWT(token: string, secret: string = JWT_SECRET): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const tokenData = `${headerB64}.${payloadB64}`;

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      return Buffer.from(base64, 'base64');
    };

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sig = base64UrlDecode(sigB64);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sig,
      new TextEncoder().encode(tokenData)
    );

    if (!valid) return null;

    const payloadJson = base64UrlDecode(payloadB64).toString('utf-8');
    const payload = JSON.parse(payloadJson);

    // Check Expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
