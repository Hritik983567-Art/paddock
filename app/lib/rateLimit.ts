/**
 * Server-Side Rate Limiter for Authentication Routes
 * Prevents brute-force credential stuffing and denial of service
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitStore>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, store] of ipMap.entries()) {
    if (now > store.resetTime) {
      ipMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 15 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record || now > record.resetTime) {
    ipMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}
