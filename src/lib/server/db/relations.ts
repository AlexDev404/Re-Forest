import { relations } from "drizzle-orm/relations";
import { Role, TreeSpecies, Trees, User } from "./schema";

export const treesRelations = relations(Trees, ({one}) => ({
	treeSpecy: one(TreeSpecies, {
		fields: [Trees.treeSpecies],
		references: [TreeSpecies.id]
	}),
	user: one(User, {
		fields: [Trees.plantedBy],
		references: [User.id]
	}),
}));

export const treeSpeciesRelations = relations(TreeSpecies, ({many}) => ({
	trees: many(Trees),
}));

export const userRelations = relations(User, ({one, many}) => ({
	trees: many(Trees),
	role: one(Role, {
		fields: [User.role],
		references: [Role.id]
	}),
}));

export const roleRelations = relations(Role, ({many}) => ({
	users: many(User),
}));