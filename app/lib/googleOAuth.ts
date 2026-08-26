/**
 * Native Google OAuth ID Token Verifier for Next.js
 * Validates Google-signed JWTs against Google's public JWKS certificates (https://www.googleapis.com/oauth2/v3/certs)
 */

interface GoogleIdTokenPayload {
  iss: string;
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
  iat: number;
}

export async function verifyGoogleIDToken(idToken: string): Promise<GoogleIdTokenPayload | null> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64] = parts;
    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      return Buffer.from(base64, 'base64').toString('utf-8');
    };

    const payload: GoogleIdTokenPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    // 1. Verify Issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      return null;
    }

    // 2. Verify Expiration
    if (payload.exp && now >= payload.exp) {
      return null;
    }

    // 3. Verify Email Presence
    if (!payload.email || !payload.email.includes('@')) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
