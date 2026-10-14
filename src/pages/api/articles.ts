export const prerender = false;

import type { APIRoute } from 'astro';
import { addDbArticle, deleteDbArticle, getDbArticles } from '../../lib/db';
import { invalidateJournalCache } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const body = await request.json();
    const { action } = body;

    if (action === 'add') {
      await addDbArticle(body.article, d1);
    } else if (action === 'delete') {
      await deleteDbArticle(body.slug, d1);
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid' }), { status: 400 });
    }

    await invalidateJournalCache(kv);

    const updated = await getDbArticles(d1);
    return new Response(JSON.stringify({ success: true, articles: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
