import { db } from './index';
import { AchievementCategories, Achievements } from './schema';

/**
 * Seeds achievement categories and achievement definitions.
 * Run with: bun run src/db/seed-achievements.ts
 */
async function seed() {
  console.log('Seeding achievement categories...');

  // Insert categories
  const categories = await db
    .insert(AchievementCategories)
    .values([
      { Name: 'Tree Planting', Description: 'Milestones for the number of trees you have planted', DisplayOrder: 1 },
      { Name: 'Species Explorer', Description: 'Plant a variety of different tree species', DisplayOrder: 2 },
      { Name: 'Community Impact', Description: 'Cover ground and make a real impact on the landscape', DisplayOrder: 3 },
      { Name: 'Dedication', Description: 'Show up consistently and keep planting over time', DisplayOrder: 4 }
    ])
    .returning({ Id: AchievementCategories.Id, Name: AchievementCategories.Name });

  const catMap = new Map(categories.map((c) => [c.Name, c.Id]));

  console.log('Seeding achievements...');

  await db.insert(Achievements).values([
    // Tree Planting
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Seedling', Description: 'Plant your first tree', Icon: '🌱', Threshold: 1, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 1 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Sapling', Description: 'Plant 5 trees', Icon: '🌿', Threshold: 5, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 2 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Green Thumb', Description: 'Plant 10 trees', Icon: '🪴', Threshold: 10, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 3 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Tree Hugger', Description: 'Plant 25 trees', Icon: '🌳', Threshold: 25, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 4 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Forester', Description: 'Plant 50 trees', Icon: '🏕️', Threshold: 50, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 5 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Forest Guardian', Description: 'Plant 100 trees', Icon: '🛡️', Threshold: 100, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 6 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Reforestation Hero', Description: 'Plant 250 trees', Icon: '🦸', Threshold: 250, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 7 },
    { CategoryId: catMap.get('Tree Planting')!, Name: 'Legend of the Forest', Description: 'Plant 500 trees', Icon: '👑', Threshold: 500, ThresholdType: 'TREES_PLANTED' as const, DisplayOrder: 8 },

    // Species Explorer
    { CategoryId: catMap.get('Species Explorer')!, Name: 'Curious Planter', Description: 'Plant 2 different species', Icon: '🔍', Threshold: 2, ThresholdType: 'SPECIES_COUNT' as const, DisplayOrder: 1 },
    { CategoryId: catMap.get('Species Explorer')!, Name: 'Diversifier', Description: 'Plant 5 different species', Icon: '🌺', Threshold: 5, ThresholdType: 'SPECIES_COUNT' as const, DisplayOrder: 2 },
    { CategoryId: catMap.get('Species Explorer')!, Name: 'Botanist', Description: 'Plant 10 different species', Icon: '🔬', Threshold: 10, ThresholdType: 'SPECIES_COUNT' as const, DisplayOrder: 3 },
    { CategoryId: catMap.get('Species Explorer')!, Name: 'Species Master', Description: 'Plant 15 different species', Icon: '📚', Threshold: 15, ThresholdType: 'SPECIES_COUNT' as const, DisplayOrder: 4 },
    { CategoryId: catMap.get('Species Explorer')!, Name: 'Biodiversity Champion', Description: 'Plant 20 different species', Icon: '🏆', Threshold: 20, ThresholdType: 'SPECIES_COUNT' as const, DisplayOrder: 5 },

    // Community Impact
    { CategoryId: catMap.get('Community Impact')!, Name: 'First Hectare', Description: 'Cover 1 hectare of planted area', Icon: '📐', Threshold: 1, ThresholdType: 'AREA_HECTARES' as const, DisplayOrder: 1 },
    { CategoryId: catMap.get('Community Impact')!, Name: 'Land Steward', Description: 'Cover 5 hectares of planted area', Icon: '🗺️', Threshold: 5, ThresholdType: 'AREA_HECTARES' as const, DisplayOrder: 2 },
    { CategoryId: catMap.get('Community Impact')!, Name: 'Territory Guardian', Description: 'Cover 10 hectares of planted area', Icon: '🏞️', Threshold: 10, ThresholdType: 'AREA_HECTARES' as const, DisplayOrder: 3 },
    { CategoryId: catMap.get('Community Impact')!, Name: 'Landscape Architect', Description: 'Cover 25 hectares of planted area', Icon: '🌄', Threshold: 25, ThresholdType: 'AREA_HECTARES' as const, DisplayOrder: 4 },
    { CategoryId: catMap.get('Community Impact')!, Name: 'Regional Champion', Description: 'Cover 50 hectares of planted area', Icon: '🌍', Threshold: 50, ThresholdType: 'AREA_HECTARES' as const, DisplayOrder: 5 },

    // Dedication
    { CategoryId: catMap.get('Dedication')!, Name: 'First Steps', Description: 'Plant on 2 different days', Icon: '👣', Threshold: 2, ThresholdType: 'DAYS_ACTIVE' as const, DisplayOrder: 1 },
    { CategoryId: catMap.get('Dedication')!, Name: 'Getting Started', Description: 'Plant on 5 different days', Icon: '📅', Threshold: 5, ThresholdType: 'DAYS_ACTIVE' as const, DisplayOrder: 2 },
    { CategoryId: catMap.get('Dedication')!, Name: 'Committed', Description: 'Plant on 10 different days', Icon: '💪', Threshold: 10, ThresholdType: 'DAYS_ACTIVE' as const, DisplayOrder: 3 },
    { CategoryId: catMap.get('Dedication')!, Name: 'Devoted', Description: 'Plant on 25 different days', Icon: '🔥', Threshold: 25, ThresholdType: 'DAYS_ACTIVE' as const, DisplayOrder: 4 },
    { CategoryId: catMap.get('Dedication')!, Name: 'Unstoppable', Description: 'Plant on 50 different days', Icon: '⭐', Threshold: 50, ThresholdType: 'DAYS_ACTIVE' as const, DisplayOrder: 5 }
  ]);

  console.log('Seeding complete!');
  console.log(`Created ${categories.length} categories and 23 achievements.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
