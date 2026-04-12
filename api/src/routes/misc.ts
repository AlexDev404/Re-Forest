import { Hono } from 'hono';
import type { UserData } from '../repositories/UserRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { TreeRepository } from '../repositories/TreeRepository';

const misc = new Hono();

/**
 * POST /save-fcm-token - Save Firebase Cloud Messaging token
 */
misc.post('/save-fcm-token', async (c) => {
  const user = c.get('user') as UserData | null;

  try {
    const { fcmToken, deviceInfo } = await c.req.json();
    const userId = user?.Id;

    if (!userId || !fcmToken) {
      return c.json({ error: 'Missing data' }, 400);
    }

    await NotificationRepository.saveFcmToken(userId, fcmToken, deviceInfo);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return c.json({ error: 'Failed to save token' }, 500);
  }
});

/**
 * GET /planting-reasons - Get all planting reasons
 */
misc.get('/planting-reasons', async (c) => {
  try {
    const reasons = await TreeRepository.getPlantingReasons();
    return c.json({ plantingReasons: reasons });
  } catch (error) {
    console.error('Error fetching planting reasons:', error);
    return c.json({ error: 'Failed to fetch planting reasons' }, 500);
  }
});

export default misc;
