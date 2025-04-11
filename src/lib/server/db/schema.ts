import { date, doublePrecision, foreignKey, integer, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
export const treehealth = pgEnum("treehealth", ['BAD', 'FAIR', 'GOOD', 'EXCELLENT'])


export const treeSpecies = pgTable("Tree_Species", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "Tree_Species_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	name: varchar({ length: 255 }),
});

export const trees = pgTable("Trees", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "Tree_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	treeName: varchar("tree_name", { length: 255 }),
	treeSpecies: integer("tree_species"),
	height: doublePrecision(),
	health: treehealth().default("EXCELLENT"),
	age: integer(),
	image: text(),
	lat: doublePrecision(),
	lng: doublePrecision(),
	plantedBy: integer("planted_by"),
	plantedOn: date("planted_on"),
}, (table) => [
	foreignKey({
			columns: [table.treeSpecies],
			foreignColumns: [treeSpecies.id],
			name: "Tree_tree_species_fkey"
		}),
	foreignKey({
			columns: [table.plantedBy],
			foreignColumns: [user.id],
			name: "Tree_planted_by_fkey"
		}),
]);

export const role = pgTable("Role", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "Role_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	name: varchar({ length: 255 }),
});

export const user = pgTable("User", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "User_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	role: integer(),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar({ length: 255 }),
	password: varchar({ length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.role],
			foreignColumns: [role.id],
			name: "User_role_fkey"
		}),
]);
