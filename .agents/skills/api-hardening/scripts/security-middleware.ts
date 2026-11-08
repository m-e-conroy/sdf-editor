import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

/**
 * Standard Security Middleware Suite
 * Includes: Helmet, Rate Limiting (Redis-backed)
 */
export const setupSecurity = (app: any) => {
  // Set security headers
  app.use(helmet())

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error - Known type mismatch in some redis-store versions
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
  })

  app.use('/api/', limiter)
  
  // Disable tech reveal
  app.disable('x-powered-by')
}
