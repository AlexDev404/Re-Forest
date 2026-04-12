import {
  boolean,
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
  IsTimber: boolean('is_timber').default(true),
  CreatedAt: timestamp('created_at').defaultNow()
});

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

export const PlantingReasons = pgTable('PlantingReasons', {
  Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
    name: 'PlantingReasons_id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647
  }),
  Name: varchar('name', { length: 255 }).notNull(),
  CreatedAt: timestamp('created_at').defaultNow()
});

export const Trees_PlantingReasons = pgTable('Trees_PlantingReasons', {
  Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
    name: 'Trees_PlantingReasons_id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647
  }),
  TreeId: integer('tree_id')
    .notNull()
    .references(() => Trees.Id, { onDelete: 'cascade' }),
  PlantingReasonId: integer('planting_reason_id')
    .notNull()
    .references(() => PlantingReasons.Id, { onDelete: 'cascade' }),
  CreatedAt: timestamp('created_at').defaultNow()
});

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
  deviceInfo: varchar('device_info', { length: 255 }),
  lastUpdated: timestamp('last_updated').defaultNow()
});

export const thresholdType = pgEnum('thresholdtype', [
  'TREES_PLANTED',
  'SPECIES_COUNT',
  'AREA_HECTARES',
  'DAYS_ACTIVE'
]);

export const AchievementCategories = pgTable('Achievement_Categories', {
  Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
    name: 'Achievement_Categories_id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647
  }),
  Name: varchar('name', { length: 255 }).notNull(),
  Description: text('description'),
  DisplayOrder: integer('display_order').default(0),
  CreatedAt: timestamp('created_at').defaultNow()
});

export const Achievements = pgTable(
  'Achievements',
  {
    Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
      name: 'Achievements_id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647
    }),
    CategoryId: integer('category_id').notNull(),
    Name: varchar('name', { length: 255 }).notNull(),
    Description: text('description'),
    Icon: varchar('icon', { length: 255 }),
    Threshold: integer('threshold').default(1),
    ThresholdType: thresholdType('threshold_type').notNull(),
    DisplayOrder: integer('display_order').default(0),
    CreatedAt: timestamp('created_at').defaultNow()
  },
  (table) => [
    foreignKey({
      columns: [table.CategoryId],
      foreignColumns: [AchievementCategories.Id],
      name: 'Achievements_category_id_fkey'
    })
  ]
);

export const UserAchievements = pgTable(
  'User_Achievements',
  {
    Id: integer('id').primaryKey().generatedByDefaultAsIdentity({
      name: 'User_Achievements_id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647
    }),
    UserId: integer('user_id').notNull(),
    AchievementId: integer('achievement_id').notNull(),
    UnlockedAt: timestamp('unlocked_at').defaultNow()
  },
  (table) => [
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [User.Id],
      name: 'User_Achievements_user_id_fkey'
    }),
    foreignKey({
      columns: [table.AchievementId],
      foreignColumns: [Achievements.Id],
      name: 'User_Achievements_achievement_id_fkey'
    })
  ]
);
