import { and, count, countDistinct, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  AchievementCategories,
  Achievements,
  Trees,
  User,
  UserAchievements
} from '../db/schema';

export class AchievementRepository {
  /**
   * Get all achievements grouped by category
   */
  static async getAllGrouped() {
    const categories = await db
      .select()
      .from(AchievementCategories)
      .orderBy(AchievementCategories.DisplayOrder);

    const achievements = await db
      .select()
      .from(Achievements)
      .orderBy(Achievements.DisplayOrder);

    return categories.map((cat) => ({
      ...cat,
      achievements: achievements.filter((a) => a.CategoryId === cat.Id)
    }));
  }

  /**
   * Get a user's achievements: all achievements with unlocked status
   */
  static async getUserAchievements(userId: number) {
    const categories = await db
      .select()
      .from(AchievementCategories)
      .orderBy(AchievementCategories.DisplayOrder);

    const achievements = await db
      .select()
      .from(Achievements)
      .orderBy(Achievements.DisplayOrder);

    const unlocked = await db
      .select()
      .from(UserAchievements)
      .where(eq(UserAchievements.UserId, userId));

    const unlockedMap = new Map(
      unlocked.map((ua) => [ua.AchievementId, ua.UnlockedAt])
    );

    return categories.map((cat) => {
      const catAchievements = achievements
        .filter((a) => a.CategoryId === cat.Id)
        .map((a) => ({
          ...a,
          unlocked: unlockedMap.has(a.Id),
          unlockedAt: unlockedMap.get(a.Id) ?? null
        }));

      return {
        ...cat,
        totalCount: catAchievements.length,
        unlockedCount: catAchievements.filter((a) => a.unlocked).length,
        achievements: catAchievements
      };
    });
  }

  /**
   * Get a single category's achievements for a user
   */
  static async getUserCategoryAchievements(userId: number, categoryId: number) {
    const category = await db
      .select()
      .from(AchievementCategories)
      .where(eq(AchievementCategories.Id, categoryId));

    if (category.length === 0) return null;

    const achievements = await db
      .select()
      .from(Achievements)
      .where(eq(Achievements.CategoryId, categoryId))
      .orderBy(Achievements.DisplayOrder);

    const unlocked = await db
      .select()
      .from(UserAchievements)
      .where(eq(UserAchievements.UserId, userId));

    const unlockedMap = new Map(
      unlocked.map((ua) => [ua.AchievementId, ua.UnlockedAt])
    );

    const catAchievements = achievements.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.Id),
      unlockedAt: unlockedMap.get(a.Id) ?? null
    }));

    return {
      ...category[0],
      totalCount: catAchievements.length,
      unlockedCount: catAchievements.filter((a) => a.unlocked).length,
      achievements: catAchievements
    };
  }

  /**
   * Check and award achievements for a user based on their current stats.
   * Returns newly awarded achievement IDs.
   */
  static async checkAndAward(userId: number): Promise<number[]> {
    // Gather user stats in parallel
    const [treesPlantedResult, speciesCountResult, areaResult, daysActiveResult] =
      await Promise.all([
        // Total trees planted
        db
          .select({ value: count() })
          .from(Trees)
          .where(eq(Trees.PlantedBy, userId)),

        // Unique species planted
        db
          .select({ value: countDistinct(Trees.TreeSpecies) })
          .from(Trees)
          .where(eq(Trees.PlantedBy, userId)),

        // Total area in hectares
        db
          .select({
            value: sql<number>`COALESCE(SUM(${Trees.AreaHectares}), 0)`
          })
          .from(Trees)
          .where(eq(Trees.PlantedBy, userId)),

        // Distinct planting days
        db
          .select({
            value: sql<number>`COUNT(DISTINCT ${Trees.PlantedOn})`
          })
          .from(Trees)
          .where(eq(Trees.PlantedBy, userId))
      ]);

    const stats: Record<string, number> = {
      TREES_PLANTED: treesPlantedResult[0].value,
      SPECIES_COUNT: speciesCountResult[0].value,
      AREA_HECTARES: Number(areaResult[0].value) || 0,
      DAYS_ACTIVE: Number(daysActiveResult[0].value) || 0
    };

    // Get all achievements and user's already-unlocked ones
    const allAchievements = await db.select().from(Achievements);
    const alreadyUnlocked = await db
      .select({ achievementId: UserAchievements.AchievementId })
      .from(UserAchievements)
      .where(eq(UserAchievements.UserId, userId));

    const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
    const newlyAwarded: number[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.Id)) continue;

      const userValue = stats[achievement.ThresholdType] ?? 0;
      if (userValue >= (achievement.Threshold ?? 1)) {
        await db.insert(UserAchievements).values({
          UserId: userId,
          AchievementId: achievement.Id
        });
        newlyAwarded.push(achievement.Id);
      }
    }

    return newlyAwarded;
  }

  /**
   * Leaderboard: users ranked by trees planted + achievement count
   */
  static async getLeaderboard() {
    const users = await db
      .select({
        Id: User.Id,
        FirstName: User.FirstName,
        LastName: User.LastName,
        CreatedAt: User.CreatedAt,
        treesPlanted: sql<number>`(
          SELECT COUNT(*) FROM "Trees" WHERE "Trees"."planted_by" = "User"."id"
        )`,
        achievementCount: sql<number>`(
          SELECT COUNT(*) FROM "User_Achievements" WHERE "User_Achievements"."user_id" = "User"."id"
        )`
      })
      .from(User)
      .orderBy(
        desc(sql`(
          SELECT COUNT(*) FROM "Trees" WHERE "Trees"."planted_by" = "User"."id"
        )`)
      );

    return users;
  }
}
