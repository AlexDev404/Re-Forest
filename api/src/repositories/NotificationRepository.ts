import { eq } from 'drizzle-orm';
import { db } from '../db';
import { Notifications, UserTokens } from '../db/schema';

export class NotificationRepository {
  /**
   * Create a notification record in the database
   */
  static async create(userId: number, treeId: number, type: string, message: string) {
    const result = await db
      .insert(Notifications)
      .values({ userId, treeId, type, message })
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Save or update FCM token for a user
   */
  static async saveFcmToken(userId: number, fcmToken: string, deviceInfo?: string) {
    const existing = await db
      .select()
      .from(UserTokens)
      .where(eq(UserTokens.userId, userId));

    if (existing.length > 0) {
      await db
        .update(UserTokens)
        .set({ fcmToken, deviceInfo, lastUpdated: new Date() })
        .where(eq(UserTokens.userId, userId));
    } else {
      await db.insert(UserTokens).values({
        userId,
        fcmToken,
        deviceInfo,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Get FCM tokens for a user
   */
  static async getUserTokens(userId: number) {
    return db.select().from(UserTokens).where(eq(UserTokens.userId, userId));
  }
}
