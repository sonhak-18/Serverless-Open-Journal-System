export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbPortalSettings, updateDbPortalSettings } from '../../lib/db';
import { verifySession } from '../../lib/auth';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const settings = await getDbPortalSettings(d1);
    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Gagal memuat pengaturan portal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = (locals as any)?.runtime?.env?.KV;
    // Verifikasi sesi kriptografis / KV (bukan sekadar .includes('cookie='))
    const session = await verifySession(request, kv);

    if (!session) {
      return new Response(JSON.stringify({ success: false, error: 'Sesi kedaluwarsa atau tidak terotorisasi. Silakan login kembali.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const d1 = (locals as any)?.runtime?.env?.DB;
    const body = await request.json();

    const updated = await updateDbPortalSettings(body, d1);

    return new Response(JSON.stringify({ success: true, settings: updated, message: 'Pengaturan portal berhasil disimpan ke database.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Gagal menyimpan pengaturan portal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
