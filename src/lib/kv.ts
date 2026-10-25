import { getDbSettings, getDbArticles, getDbEditorial, getDbIndexing, type SektansiaDatabase, type IndexingPlatform } from './db';
import type { JournalConfig } from '../config/journal';
import type { Article } from '../data/articles';

// Fallback in-memory cache untuk local dev atau saat KV belum dicolok
const localMemoryKv = new Map<string, { value: any; expiresAt: number }>();
const localCounters = new Map<string, number>();

/**
 * Baca dari Cloudflare KV (atau fallback memori lokal)
 */
export async function kvGet<T = any>(key: string, kv?: any): Promise<T | null> {
  if (kv) {
    try {
      const res = await kv.get(key, 'json');
      if (res !== null && res !== undefined) return res as T;
    } catch (e) {
      console.warn(`[KV] Gagal membaca key "${key}":`, e);
    }
  }

  // Fallback lokal
  const item = localMemoryKv.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    localMemoryKv.delete(key);
    return null;
  }
  return item.value as T;
}

/**
 * Simpan ke Cloudflare KV (atau fallback memori lokal)
 */
export async function kvSet(key: string, value: any, ttlSeconds = 86400, kv?: any): Promise<void> {
  if (kv) {
    try {
      await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
      return;
    } catch (e) {
      console.warn(`[KV] Gagal menulis key "${key}":`, e);
    }
  }

  // Fallback lokal
  localMemoryKv.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Hapus key dari KV (Cache Purge)
 */
export async function kvDelete(key: string, kv?: any): Promise<void> {
  if (kv) {
    try {
      await kv.delete(key);
    } catch (e) {
      console.warn(`[KV] Gagal menghapus key "${key}":`, e);
    }
  }
  localMemoryKv.delete(key);
}

/**
 * Increment Counter Real-time (Abstract Views & PDF Downloads)
 */
export async function kvIncrement(key: string, amount = 1, kv?: any): Promise<number> {
  if (kv) {
    try {
      const current = Number(await kv.get(key)) || 0;
      const next = current + amount;
      await kv.put(key, String(next));
      return next;
    } catch (e) {
      console.warn(`[KV] Gagal increment key "${key}":`, e);
    }
  }

  const current = localCounters.get(key) || 0;
  const next = current + amount;
  localCounters.set(key, next);
  return next;
}

export async function kvGetCounter(key: string, defaultValue = 0, kv?: any): Promise<number> {
  if (kv) {
    try {
      const val = await kv.get(key);
      if (val !== null) return Number(val) || defaultValue;
    } catch (e) {
      // fallback
    }
  }
  return localCounters.get(key) ?? defaultValue;
}

// Cache-aside pattern untuk data utama & micro-memoization per worker isolate
let memoSettings: { data: JournalConfig; exp: number } | null = null;
let memoArticles: { data: Article[]; exp: number } | null = null;
let memoEditorial: { data: any; exp: number } | null = null;
let memoIndexing: { data: IndexingPlatform[]; exp: number } | null = null;
const MEMO_TTL = 3000; // 3 detik per isolate untuk eliminasi query redundan antar komponen SSR

export async function getCachedSettings(kv?: any, d1?: any): Promise<JournalConfig> {
  const now = Date.now();
  if (memoSettings && now < memoSettings.exp) return memoSettings.data;

  const cacheKey = 'cache:journal:settings';
  const cached = await kvGet<JournalConfig>(cacheKey, kv);
  if (cached) {
    memoSettings = { data: cached, exp: now + MEMO_TTL };
    return cached;
  }

  const fresh = await getDbSettings(d1);
  await kvSet(cacheKey, fresh, 86400, kv); // Cache 24 jam
  memoSettings = { data: fresh, exp: now + MEMO_TTL };
  return fresh;
}

export async function getCachedArticles(kv?: any, d1?: any): Promise<Article[]> {
  const now = Date.now();
  if (memoArticles && now < memoArticles.exp) return memoArticles.data;

  const cacheKey = 'cache:articles:all';
  const cached = await kvGet<Article[]>(cacheKey, kv);
  if (cached) {
    memoArticles = { data: cached, exp: now + MEMO_TTL };
    return cached;
  }

  const fresh = await getDbArticles(d1);
  await kvSet(cacheKey, fresh, 86400, kv);
  memoArticles = { data: fresh, exp: now + MEMO_TTL };
  return fresh;
}

export async function getCachedEditorial(kv?: any, d1?: any) {
  const now = Date.now();
  if (memoEditorial && now < memoEditorial.exp) return memoEditorial.data;

  const cacheKey = 'cache:editorial:all';
  const cached = await kvGet(cacheKey, kv);
  if (cached) {
    memoEditorial = { data: cached, exp: now + MEMO_TTL };
    return cached;
  }

  const fresh = await getDbEditorial(d1);
  await kvSet(cacheKey, fresh, 86400, kv);
  memoEditorial = { data: fresh, exp: now + MEMO_TTL };
  return fresh;
}

export async function getCachedIndexing(kv?: any, d1?: any): Promise<IndexingPlatform[]> {
  const now = Date.now();
  if (memoIndexing && now < memoIndexing.exp) return memoIndexing.data;

  const cacheKey = 'cache:indexing:all';
  const cached = await kvGet<IndexingPlatform[]>(cacheKey, kv);
  if (cached) {
    memoIndexing = { data: cached, exp: now + MEMO_TTL };
    return cached;
  }

  const fresh = await getDbIndexing(d1);
  await kvSet(cacheKey, fresh, 86400, kv);
  memoIndexing = { data: fresh, exp: now + MEMO_TTL };
  return fresh;
}

/**
 * Otomatis menghapus seluruh cache saat admin melakukan perubahan di GUI
 */
export async function invalidateJournalCache(kv?: any): Promise<void> {
  memoSettings = null;
  memoArticles = null;
  memoEditorial = null;
  memoIndexing = null;
  await Promise.all([
    kvDelete('cache:journal:settings', kv),
    kvDelete('cache:articles:all', kv),
    kvDelete('cache:editorial:all', kv),
    kvDelete('cache:indexing:all', kv),
  ]);
  console.log('[KV] Seluruh cache edge berhasil di-flush.');
}
