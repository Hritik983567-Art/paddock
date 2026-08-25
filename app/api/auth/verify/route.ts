import { NextResponse } from 'next/server';
import { verifyJWT } from '../../../lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ valid: false, message: 'No token provided' }, { status: 400 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ valid: false, message: 'Token is invalid or expired' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      payload
    });
  } catch (error) {
    return NextResponse.json({ valid: false, message: 'Token verification failed' }, { status: 500 });
  }
}
