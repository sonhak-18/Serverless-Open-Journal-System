export const prerender = false;

import type { APIRoute } from 'astro';
import { updateDbSettings, getDbSettings } from '../../lib/db';
import { invalidateJournalCache } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const data = await request.json();
    await updateDbSettings(data, d1);
    await invalidateJournalCache(kv);

    const updated = await getDbSettings(d1);
    return new Response(JSON.stringify({ success: true, settings: updated }), {
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
