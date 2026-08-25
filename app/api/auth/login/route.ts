import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate Credentials
    const isValid = 
      (username === 'admin' && password === 'paddock2026') ||
      (username === 'engineer' && password === 'telemetry2026') ||
      (username && password && password.length >= 4);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid paddock credentials.' },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: username,
      role: username === 'admin' ? 'Chief Race Engineer' : 'Telemetry Analyst',
      team: 'Scuderia Ferrari / Paddock Pit-Wall',
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours expiration
    };

    const token = await signJWT(payload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        username,
        role: payload.role,
        team: payload.team,
        expiresAt: payload.exp
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication server error' },
      { status: 500 }
    );
  }
}
