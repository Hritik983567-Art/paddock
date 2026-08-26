import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check (P-05)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000); // Max 5 registration attempts per 15 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many registration requests from this IP. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, team } = body;

    if (!email || !password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and password of at least 4 characters.' },
        { status: 400 }
      );
    }

    const username = email.includes('@') ? email.split('@')[0] : email;
    const selectedTeam = team || 'Scuderia Ferrari / Paddock Telemetry';
    const fullName = name || username;

    const now = Math.floor(Date.now() / 1000);
    const expTime = now + (24 * 60 * 60);

    const payload = {
      sub: username,
      name: fullName,
      email: email,
      role: 'Registered Telemetry Analyst',
      team: selectedTeam,
      iat: now,
      exp: expTime
    };

    const token = await signJWT(payload);

    // Set HttpOnly, Secure, SameSite=Lax Cookie (P-04)
    const response = NextResponse.json({
      success: true,
      token,
      message: 'Account created successfully! Welcome to Paddock Telemetry.',
      user: {
        username,
        name: fullName,
        email,
        role: payload.role,
        team: selectedTeam,
        expiresAt: payload.exp
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
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Registration server error. Please try again.' },
      { status: 500 }
    );
  }
}
