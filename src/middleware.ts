import { defineMiddleware } from 'astro:middleware';
import { setGlobalD1 } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  const d1 = (context.locals as any)?.runtime?.env?.DB;
  if (d1) {
    setGlobalD1(d1);
  }

  const pathname = context.url.pathname;

  // Normalisasi rute OJS dan case-insensitivity tanpa cache permanen
  if (pathname.startsWith('/index.php/JTEBA') || pathname.startsWith('/index.php/jteba')) {
    const sub = pathname.replace(/^\/index\.php\/(JTEBA|jteba)/i, '');
    return context.redirect(`/index/journal${sub}`, 302);
  }

  if (pathname.startsWith('/index/journal/')) {
    const sub = pathname.replace(/^\/index\/jteba/i, '');
    return context.redirect(`/index/journal${sub}`, 302);
  }

  if (pathname === '/index/journal') {
    return context.redirect('/index/journal', 302);
  }

  if (pathname === '/index' || pathname === '/index/') {
    return context.redirect('/', 302);
  }

  // Normalisasi rute Home / Index di dalam jurnal JTEBA
  if (
    pathname === '/index/journal/home' ||
    pathname === '/index/journal/home/' ||
    pathname === '/index/journal/index' ||
    pathname === '/index/journal/index/'
  ) {
    return context.redirect('/index/journal', 302);
  }

  // Normalisasi sub-rute OJS 3 standar ke rute modern
  if (pathname.startsWith('/index/journal/issue/current')) {
    return context.redirect('/index/journal/current', 302);
  }
  if (pathname.startsWith('/index/journal/issue/archive')) {
    return context.redirect('/index/journal/archives', 302);
  }
  if (pathname.startsWith('/index/journal/about/submissions') || pathname.startsWith('/index/journal/information/authors')) {
    return context.redirect('/index/journal/guidelines', 302);
  }
  if (pathname.startsWith('/index/journal/about/editorialTeam')) {
    return context.redirect('/index/journal/editorial-team', 302);
  }
  if (pathname.startsWith('/index/journal/article/view/')) {
    const rawSlug = pathname.replace('/index/journal/article/view/', '');
    const cleanSlug = encodeURIComponent(rawSlug.replace(/[^a-zA-Z0-9_-]/g, ''));
    if (!cleanSlug) {
      return context.redirect('/index/journal', 302);
    }
    return context.redirect(`/index/journal/article/${cleanSlug}`, 302);
  }

  const response = await next();

  const contentType = response.headers.get('Content-Type') || '';

  // Pastikan browser dan Cloudflare Edge CDN tidak meng-cache dokumen HTML atau redirect lama
  if (
    response.status === 301 ||
    response.status === 302 ||
    contentType.includes('text/html')
  ) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-cache, no-store, max-age=0');
    response.headers.set('CDN-Cache-Control', 'no-cache, no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // 1. Prevent Information Leakage (Remove backend disclosures)
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // 2. Strict Security Headers Enforcement (A+ Grade Baseline)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://cloudflareinsights.com; object-src 'none'; frame-ancestors 'none';"
  );

  return response;
});
