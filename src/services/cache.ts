// Local caching service for AI responses
export interface CacheEntry {
  data: string;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Generate a cache key from request parameters
   */
  private generateKey(prompt: string, model: string, contextHash?: string): string {
    const baseKey = `${model}:${this.hashString(prompt)}`;
    return contextHash ? `${baseKey}:${contextHash}` : baseKey;
  }

  /**
   * Simple string hashing function (public for external use)
   */
  hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store a response in cache
   */
  set(prompt: string, model: string, response: string, contextHash?: string, ttl?: number): void {
    const key = this.generateKey(prompt, model, contextHash);
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);
    
    this.cache.set(key, {
      data: response,
      timestamp: now,
      expiresAt
    });

    // Clean up expired entries periodically
    this.cleanup();
    
    console.log(`📦 Cached response for key: ${key}`);
  }

  /**
   * Retrieve a response from cache
   */
  get(prompt: string, model: string, contextHash?: string): string | null {
    const key = this.generateKey(prompt, model, contextHash);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`🗑️ Expired cache entry removed: ${key}`);
      return null;
    }

    console.log(`✅ Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Check if a response is cached
   */
  has(prompt: string, model: string, contextHash?: string): boolean {
    return this.get(prompt, model, contextHash) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Clear cache entries by pattern
   */
  clearByPattern(pattern: string): void {
    let removedCount = 0;
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`🧹 Cleared ${removedCount} cache entries matching pattern: ${pattern}`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; totalEntries: number; oldestEntry?: number } {
    const now = Date.now();
    let oldestTimestamp: number | undefined;

    for (const entry of this.cache.values()) {
      if (!oldestTimestamp || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      totalEntries: this.cache.size,
      oldestEntry: oldestTimestamp ? now - oldestTimestamp : undefined
    };
  }
}

export const cacheService = new CacheService();
