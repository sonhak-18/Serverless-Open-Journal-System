export const prerender = false;

import type { APIRoute } from 'astro';
import { updateDbIndexingPlatform, getDbIndexing } from '../../lib/db';
import { invalidateJournalCache } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const body = await request.json();
    const { name, showInSidebar, url } = body;

    if (!name) {
      return new Response(JSON.stringify({ success: false, error: 'Nama pengindeks diperlukan' }), { status: 400 });
    }

    await updateDbIndexingPlatform({
      name,
      url,
      showInSidebar: showInSidebar !== undefined ? Boolean(showInSidebar) : undefined,
    }, d1);

    await invalidateJournalCache(kv);

    const updated = await getDbIndexing(d1);

    return new Response(JSON.stringify({ success: true, indexing: updated }), {
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
