import { NextResponse } from 'next/server';
import { signJWT } from '../../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, picture, credential } = body;

    // Default or parsed Google Account profile
    const userEmail = email || 'f1.engineer@gmail.com';
    const userName = name || 'F1 Telemetry User';
    const userPicture = picture || 'https://lh3.googleusercontent.com/a/default-user';

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userEmail,
      name: userName,
      email: userEmail,
      picture: userPicture,
      provider: 'google',
      role: 'Google Authenticated Engineer',
      team: 'Scuderia Ferrari / Paddock Telemetry',
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours
    };

    const token = await signJWT(payload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        username: userEmail,
        name: userName,
        email: userEmail,
        role: payload.role,
        team: payload.team,
        picture: userPicture,
        provider: 'google'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Google Authentication failed' }, { status: 500 });
  }
}
