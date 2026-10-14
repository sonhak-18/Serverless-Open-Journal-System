export const prerender = false;

import type { APIRoute } from 'astro';
import { addDbArticle, deleteDbArticle, getDbArticles } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'add') {
      await addDbArticle(body.article);
    } else if (action === 'delete') {
      await deleteDbArticle(body.slug);
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid' }), { status: 400 });
    }

    const updated = await getDbArticles();
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
