import NodeCache from "node-cache";

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 60 * 5) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }

    public get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    public set<T>(key: string, value: T, ttl?: number): boolean {
        if(ttl) {
            return this.cache.set(key, value, ttl);
        }

        return this.cache.set(key, value);
    }

    public del(key: string): number {
        return this.cache.del(key);
    }

    public flush(): void {
        this.cache.flushAll();
    }
}

export const cacheService = new CacheService();
