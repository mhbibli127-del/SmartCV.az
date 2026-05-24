// Performance optimization with caching layer
import { logger, performanceMonitor } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
    logger.debug(`Cache set: ${key}`, 'cache');
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`Cache expired: ${key}`, 'cache');
      return null;
    }
    
    logger.debug(`Cache hit: ${key}`, 'cache');
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
    logger.debug(`Cache deleted: ${key}`, 'cache');
  }

  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared', 'cache');
  }

  // Cache with automatic refresh
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const startTime = performanceMonitor.startMeasure('cache-miss');
    
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      
      performanceMonitor.endMeasure('cache-miss', startTime);
      
      return data;
    } catch (error) {
      logger.error(`Failed to fetch data for cache: ${key}`, 'cache', error as Error);
      throw error;
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    logger.info(`Invalidated ${count} cache entries matching pattern: ${pattern}`, 'cache');
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
      
      // Estimate size (rough calculation)
      totalSize += JSON.stringify(entry.data).length;
    }

    return {
      total: this.cache.size,
      active,
      expired,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: this.calculateHitRate()
    };
  }

  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? (this.hitCount / total) * 100 : 0;
  }

  recordHit(): void {
    this.hitCount++;
  }

  recordMiss(): void {
    this.missCount++;
  }
}

export const cacheService = CacheService.getInstance();

// Database query optimization with caching
export class DatabaseCache {
  private static instance: DatabaseCache;
  private cache = CacheService.getInstance();

  private constructor() {}

  static getInstance(): DatabaseCache {
    if (!DatabaseCache.instance) {
      DatabaseCache.instance = new DatabaseCache();
    }
    return DatabaseCache.instance;
  }

  async getTemplates(forceRefresh = false) {
    const cacheKey = 'templates:all';
    
    if (forceRefresh) {
      this.cache.delete(cacheKey);
    }
    
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { DatabaseOperations } = await import('./models');
        return DatabaseOperations.getTemplates();
      },
      10 * 60 * 1000 // 10 minutes
    );
  }

  async getTemplateById(id: number) {
    const cacheKey = `template:${id}`;
    
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { DatabaseOperations } = await import('./models');
        return DatabaseOperations.getTemplateById(id);
      },
      15 * 60 * 1000 // 15 minutes
    );
  }

  async getTemplatesByCategory(category: string) {
    const cacheKey = `templates:category:${category}`;
    
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { DatabaseOperations } = await import('./models');
        return DatabaseOperations.getTemplatesByCategory(category);
      },
      10 * 60 * 1000 // 10 minutes
    );
  }

  async getAnalytics(date: Date) {
    const cacheKey = `analytics:${date.toISOString().split('T')[0]}`;
    
    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const { DatabaseOperations } = await import('./models');
        return DatabaseOperations.getAnalytics(date);
      },
      5 * 60 * 1000 // 5 minutes
    );
  }

  invalidateTemplates() {
    this.cache.invalidatePattern('templates:*');
    this.cache.invalidatePattern('template:*');
  }

  invalidateAnalytics() {
    this.cache.invalidatePattern('analytics:*');
  }
}

export const databaseCache = DatabaseCache.getInstance();

// Response caching for API routes
export function cacheResponse(key: string, ttl: number = 5 * 60 * 1000) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cache = CacheService.getInstance();
      const cacheKey = `${key}:${JSON.stringify(args)}`;
      
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}
