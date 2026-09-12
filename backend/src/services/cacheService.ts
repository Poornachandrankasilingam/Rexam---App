/**
 * Rexam High-Speed In-Memory Cache Service
 * Provides sub-millisecond data retrieval with automatic TTL expiration.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class FastCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;

    // Periodic cleanup of expired entries every 2 minutes
    setInterval(() => this.cleanup(), 120000).unref();
  }

  /**
   * Get cached item or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set item in cache with TTL in seconds (default 300s = 5m)
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entry
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  /**
   * Invalidate specific key or keys matching prefix
   */
  del(keyOrPrefix: string): void {
    if (this.store.has(keyOrPrefix)) {
      this.store.delete(keyOrPrefix);
      return;
    }

    for (const key of this.store.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const fastCache = new FastCache(2000);
