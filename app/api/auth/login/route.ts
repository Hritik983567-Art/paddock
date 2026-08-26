import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 10, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, email, password, remember } = body;
    const userInput = username || email || '';

    // 2. Validate Credentials
    if (!userInput || !password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials provided.' },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const durationDays = remember ? 30 : 1;
    const expTime = now + (durationDays * 24 * 60 * 60);

    const payload = {
      sub: userInput,
      role: userInput.toLowerCase().includes('admin') ? 'Chief Race Engineer' : 'Telemetry Analyst',
      team: 'Scuderia Ferrari / Paddock Pit-Wall',
      iat: now,
      exp: expTime
    };

    const token = await signJWT(payload);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        username: userInput,
        role: payload.role,
        team: payload.team,
        expiresAt: payload.exp
      }
    });

    // 3. Set HttpOnly Cookie (If remember === true, 30 days maxAge; if false, session cookie that clears on tab/browser close)
    const cookieConfig: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };

    if (remember) {
      cookieConfig.maxAge = 30 * 24 * 60 * 60; // 30 days persistent
    }

    response.cookies.set('paddock_auth_token', token, cookieConfig);

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication server error.' },
      { status: 500 }
    );
  }
}
