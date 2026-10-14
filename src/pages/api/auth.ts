export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbAdminPin, setDbAdminPin } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = (locals as any)?.runtime?.env?.KV;
    const body = await request.json();
    const { action, pin, currentPin, newPin } = body;

    const storedPin = await getDbAdminPin(kv);

    if (action === 'verify') {
      if (pin && pin === storedPin) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ success: false, error: 'Kata sandi / PIN salah. Silakan coba lagi.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'change_pin') {
      if (!currentPin || !newPin) {
        return new Response(JSON.stringify({ success: false, error: 'PIN saat ini dan PIN baru wajib diisi.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (currentPin !== storedPin) {
        return new Response(JSON.stringify({ success: false, error: 'PIN saat ini tidak cocok!' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (newPin.trim().length < 4) {
        return new Response(JSON.stringify({ success: false, error: 'PIN baru minimal 4 karakter.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await setDbAdminPin(newPin.trim(), kv);

      return new Response(JSON.stringify({ success: true, message: 'Kata sandi / PIN Admin berhasil diperbarui!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid.' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
