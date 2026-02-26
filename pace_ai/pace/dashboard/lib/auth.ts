import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getRedis } from './redis';

const COOKIE_NAME = 'pace-auth-token';
const RATE_LIMIT_PREFIX = 'pace:auth:ratelimit:';
const RATE_LIMIT_WINDOW = 900; // 15 minutes in seconds
const RATE_LIMIT_MAX = 5;

interface AuthPayload extends JWTPayload {
  sub: string;
  role: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error('AUTH_JWT_SECRET environment variable is required');
  return new TextEncoder().encode(secret);
}

function getSessionDuration(): string {
  return process.env.AUTH_SESSION_DURATION || '7d';
}

function getPasswordHash(): string {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) throw new Error('AUTH_PASSWORD_HASH environment variable is required');
  return hash;
}

// --- Password ---

export async function verifyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, getPasswordHash());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// --- JWT ---

export async function signToken(): Promise<string> {
  const duration = getSessionDuration();
  return new SignJWT({ sub: 'mav', role: 'owner' } satisfies AuthPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

// --- Session (Server Components / Route Handlers) ---

export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function buildAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Strict`,
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

// --- Rate Limiting (Redis sliding window) ---

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = `${RATE_LIMIT_PREFIX}${ip}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW * 1000;

  // Clean old entries and count current attempts
  await redis.zremrangebyscore(key, '-inf', windowStart);
  const currentCount = await redis.zcard(key);

  if (currentCount >= RATE_LIMIT_MAX) {
    const oldestAttempt = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const oldestTimestamp = oldestAttempt.length >= 2 ? parseInt(oldestAttempt[1], 10) : now;
    const retryAfter = Math.ceil((oldestTimestamp + RATE_LIMIT_WINDOW * 1000 - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(retryAfter, 1),
    };
  }

  // Record this attempt
  await redis.zadd(key, now, `${now}`);
  await redis.expire(key, RATE_LIMIT_WINDOW);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - currentCount - 1,
    retryAfter: 0,
  };
}

export { COOKIE_NAME };
