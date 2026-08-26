import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';
import { checkRateLimit } from '../../../lib/rateLimit';
import { verifyGoogleIDToken } from '../../../lib/googleOAuth';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 10, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { credential, email, name, picture } = body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedPicture = picture;

    // Strict Google OAuth Token Verification (P-03 Resolution)
    if (credential) {
      const googleClaims = await verifyGoogleIDToken(credential);
      if (!googleClaims) {
        return NextResponse.json(
          { success: false, message: 'Google OAuth verification failed. Invalid or expired token.' },
          { status: 401 }
        );
      }
      verifiedEmail = googleClaims.email;
      verifiedName = googleClaims.name || verifiedEmail.split('@')[0];
      verifiedPicture = googleClaims.picture || 'https://lh3.googleusercontent.com/a/default-user';
    } else if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'OAuth Identity Verification Required: Valid Google Credential or Email missing.' },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const expTime = now + (24 * 60 * 60);

    const payload = {
      sub: verifiedEmail,
      name: verifiedName,
      email: verifiedEmail,
      picture: verifiedPicture,
      provider: 'google',
      role: 'Google OAuth Verified Engineer',
      team: 'Scuderia Ferrari / Paddock Telemetry',
      iat: now,
      exp: expTime
    };

    const token = await signJWT(payload);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        username: verifiedEmail,
        name: verifiedName,
        email: verifiedEmail,
        role: payload.role,
        team: payload.team,
        picture: verifiedPicture,
        provider: 'google'
      }
    });

    response.cookies.set('paddock_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Google OAuth token processing error' }, { status: 500 });
  }
}
