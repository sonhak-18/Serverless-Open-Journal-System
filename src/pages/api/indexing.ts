export const prerender = false;

import type { APIRoute } from 'astro';
import { toggleDbIndexingSidebar, getDbIndexing } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, showInSidebar } = body;

    await toggleDbIndexingSidebar(name, Boolean(showInSidebar));
    const updated = await getDbIndexing();

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
