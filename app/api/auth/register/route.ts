import { NextResponse } from 'next/server';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many registration requests from this IP. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email and password of at least 6 characters.' },
        { status: 400 }
      );
    }

    // Success response without issuing session cookie prior to email confirmation
    return NextResponse.json({
      success: true,
      message: 'Account registered successfully. Please verify your email before logging in.'
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration server error. Please try again.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
