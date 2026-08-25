import { NextResponse } from 'next/server';
import { verifyJWT } from '../../../lib/jwt';

async function handleVerification(request: Request, tokenInput?: string) {
  try {
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieHeader = request.headers.get('cookie')?.split('paddock_auth_token=')[1]?.split(';')[0];
    const token = tokenInput || authHeader || cookieHeader;

    if (!token) {
      return NextResponse.json({ valid: false, authenticated: false, message: 'No token provided' }, { status: 200 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ valid: false, authenticated: false, message: 'Token is invalid or expired' }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      authenticated: true,
      payload
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ valid: false, authenticated: false, message: 'Token verification failed' }, { status: 200 });
  }
}

export async function GET(request: Request) {
  return handleVerification(request);
}

export async function POST(request: Request) {
  let tokenInput: string | undefined;
  try {
    const body = await request.json();
    tokenInput = body.token;
  } catch {
    // optional body
  }
  return handleVerification(request, tokenInput);
}
