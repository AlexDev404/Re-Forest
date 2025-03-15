import { relations } from "drizzle-orm/relations";
import { treeSpecies, trees, user, role } from "./schema";

export const treesRelations = relations(trees, ({one}) => ({
	treeSpecy: one(treeSpecies, {
		fields: [trees.treeSpecies],
		references: [treeSpecies.id]
	}),
	user: one(user, {
		fields: [trees.plantedBy],
		references: [user.id]
	}),
}));

export const treeSpeciesRelations = relations(treeSpecies, ({many}) => ({
	trees: many(trees),
}));

export const userRelations = relations(user, ({one, many}) => ({
	trees: many(trees),
	role: one(role, {
		fields: [user.role],
		references: [role.id]
	}),
}));

export const roleRelations = relations(role, ({many}) => ({
	users: many(user),
}));