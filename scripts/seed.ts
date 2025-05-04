// scripts/seed.ts
import { db } from '../src/lib/server/db/index.js';
import { TreeSpecies, Trees } from '../src/lib/server/db/schema.js'; // Import correct table names
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding the database...');

  // Seed TreeSpecies table
  const insertedSpecies = await db
    .insert(TreeSpecies)  // Use TreeSpecies table
    .values([
      { Name: 'Mahogany' },
      { Name: 'Teak' },
      { Name: 'Cedar' }
    ])
    .onConflictDoNothing()  // Handle conflicts (e.g., species already exist)
    .returning();

  // Check if we got a valid species ID
  const speciesId = insertedSpecies[0]?.Id;  // Use Id here since that's the primary key

  if (!speciesId) {
    console.error('❌ Failed to seed species or species already exist. Aborting tree seed.');
    process.exit(1);  // Abort if species insertion failed
  }

  // Seed Trees table now that we have valid species
  await db.insert(Trees).values([
    {
      TreeName: 'Sample Tree',   // Placeholder for tree name
      TreeSpecies: speciesId,    // Link to the species we just inserted
      Height: 10.5,              // Example data
      Health: 'EXCELLENT',       // Example data
      Age: 5,                    // Example data
      Image: 'sample.jpg',       // Example image URL or path
      Lat: 17.1611,              // Example latitude
      Lng: -89.0697,             // Example longitude
      PlantedBy: 1,              // Assuming planted by user with ID 1
      PlantedOn: new Date(),     // Current date
    }
  ]);

  console.log('✅ Seeding completed!');
}

seed().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
