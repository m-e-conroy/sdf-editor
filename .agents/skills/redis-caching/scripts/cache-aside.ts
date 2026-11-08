import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

/**
 * Standard Cache-Aside Pattern
 * @param key Redis key
 * @param ttl Time to live in seconds
 * @param fetchFn Function to fetch data from source if cache miss
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key)
  
  if (cached) {
    return JSON.parse(cached) as T
  }

  const freshData = await fetchFn()
  
  // Set with TTL (EX)
  await redis.set(key, JSON.stringify(freshData), 'EX', ttl)
  
  return freshData
}
