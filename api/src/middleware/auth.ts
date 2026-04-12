import type { Context, Next } from 'hono';
import Jwt from 'jsonwebtoken';
import { UserRepository, type UserData } from '../repositories/UserRepository';

// Hono context variable type augmentation
declare module 'hono' {
  interface ContextVariableMap {
    user: UserData | null;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || '';

/**
 * JWT authentication middleware for Hono.
 * Extracts the token from the Authorization header or cookie,
 * verifies it, and attaches the user to the context.
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Try Authorization header first, then cookie
    let token: string | undefined;

    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      // Try cookie
      const cookieHeader = c.req.header('Cookie');
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies['session'];
      }
    }

    if (!token) {
      c.set('user', null);
      return next();
    }

    const payload = Jwt.verify(token, JWT_SECRET) as Jwt.JwtPayload;
    if (!payload?.email) {
      c.set('user', null);
      return next();
    }

    const user = await UserRepository.findByEmail(payload.email);
    if (!user) {
      c.set('user', null);
      return next();
    }

    c.set('user', user);
  } catch (e) {
    console.error('[AUTH_MIDDLEWARE]:', e);
    c.set('user', null);
  }

  return next();
}

/**
 * Middleware that requires authentication - returns 401 if no user
 */
export async function requireAuth(c: Context, next: Next) {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return next();
}

/**
 * Middleware that requires admin or environmentalist role
 */
export async function requireRole(roles: number[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.Role ?? 0)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    return next();
  };
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });
  return cookies;
}
