import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth';
import achievementsRoutes from './routes/achievements';
import authRoutes from './routes/auth';
import leaderboardRoutes from './routes/leaderboard';
import miscRoutes from './routes/misc';
import reportsRoutes from './routes/reports';
import speciesRoutes from './routes/species';
import treesRoutes from './routes/trees';
import uploadRoutes from './routes/upload';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: eval(process.env.FRONTEND_URL ?? 'undefined') || 'http://localhost:5173',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);
app.use('*', authMiddleware);

// Health check
app.get('/', (c) => c.json({ status: 'ok', name: 'Re-Forest API', version: '1.0.0' }));

// Routes
app.route('/achievements', achievementsRoutes);
app.route('/auth', authRoutes);
app.route('/leaderboard', leaderboardRoutes);
app.route('/trees', treesRoutes);
app.route('/tree-species', speciesRoutes);
app.route('/reports', reportsRoutes);
app.route('/upload', uploadRoutes);
app.route('/', miscRoutes);

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export { app };
