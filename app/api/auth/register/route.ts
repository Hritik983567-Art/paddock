import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signJWT } from '../../../lib/jwt';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 15, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many registration requests from this IP. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, team } = body;
    const cleanEmail = (email || '').trim();

    if (!cleanEmail || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and password of at least 6 characters.' },
        { status: 400 }
      );
    }

    // 2. Supabase Admin auto-creation / auto-confirmation if service key is present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('placeholder')) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: name || cleanEmail.split('@')[0],
            team: team || 'Scuderia Ferrari / Paddock Telemetry'
          }
        });

        if (createError) {
          // If already registered, confirm email and update password
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = userList?.users?.find(
            u => u.email?.toLowerCase() === cleanEmail.toLowerCase()
          );
          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              email_confirm: true,
              password: password,
              user_metadata: {
                full_name: name || cleanEmail.split('@')[0],
                team: team || 'Scuderia Ferrari / Paddock Telemetry'
              }
            });
          }
        }
      } catch {
        // Fall back to issuing local session token
      }
    }

    // 3. Issue local JWT session cookie
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + (24 * 60 * 60);

    const payload = {
      sub: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'Paddock Verified Engineer',
      team: team || 'Scuderia Ferrari / Paddock Telemetry',
      iat: now,
      exp: expTime
    };

    const token = await signJWT(payload);

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Account registered and confirmed successfully.',
      user: {
        username: cleanEmail,
        name: payload.name,
        email: cleanEmail,
        role: payload.role,
        team: payload.team,
        expiresAt: payload.exp
      }
    });

    response.cookies.set('paddock_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration server error. Please try again.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
