import { Hono } from 'hono';
import { AchievementRepository } from '../repositories/AchievementRepository';

const leaderboard = new Hono();

/**
 * GET /leaderboard - Get all users ranked by trees planted
 */
leaderboard.get('/', async (c) => {
  try {
    const result = await AchievementRepository.getLeaderboard();
    return c.json({ leaderboard: result });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

export default leaderboard;
