import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { signJWT } from '@/app/lib/jwt';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
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
        const redirectUrl = `${origin}${next.startsWith('/') ? next : '/' + next}`;
        const response = NextResponse.redirect(redirectUrl);

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
    } catch {
      // ignore
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=OAuthCallbackFailed`);
}
