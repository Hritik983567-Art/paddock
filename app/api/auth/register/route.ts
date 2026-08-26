import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, team } = body;

    if (!email || !password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and a password of at least 4 characters.' },
        { status: 400 }
      );
    }

    const username = email.includes('@') ? email.split('@')[0] : email;
    const selectedTeam = team || 'Scuderia Ferrari / Paddock Telemetry';
    const fullName = name || username;

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: username,
      name: fullName,
      email: email,
      role: 'Registered Telemetry Analyst',
      team: selectedTeam,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours
    };

    const token = await signJWT(payload);

    return NextResponse.json({
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
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Registration server error. Please try again.' },
      { status: 500 }
    );
  }
}
