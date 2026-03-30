type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const valueCache = new Map<string, CacheEntry<unknown>>();
const inFlightCache = new Map<string, Promise<unknown>>();

function cleanupExpired(now: number) {
  for (const [key, entry] of valueCache.entries()) {
    if (entry.expiresAt <= now) {
      valueCache.delete(key);
    }
  }
}

export function makeServerCacheKey(scope: string, keyParts: unknown) {
  return `${scope}:${JSON.stringify(keyParts)}`;
}

export async function getOrSetServerCache<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = valueCache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  if (cached && cached.expiresAt <= now) {
    valueCache.delete(key);
  }

  const inFlight = inFlightCache.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const created = factory()
    .then((value) => {
      valueCache.set(key, {
        value,
        expiresAt: Date.now() + Math.max(0, ttlMs),
      });
      return value;
    })
    .finally(() => {
      inFlightCache.delete(key);
      if (valueCache.size > 500) {
        cleanupExpired(Date.now());
      }
    });

  inFlightCache.set(key, created);
  return created;
}
