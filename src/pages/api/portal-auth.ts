export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbPortalAdminCredentials, setDbPortalAdminCredentials } from '../../lib/db';
import {
  verifyPassword,
  hashPassword,
  createSession,
  destroySession,
  getSessionCookieHeaders,
  getClearSessionCookieHeaders,
  timingSafeEqualStr,
} from '../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = (locals as any)?.runtime?.env?.KV;
    const body = await request.json().catch(() => ({}));
    const { action, username, pin, currentPin, newUsername, newPin } = body;

    const creds = await getDbPortalAdminCredentials(kv);

    if (action === 'verify') {
      const inputUser = (username || '').trim().toLowerCase();
      const validUser = inputUser === creds.username.toLowerCase();
      const validPin = await verifyPassword(pin || '', creds.pin);

      if (validUser && validPin) {
        // Otomatis upgrade plaintext PIN ke PBKDF2 hash jika belum di-hash
        if (!creds.pin.startsWith('pbkdf2$')) {
          const newHashedPin = await hashPassword(pin);
          await setDbPortalAdminCredentials(creds.username, newHashedPin, kv);
        }

        const sessionId = await createSession(creds.username, 'portal_admin', kv);
        const cookieHeaders = getSessionCookieHeaders(sessionId, ['praniti_portal_session', 'jteba_session']);

        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        for (const [key, val] of cookieHeaders) {
          headers.append(key, val);
        }

        return new Response(JSON.stringify({ success: true, username: creds.username }), {
          status: 200,
          headers,
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
      await destroySession(request, kv);
      const clearHeaders = getClearSessionCookieHeaders(['praniti_portal_session', 'jteba_session']);
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      for (const [key, val] of clearHeaders) {
        headers.append(key, val);
      }

      return new Response(JSON.stringify({ success: true, message: 'Berhasil keluar dari admin portal.' }), {
        status: 200,
        headers,
      });
    }

    if (action === 'change_credentials') {
      if (!currentPin) {
        return new Response(JSON.stringify({ success: false, error: 'Password / PIN saat ini wajib diisi.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const isCurrentValid = await verifyPassword(currentPin, creds.pin);
      if (!isCurrentValid) {
        return new Response(JSON.stringify({ success: false, error: 'Password / PIN saat ini tidak sesuai.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const targetUsername = (newUsername || creds.username).trim();
      const rawTargetPin = (newPin || '').trim();

      let targetPinToStore = creds.pin;
      if (rawTargetPin) {
        if (rawTargetPin.length < 6) {
          return new Response(JSON.stringify({ success: false, error: 'Password baru minimal harus 6 karakter.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        targetPinToStore = await hashPassword(rawTargetPin);
      }

      await setDbPortalAdminCredentials(targetUsername, targetPinToStore, kv);

      return new Response(JSON.stringify({
        success: true,
        message: 'Kredensial admin portal berhasil diperbarui secara aman.',
        username: targetUsername,
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
