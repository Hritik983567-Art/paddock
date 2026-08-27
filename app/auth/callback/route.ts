import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { signJWT } from '@/app/lib/jwt';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error_description || error || 'OAuth Failed')}`);
  }

  if (code) {
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(exchangeError.message || 'Failed to establish session')}`);
      }

      if (data?.user) {
        const email = data.user.email || '';
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];
        const picture = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || 'https://lh3.googleusercontent.com/a/default-user';

        const now = Math.floor(Date.now() / 1000);
        const expTime = now + (24 * 60 * 60);

        const payload = {
          sub: email,
          name: name,
          email: email,
          picture: picture,
          provider: 'google',
          role: 'Google OAuth Verified Engineer',
          team: 'Scuderia Ferrari / Paddock Telemetry',
          iat: now,
          exp: expTime
        };

        const token = await signJWT(payload);
        const response = NextResponse.redirect(origin);

        response.cookies.set({
          name: 'paddock_auth_token',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/'
        });

        return response;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to establish session';
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);
    }
  }

  // Success / Default: Redirect to home page with NO query parameters
  return NextResponse.redirect(origin);
}
