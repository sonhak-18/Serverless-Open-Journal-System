export const prerender = false;

import type { APIRoute } from 'astro';
import { updateDbIndexingPlatform, addDbIndexingPlatform, deleteDbIndexingPlatform, getDbIndexing } from '../../lib/db';
import { invalidateJournalCache } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const body = await request.json();
    const { action, name, category, status, description, showInSidebar, url, iconUrl } = body;

    if (action === 'add') {
      if (!name || !url) {
        return new Response(JSON.stringify({ success: false, error: 'Nama pengindeks dan tautan URL wajib diisi' }), { status: 400 });
      }
      await addDbIndexingPlatform({
        name,
        category,
        url,
        status,
        description,
        showInSidebar: showInSidebar !== undefined ? Boolean(showInSidebar) : true,
        iconUrl,
      }, d1);
    } else if (action === 'delete') {
      if (!name) {
        return new Response(JSON.stringify({ success: false, error: 'Nama pengindeks diperlukan untuk menghapus' }), { status: 400 });
      }
      await deleteDbIndexingPlatform(name, d1);
    } else {
      // Default: update
      if (!name) {
        return new Response(JSON.stringify({ success: false, error: 'Nama pengindeks diperlukan' }), { status: 400 });
      }
      await updateDbIndexingPlatform({
        name,
        url,
        showInSidebar: showInSidebar !== undefined ? Boolean(showInSidebar) : undefined,
        iconUrl,
      }, d1);
    }

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
