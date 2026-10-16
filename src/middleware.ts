import { defineMiddleware } from 'astro:middleware';
import { setGlobalD1 } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  const d1 = (context.locals as any)?.runtime?.env?.DB;
  if (d1) {
    setGlobalD1(d1);
  }

  const response = await next();

  // 1. Prevent Information Leakage (Remove backend disclosures)
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // 2. Strict Security Headers Enforcement (A+ Grade Baseline)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: https://cloudflareinsights.com; object-src 'none'; frame-ancestors 'none';"
  );

  return response;
});
