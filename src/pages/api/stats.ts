export const prerender = false;

import type { APIRoute } from 'astro';
import { kvIncrement, kvGetCounter, kvGet, kvSet } from '../../lib/kv';

const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin request
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'praniti.or.id' ||
      host.endsWith('.praniti.or.id') ||
      host.endsWith('.pages.dev')
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = (origin && isOriginAllowed(origin)) ? origin : 'https://ejournal.praniti.or.id';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get('origin');
  const secFetchSite = request.headers.get('sec-fetch-site');

  // Tolak permintaan cross-site tanpa izin
  if (secFetchSite === 'cross-site' || !isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak' }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, slug } = body;

    // 1. Validasi format parameter slug
    if (!slug || typeof slug !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug artikel tidak valid' }), {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (action !== 'track_view' && action !== 'track_download') {
      return new Response(JSON.stringify({ error: 'Aksi tidak valid' }), {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    // 2. Server-side validation: Verifikasi eksistensi artikel di database pencegah IDOR & spam state
    const d1 = (locals as any)?.runtime?.env?.DB;
    if (d1) {
      try {
        const articleExists = await d1.prepare('SELECT id FROM journal_articles WHERE slug = ? LIMIT 1').bind(slug).first();
        if (!articleExists) {
          return new Response(JSON.stringify({ error: 'Artikel tidak ditemukan' }), {
            status: 404,
            headers: getCorsHeaders(origin),
          });
        }
      } catch (dbErr) {
        console.error('Error verifying article slug:', dbErr);
      }
    }

    const kv = (locals as any)?.runtime?.env?.KV;

    // Rate Limiting sederhana per IP & slug (cooldown 15 detik) untuk mencegah abuse / data spamming
    const clientIp = request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'anonymous';

    const rateKey = `ratelimit:${clientIp}:${action}:${slug}`;
    const isLimited = await kvGet(rateKey, kv);

    if (isLimited) {
      // Kembalikan sukses tanpa menaikkan counter untuk meredam spam
      return new Response(JSON.stringify({ success: true, rateLimited: true }), {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    // Pasang cooldown 15 detik
    await kvSet(rateKey, { t: Date.now() }, 15, kv);

    if (action === 'track_view') {
      const views = await kvIncrement(`stats:views:${slug}`, 1, kv);
      return new Response(JSON.stringify({ success: true, views }), {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    if (action === 'track_download') {
      const downloads = await kvIncrement(`stats:downloads:${slug}`, 1, kv);
      return new Response(JSON.stringify({ success: true, downloads }), {
        status: 200,
        headers: getCorsHeaders(origin),
      });
    }

    return new Response(JSON.stringify({ error: 'Aksi tidak dikenali' }), {
      status: 400,
      headers: getCorsHeaders(origin),
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Kesalahan server' }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
};

export const GET: APIRoute = async ({ request, url, locals }) => {
  const origin = request.headers.get('origin');
  if (origin && !isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak' }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  const slug = url.searchParams.get('slug');

  if (!slug || typeof slug !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'Slug artikel tidak valid' }), {
      status: 400,
      headers: getCorsHeaders(origin),
    });
  }

  const kv = (locals as any)?.runtime?.env?.KV;
  const views = await kvGetCounter(`stats:views:${slug}`, 350, kv);
  const downloads = await kvGetCounter(`stats:downloads:${slug}`, 120, kv);

  return new Response(JSON.stringify({ views, downloads }), {
    status: 200,
    headers: getCorsHeaders(origin),
  });
};
