import { api } from './client';

export interface Achievement {
  Id: number;
  CategoryId: number;
  Name: string;
  Description: string | null;
  Icon: string | null;
  Threshold: number | null;
  ThresholdType: string;
  DisplayOrder: number | null;
  CreatedAt: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementCategory {
  Id: number;
  Name: string;
  Description: string | null;
  DisplayOrder: number | null;
  CreatedAt: string | null;
  totalCount: number;
  unlockedCount: number;
  achievements: Achievement[];
}

export const achievementsAdapter = {
  getUserAchievements(userId: number) {
    return api.get<{ categories: AchievementCategory[] }>(`/achievements/user/${userId}`);
  },

  getUserCategoryAchievements(userId: number, categoryId: number) {
    return api.get<{ category: AchievementCategory }>(`/achievements/user/${userId}/category/${categoryId}`);
  }
};
