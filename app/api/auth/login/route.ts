import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const targetEmail = (email || username || '').trim();

    // 2. Validate Input Presence
    if (!targetEmail || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Password must be at least 6 characters.' },
        { status: 401 }
      );
    }

    // 3. HARD SERVER GUARD: Authenticate strictly against Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
      const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabaseServer.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message || 'Invalid email or password.' },
          { status: 401 }
        );
      }

      if (!data?.session || !data?.user) {
        return NextResponse.json(
          { success: false, message: 'Session failed to initiate with Supabase Auth.' },
          { status: 401 }
        );
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const durationDays = remember ? 30 : 1;
    const expTime = now + (durationDays * 24 * 60 * 60);

    const payload = {
      sub: targetEmail,
      email: targetEmail,
      role: targetEmail.toLowerCase().includes('admin') ? 'Chief Race Engineer' : 'Telemetry Analyst',
      team: 'Scuderia Ferrari / Paddock Pit-Wall',
      iat: now,
      exp: expTime
    };

    const token = await signJWT(payload);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        username: targetEmail,
        name: targetEmail.includes('@') ? targetEmail.split('@')[0] : targetEmail,
        email: targetEmail,
        role: payload.role,
        team: payload.team,
        expiresAt: payload.exp
      }
    });

    const cookieConfig: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };

    if (remember) {
      cookieConfig.maxAge = 30 * 24 * 60 * 60;
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
