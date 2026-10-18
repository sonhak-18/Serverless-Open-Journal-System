/**
 * Modul Keamanan & Autentikasi Terpadu (JTEBA & Praniti Portal)
 * Menggunakan Web Crypto API standar untuk hashing PBKDF2 dan verifikasi sesi.
 */

// In-memory fallback untuk local development tanpa binding Cloudflare KV
const memorySessions = new Map<string, { username: string; role: string; expiresAt: number }>();

/**
 * Parsing cookie header menjadi key-value object
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) {
        cookies[key] = decodeURIComponent(val);
      }
    }
  }
  return cookies;
}

/**
 * Perbandingan string waktu konstan (Constant-Time Equality) untuk mencegah timing attack
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/**
 * Hash password menggunakan PBKDF2 dengan salt kriptografis unik
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$100000$${saltHex}$${hashHex}`;
}

/**
 * Verifikasi password terhadap hash PBKDF2 atau legacy plaintext (kompatibilitas mundur aman)
 */
export async function verifyPassword(password: string, storedValue: string): Promise<boolean> {
  if (!password || !storedValue) return false;

  // Format PBKDF2: pbkdf2$<iterations>$<saltHex>$<hashHex>
  if (storedValue.startsWith('pbkdf2$')) {
    const parts = storedValue.split('$');
    if (parts.length !== 4) return false;
    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const targetHashHex = parts[3];

    const saltMatch = saltHex.match(/.{1,2}/g);
    if (!saltMatch) return false;
    const salt = new Uint8Array(saltMatch.map((byte) => parseInt(byte, 16)));

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: iterations || 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const derivedHashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqualStr(derivedHashHex, targetHashHex);
  }

  // Fallback untuk legacy plaintext (menggunakan constant-time comparison)
  return timingSafeEqualStr(password, storedValue);
}

/**
 * Buat sesi baru yang valid dan simpan ke Cloudflare KV / In-memory store
 */
export async function createSession(username: string, role: string = 'admin', kv?: any): Promise<string> {
  const sessionId = crypto.randomUUID();
  const sessionData = {
    username,
    role,
    createdAt: Date.now(),
  };

  if (kv) {
    try {
      // TTL 24 jam (86400 detik)
      await kv.put(`auth:session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 86400 });
    } catch (e) {
      console.warn('Gagal menyimpan sesi ke KV, beralih ke memori:', e);
    }
  }

  memorySessions.set(sessionId, {
    username,
    role,
    expiresAt: Date.now() + 86400 * 1000,
  });

  return sessionId;
}

/**
 * Verifikasi sesi dari header Cookie request
 */
export async function verifySession(
  request: Request,
  kv?: any
): Promise<{ username: string; role: string; sessionId: string } | null> {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies['jteba_session'] || cookies['praniti_portal_session'] || cookies['sektansia_session'];

  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 16) {
    return null;
  }

  // 1. Cek KV jika tersedia
  if (kv) {
    try {
      const dataStr = await kv.get(`auth:session:${sessionId}`);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && data.username) {
          return { username: data.username, role: data.role || 'admin', sessionId };
        }
      }
    } catch (_) {}
  }

  // 2. Cek memori sesi aktif
  const memSession = memorySessions.get(sessionId);
  if (memSession) {
    if (memSession.expiresAt > Date.now()) {
      return { username: memSession.username, role: memSession.role, sessionId };
    } else {
      memorySessions.delete(sessionId);
    }
  }

  return null;
}

/**
 * Hancurkan sesi saat logout
 */
export async function destroySession(request: Request, kv?: any): Promise<void> {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies['jteba_session'] || cookies['praniti_portal_session'] || cookies['sektansia_session'];

  if (sessionId) {
    memorySessions.delete(sessionId);
    if (kv) {
      try {
        await kv.delete(`auth:session:${sessionId}`);
      } catch (_) {}
    }
  }
}

/**
 * Header helper untuk Set-Cookie Sesi
 */
export function getSessionCookieHeaders(sessionId: string, cookieNames: string[] = ['jteba_session', 'sektansia_session', 'praniti_portal_session']): [string, string][] {
  const headers: [string, string][] = [];
  for (const name of cookieNames) {
    headers.push([
      'Set-Cookie',
      `${name}=${sessionId}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`,
    ]);
  }
  return headers;
}

/**
 * Header helper untuk menghapus cookie sesi saat logout
 */
export function getClearSessionCookieHeaders(cookieNames: string[] = ['jteba_session', 'sektansia_session', 'praniti_portal_session']): [string, string][] {
  const headers: [string, string][] = [];
  for (const name of cookieNames) {
    headers.push([
      'Set-Cookie',
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict; Max-Age=0`,
    ]);
  }
  return headers;
}
