import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, signToken, buildAuthCookie, checkRateLimit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';

    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many attempts',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitResult.retryAfter) },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body?.password || typeof body.password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(body.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        {
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      );
    }

    const token = await signToken();
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', buildAuthCookie(token));
    return response;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
