import { relations } from 'drizzle-orm/relations';
import { Role, TreeSpecies, Trees, User } from './schema';

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
	})
}));

export const roleRelations = relations(Role, ({ many }) => ({
	users: many(User)
}));
