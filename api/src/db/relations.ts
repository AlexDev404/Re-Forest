import { relations } from 'drizzle-orm/relations';
import { AchievementCategories, Achievements, Role, TreeSpecies, Trees, User, UserAchievements } from './schema';

export const treesRelations = relations(Trees, ({ one }) => ({
  treeSpecies: one(TreeSpecies, {
    fields: [Trees.TreeSpecies],
    references: [TreeSpecies.Id]
  }),
  user: one(User, {
    fields: [Trees.PlantedBy],
    references: [User.Id]
  })
}));

export const treeSpeciesRelations = relations(TreeSpecies, ({ many }) => ({
  trees: many(Trees)
}));

export const userRelations = relations(User, ({ one, many }) => ({
  trees: many(Trees),
  role: one(Role, {
    fields: [User.Role],
    references: [Role.Id]
  }),
  achievements: many(UserAchievements)
}));

export const roleRelations = relations(Role, ({ many }) => ({
  users: many(User)
}));

export const achievementCategoriesRelations = relations(AchievementCategories, ({ many }) => ({
  achievements: many(Achievements)
}));

export const achievementsRelations = relations(Achievements, ({ one, many }) => ({
  category: one(AchievementCategories, {
    fields: [Achievements.CategoryId],
    references: [AchievementCategories.Id]
  }),
  userAchievements: many(UserAchievements)
}));

export const userAchievementsRelations = relations(UserAchievements, ({ one }) => ({
  user: one(User, {
    fields: [UserAchievements.UserId],
    references: [User.Id]
  }),
  achievement: one(Achievements, {
    fields: [UserAchievements.AchievementId],
    references: [Achievements.Id]
  })
}));
