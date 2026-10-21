import { NextRequest, NextResponse } from 'next/server';
import { getRacePrediction, parseAndValidateRaceId } from '../../../../lib/racePredictorService';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { verifyJWT } from '../../../../lib/jwt';

interface RouteContext {
  params: Promise<{
    raceId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Client IP & Rate Limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(`pred:${ip}`, 60, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: 'unavailable',
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please wait before requesting additional Grand Prix predictions.'
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    // 2. Authentication & Authorization Check (Optional / Guest-friendly with role auditing)
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieHeader = request.headers.get('cookie');
    let cookieToken: string | undefined;
    if (cookieHeader) {
      const match = cookieHeader.match(/paddock_auth_token=([^;]+)/);
      if (match) cookieToken = match[1];
    }
    const token = authHeader || cookieToken;
    let authUser: Record<string, unknown> | null = null;

    if (token) {
      authUser = await verifyJWT(token);
      if (!authUser) {
        return NextResponse.json(
          {
            status: 'unavailable',
            error: 'INVALID_TOKEN',
            message: 'Provided authentication token is invalid or expired.'
          },
          { status: 401 }
        );
      }
    }

    // 3. Resolve Route Parameters
    const params = await context.params;
    const rawRaceId = params.raceId;

    if (!rawRaceId) {
      return NextResponse.json(
        {
          status: 'unavailable',
          error: 'MISSING_RACE_ID',
          message: "Parameter 'raceId' is required in request path."
        },
        { status: 400 }
      );
    }

    // 4. Validate Race ID Format
    try {
      parseAndValidateRaceId(rawRaceId);
    } catch (validationErr: any) {
      return NextResponse.json(
        {
          status: 'unavailable',
          error: 'INVALID_RACE_ID',
          message: validationErr.message || 'Invalid raceId format.'
        },
        { status: 400 }
      );
    }

    // 5. Query Options
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 6. Execute Prediction Service
    const prediction = await getRacePrediction(rawRaceId, { forceRefresh });

    // Handle unavailable statuses (e.g. qualifying session not yet completed)
    if (prediction.status === 'unavailable') {
      const httpCode = prediction.error === 'MODEL_ARTIFACT_NOT_FOUND' ? 503 : 200;
      return NextResponse.json(prediction, {
        status: httpCode,
        headers: {
          'X-Prediction-Stage': 'after_qualifying',
          'X-Prediction-Status': prediction.status,
          'Cache-Control': 'no-store'
        }
      });
    }

    // 7. Successful Response with Cache Headers
    return NextResponse.json(prediction, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400'
      }
    });

  } catch (error: any) {
    const rawMsg = String(error?.message || '');
    const hasPathLeak = /[A-Za-z]:\\|\/Users\/|\/home\//i.test(rawMsg);
    const safeMessage = (rawMsg && !hasPathLeak) 
      ? rawMsg 
      : 'An unexpected error occurred while processing race predictions.';

    return NextResponse.json(
      {
        status: 'unavailable',
        error: 'INTERNAL_SERVER_ERROR',
        message: safeMessage
      },
      { status: 500 }
    );
  }
}
