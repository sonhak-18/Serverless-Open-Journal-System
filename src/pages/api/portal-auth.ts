export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbPortalAdminCredentials, setDbPortalAdminCredentials } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = (locals as any)?.runtime?.env?.KV;
    const body = await request.json();
    const { action, username, pin, currentPin, newUsername, newPin } = body;

    const creds = await getDbPortalAdminCredentials(kv);

    if (action === 'verify') {
      const inputUser = (username || '').trim().toLowerCase();
      const validUser = inputUser === creds.username.toLowerCase();
      const validPin = pin && pin === creds.pin;

      if (validUser && validPin) {
        const sessionId = crypto.randomUUID();
        return new Response(JSON.stringify({ success: true, username: creds.username }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `praniti_portal_session=${sessionId}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`,
          },
        });
      } else {
        const errorMsg = !validUser && !validPin
          ? 'Nama pengguna dan kata sandi salah.'
          : !validUser
            ? 'Nama pengguna tidak terdaftar.'
            : 'Kata sandi / PIN salah.';
        return new Response(JSON.stringify({ success: false, error: errorMsg }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'logout') {
      return new Response(JSON.stringify({ success: true, message: 'Berhasil keluar dari admin portal.' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'praniti_portal_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict; Max-Age=0',
        },
      });
    }

    if (action === 'change_credentials') {
      if (!currentPin) {
        return new Response(JSON.stringify({ success: false, error: 'Password / PIN saat ini wajib diisi.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (currentPin !== creds.pin) {
        return new Response(JSON.stringify({ success: false, error: 'Password / PIN saat ini tidak sesuai.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const targetUsername = (newUsername || creds.username).trim();
      const targetPin = (newPin || creds.pin).trim();

      if (!targetPin || targetPin.length < 6) {
        return new Response(JSON.stringify({ success: false, error: 'Password baru minimal harus 6 karakter.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await setDbPortalAdminCredentials(targetUsername, targetPin, kv);

      return new Response(JSON.stringify({
        success: true,
        message: 'Kredensial admin portal berhasil diperbarui.',
        username: targetUsername
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Aksi tidak dikenali.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Terjadi kesalahan server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
