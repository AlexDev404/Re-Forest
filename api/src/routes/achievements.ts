import { Hono } from 'hono';
import { AchievementRepository } from '../repositories/AchievementRepository';

const achievements = new Hono();

/**
 * GET /achievements - Get all achievements grouped by category
 */
achievements.get('/', async (c) => {
  try {
    const result = await AchievementRepository.getAllGrouped();
    return c.json({ categories: result });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return c.json({ error: 'Failed to fetch achievements' }, 500);
  }
});

/**
 * GET /achievements/user/:userId - Get a user's achievements (all categories)
 */
achievements.get('/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'), 10);
    if (isNaN(userId)) {
      return c.json({ error: 'Invalid user ID' }, 400);
    }

    const result = await AchievementRepository.getUserAchievements(userId);
    return c.json({ categories: result });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return c.json({ error: 'Failed to fetch user achievements' }, 500);
  }
});

/**
 * GET /achievements/user/:userId/category/:categoryId - Get a single category for a user
 */
achievements.get('/user/:userId/category/:categoryId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'), 10);
    const categoryId = parseInt(c.req.param('categoryId'), 10);
    if (isNaN(userId) || isNaN(categoryId)) {
      return c.json({ error: 'Invalid user or category ID' }, 400);
    }

    const result = await AchievementRepository.getUserCategoryAchievements(userId, categoryId);
    if (!result) {
      return c.json({ error: 'Category not found' }, 404);
    }
    return c.json({ category: result });
  } catch (error) {
    console.error('Error fetching user category achievements:', error);
    return c.json({ error: 'Failed to fetch category achievements' }, 500);
  }
});

export default achievements;
