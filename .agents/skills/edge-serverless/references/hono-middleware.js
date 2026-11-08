/**
 * Hono Middleware Pattern
 * Optimized for Edge runtimes (Cloudflare/Vercel).
 */

import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    return c.json({ status: 'fail', message: 'Unauthorized' }, 401);
  }

  try {
    // Edge-compatible JWT verification
    // const payload = await verifyToken(token.split(' ')[1]);
    // c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ status: 'error', message: 'Invalid Token' }, 401);
  }
});

// Usage in app:
// app.use('/api/*', authMiddleware);
