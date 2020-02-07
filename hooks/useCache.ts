
interface CacheEntry<T> {
    value: T;
    lastUpdated: number;
    TTL: number;
}

const cache = new Map<string, CacheEntry<any>>();

export default function useCache<T>(key: string, valueProvider: () => T, TTL:number = 60000): [T, () => void] {
    if (cache.has(key)) {
        const entry = cache.get(key);
        const now = Date.now();
        if (now - entry.lastUpdated > entry.TTL) {
            cache.delete(key)
        } else {
            return [entry.value, () => cache.delete(key)];
        }
    }

    const value = valueProvider();
    cache.set(key, {
        value: value,
        lastUpdated: Date.now(),
        TTL: 60000
    })
    return [value, () => cache.delete(key)];    
}