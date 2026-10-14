import { getDbSettings, getDbArticles, getDbEditorial, type SektansiaDatabase } from './db';
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

// ==========================================
// CACHE-ASIDE PATTERN UNTUK DATA UTAMA
// ==========================================

export async function getCachedSettings(kv?: any, d1?: any): Promise<JournalConfig> {
  const cacheKey = 'cache:journal:settings';
  const cached = await kvGet<JournalConfig>(cacheKey, kv);
  if (cached) return cached;

  const fresh = await getDbSettings(d1);
  await kvSet(cacheKey, fresh, 86400, kv); // Cache 24 jam
  return fresh;
}

export async function getCachedArticles(kv?: any, d1?: any): Promise<Article[]> {
  const cacheKey = 'cache:articles:all';
  const cached = await kvGet<Article[]>(cacheKey, kv);
  if (cached) return cached;

  const fresh = await getDbArticles(d1);
  await kvSet(cacheKey, fresh, 86400, kv);
  return fresh;
}

export async function getCachedEditorial(kv?: any, d1?: any) {
  const cacheKey = 'cache:editorial:all';
  const cached = await kvGet(cacheKey, kv);
  if (cached) return cached;

  const fresh = await getDbEditorial(d1);
  await kvSet(cacheKey, fresh, 86400, kv);
  return fresh;
}

/**
 * Otomatis menghapus seluruh cache saat admin melakukan perubahan di GUI
 */
export async function invalidateJournalCache(kv?: any): Promise<void> {
  await Promise.all([
    kvDelete('cache:journal:settings', kv),
    kvDelete('cache:articles:all', kv),
    kvDelete('cache:editorial:all', kv),
  ]);
  console.log('[KV] Seluruh cache edge berhasil di-flush.');
}
