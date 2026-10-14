export const prerender = false;

import type { APIRoute } from 'astro';
import { kvIncrement, kvGetCounter } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { action, slug } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug artikel diperlukan' }), { status: 400 });
    }

    const kv = (locals as any)?.runtime?.env?.KV;

    if (action === 'track_view') {
      const views = await kvIncrement(`stats:views:${slug}`, 1, kv);
      return new Response(JSON.stringify({ success: true, views }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'track_download') {
      const downloads = await kvIncrement(`stats:downloads:${slug}`, 1, kv);
      return new Response(JSON.stringify({ success: true, downloads }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Aksi tidak valid' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug diperlukan' }), { status: 400 });
  }

  const kv = (locals as any)?.runtime?.env?.KV;
  const views = await kvGetCounter(`stats:views:${slug}`, 350, kv);
  const downloads = await kvGetCounter(`stats:downloads:${slug}`, 120, kv);

  return new Response(JSON.stringify({ views, downloads }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
