import { Hono } from 'hono';
import Jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository, type UserData } from '../repositories/UserRepository';

const JWT_SECRET = process.env.JWT_SECRET || '';
const SESSION_MAX_AGE = process.env.SESSION_MAX_AGE || '72';

const auth = new Hono();

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long')
});

/**
 * POST /auth/login
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: 'Validation failed', details: validation.error.issues }, 400);
    }

    const { email, password } = validation.data;

    const user = await UserRepository.findByEmail(email);
    if (!user || !user.Password) {
      return c.json({ error: 'Invalid email or password' }, 400);
    }

    const valid = await UserRepository.verifyPassword(user.Password, password);
    if (!valid) {
      return c.json({ error: 'Invalid email or password' }, 400);
    }

    const token = Jwt.sign({ email: user.Email }, JWT_SECRET, {
      expiresIn: SESSION_MAX_AGE + 'h'
    });

    return c.json({
      success: true,
      token,
      user: {
        Id: user.Id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Role: user.Role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'An error occurred during login' }, 500);
  }
});

/**
 * POST /auth/register
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: 'Validation failed', details: validation.error.issues }, 400);
    }

    const { name, email, password, confirmPassword } = validation.data;

    if (password !== confirmPassword) {
      return c.json({ error: "Passwords don't match" }, 400);
    }

    const exists = await UserRepository.emailExists(email);
    if (exists) {
      return c.json({ error: 'Email already in use' }, 400);
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const user = await UserRepository.register(email, password, firstName, lastName);

    const token = Jwt.sign({ email: user.Email }, JWT_SECRET, {
      expiresIn: SESSION_MAX_AGE + 'h'
    });

    return c.json({
      success: true,
      token,
      user: {
        Id: user.Id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Role: user.Role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'An error occurred during registration' }, 500);
  }
});

/**
 * POST /auth/logout
 */
auth.post('/logout', async (c) => {
  return c.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /auth/me - Get current user info
 */
auth.get('/me', async (c) => {
  const user = c.get('user') as UserData | null;

  if (!user) {
    return c.json({
      authenticated: false,
      user: { Id: null, FirstName: 'Guest', LastName: '', Role: 3 }
    });
  }

  return c.json({
    authenticated: true,
    user: {
      Id: user.Id,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Role: user.Role
    }
  });
});

export default auth;
