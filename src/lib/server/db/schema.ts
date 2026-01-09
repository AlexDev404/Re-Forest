import {
	date,
	doublePrecision,
	foreignKey,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';
export const treehealth = pgEnum('treehealth', ['POOR', 'FAIR', 'GOOD', 'EXCELLENT']);
export const roleNames = pgEnum('names', ['ADMIN', 'ENVIRONMENTALIST', 'USER']);
export const treeStatus = pgEnum('treestatus', ['PENDING', 'APPROVED', 'DECLINED']);
export const planterType = pgEnum('plantertype', ['INDIVIDUAL', 'ORGANIZATION']);

export const TreeSpecies = pgTable('Tree_Species', {
	Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
		name: 'Tree_Species_id_seq',
		startWith: 1,
		increment: 1,
		minValue: 1,
		maxValue: 2147483647
	}),
	Name: varchar('name', { length: 255 }),
	CreatedAt: timestamp('created_at').defaultNow()
});

export const Trees = pgTable(
	'Trees',
	{
		Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
			name: 'Tree_id_seq',
			startWith: 1,
			increment: 1,
			minValue: 1,
			maxValue: 2147483647
		}),
		TreeName: varchar('tree_name', { length: 255 }),
		TreeSpecies: integer('tree_species'),
		Height: doublePrecision('height'),
		Health: treehealth('health').default('EXCELLENT'),
		Status: treeStatus('status').default('PENDING'),
		Age: integer('age'),
		Image: text('image'),
		Lat: doublePrecision('lat'),
		Lng: doublePrecision('lng'),
		PlantedBy: integer('planted_by'),
		PlantedOn: date('planted_on'),
		PlanterType: planterType('planter_type').default('INDIVIDUAL'),
		OrganizationName: varchar('organization_name', { length: 255 }),
		PlantingReason: text('planting_reason'),
		Hashtags: text('hashtags'),
		Quantity: integer('quantity').default(1),
		AreaHectares: doublePrecision('area_hectares'),
		CreatedAt: timestamp('created_at').defaultNow(),
		UpdatedAt: timestamp('updated_at').defaultNow()
	},
	(table) => [
		foreignKey({
			columns: [table.TreeSpecies],
			foreignColumns: [TreeSpecies.Id],
			name: 'Tree_tree_species_fkey'
		}),
		foreignKey({
			columns: [table.PlantedBy],
			foreignColumns: [User.Id],
			name: 'Tree_planted_by_fkey'
		})
	]
);

export const Role = pgTable('Role', {
	Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
		name: 'Role_id_seq',
		startWith: 1,
		increment: 1,
		minValue: 1,
		maxValue: 2147483647
	}),
	Name: roleNames('name')
});

export const User = pgTable(
	'User',
	{
		Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
			name: 'User_id_seq',
			startWith: 1,
			increment: 1,
			minValue: 1,
			maxValue: 2147483647
		}),
		Role: integer('role'),
		FirstName: varchar('first_name', { length: 255 }),
		LastName: varchar('last_name', { length: 255 }),
		Email: varchar('email', { length: 255 }),
		Password: varchar('password', { length: 255 }),
		CreatedAt: timestamp('created_at').defaultNow()
	},
	(table) => [
		foreignKey({
			columns: [table.Role],
			foreignColumns: [Role.Id],
			name: 'User_role_fkey'
		})
	]
);

export const Notifications = pgTable('Notifications', {
	id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
	userId: integer('user_id')
		.notNull()
		.references(() => User.Id, { onDelete: 'cascade' }),
	treeId: integer('tree_id')
		.notNull()
		.references(() => Trees.Id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 50 }).notNull(),
	message: text('message').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

export const UserTokens = pgTable('User_Tokens', {
	id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
	userId: integer('user_id')
		.notNull()
		.references(() => User.Id, { onDelete: 'cascade' }),
	fcmToken: text('fcm_token').notNull(),
	deviceInfo: varchar('device_info', { length: 255 }), // optional
	lastUpdated: timestamp('last_updated').defaultNow()
});
