export const prerender = false;

import type { APIRoute } from 'astro';
import { getDbAdminPin, setDbAdminPin, getDbAdminUsername, setDbAdminUsername } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = (locals as any)?.runtime?.env?.KV;
    const body = await request.json();
    const { action, username, pin, currentPin, newPin, newUsername } = body;

    const storedPin = await getDbAdminPin(kv);
    const storedUsername = await getDbAdminUsername(kv);

    if (action === 'verify') {
      const inputUser = (username || '').trim().toLowerCase();
      const validUser = inputUser === storedUsername.toLowerCase() || inputUser === 'admin' || inputUser === 'redaksi';
      const validPin = pin && pin === storedPin;

      if (validUser && validPin) {
        return new Response(JSON.stringify({ success: true, username: storedUsername }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const errorMsg = !validUser && !validPin
          ? 'Nama pengguna dan kata sandi / PIN salah.'
          : !validUser
            ? 'Nama pengguna tidak ditemukan.'
            : 'Kata sandi / PIN salah. Silakan coba lagi.';
        return new Response(JSON.stringify({ success: false, error: errorMsg }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'change_pin' || action === 'change_credentials') {
      if (!currentPin) {
        return new Response(JSON.stringify({ success: false, error: 'PIN / Kata sandi saat ini wajib diisi.' }), {
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

      if (newPin) {
        if (newPin.trim().length < 4) {
          return new Response(JSON.stringify({ success: false, error: 'PIN baru minimal 4 karakter.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        await setDbAdminPin(newPin.trim(), kv);
      }

      if (newUsername && newUsername.trim()) {
        if (newUsername.trim().length < 3) {
          return new Response(JSON.stringify({ success: false, error: 'Nama pengguna baru minimal 3 karakter.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        await setDbAdminUsername(newUsername.trim(), kv);
      }

      return new Response(JSON.stringify({ success: true, message: 'Kredensial login Admin berhasil diperbarui!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid.' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
