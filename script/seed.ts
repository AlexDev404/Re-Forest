// scripts/seed.ts
import { TreeSpecies, Trees, PlantingReasons } from '../src/lib/server/db/schema.js'; // Import correct table names
import { db } from './support/db.js';

const SEED_TYPE: 'species' | 'trees' | 'reasons' = process.argv[2] as 'species' | 'trees' | 'reasons';

async function seed_planting_reasons() {
	console.log('🌱 Seeding planting reasons...');

	const reasons = [
		{ Name: 'Event' },
		{ Name: 'Special Occasion (birthdays, anniversary, etc)' },
		{ Name: 'Reforestation' },
		{ Name: 'Environmental Protection (soil retention, coastal protection, etc.)' },
		{ Name: 'Recreational' },
		{ Name: 'Cultural' },
		{ Name: 'Other' }
	];

	await db
		.insert(PlantingReasons)
		.values(reasons)
		.onConflictDoNothing()
		.then(() => {
			console.log('✅ Planting reasons seeded successfully!');
		})
		.catch((error) => {
			console.error('❌ Failed to seed planting reasons:', error);
			process.exit(1);
		});
}

async function seed() {
	console.log('🌱 Seeding tree species...');

	// Timber species with scientific names
	const timberSpecies = [
		{ Name: 'Mahogany (Swietenia macrophylla)', IsTimber: true },
		{ Name: 'Cedar (Cedrela mexicana)', IsTimber: true },
		{ Name: 'Banak (Virola Koschyni)', IsTimber: true },
		{ Name: 'Mayflower (Tabebuia Pentaphylla)', IsTimber: true },
		{ Name: 'Pine (Pinus caribaea)', IsTimber: true },
		{ Name: 'Podo/Cypress (Podocarpus guatemalensis)', IsTimber: true },
		{ Name: 'Santa Maria (Calophyllum brasilliense var rekoi)', IsTimber: true },
		{ Name: 'Tubroos (Enterolobium cyclocarpum)', IsTimber: true },
		{ Name: 'Yemeri/San Juan (Vochysia Hondurensis)', IsTimber: true },
		{ Name: 'Barba Jolote (Acacia, & Pithecolobium spp.)', IsTimber: true },
		{ Name: 'Cabbage Bark (Lonchocarpus castilloi)', IsTimber: true },
		{ Name: 'Nargusta/Bullywood (Terminalia amazonia)', IsTimber: true },
		{ Name: 'Salmwood (Cordia allidora)', IsTimber: true },
		{ Name: 'Sapodilla - dead trees only (Achras zapota)', IsTimber: true },
		{ Name: 'Tamarind (Acacia & Pithecolobium spp.)', IsTimber: true },
		{ Name: 'Billy Webb (Sweetia Panamensia)', IsTimber: true },
		{ Name: 'Bullet Tree (Bucida Buceras)', IsTimber: true },
		{ Name: 'Ceiba/Cotton Tree (Ceiba octidentalis)', IsTimber: true },
		{ Name: 'Cortez (Tabebuia chrysantha)', IsTimber: true },
		{ Name: 'Mylady (Aspidosperma spp)', IsTimber: true },
		{ Name: 'Provision tree (Pachira aquatic)', IsTimber: true },
		{ Name: 'Quamwood (Schizolobium paraphybum)', IsTimber: true },
		{ Name: 'Madre Cacao (Gliricidia speium)', IsTimber: true },
		{ Name: 'Mylady Poles (Aspidosperma magalocarpon)', IsTimber: true },
		{ Name: 'Ziricote (Cordia Dodecandra)', IsTimber: true },
		{ Name: 'Mangrove (Rhizophora, Laguncularia & Avicennia spp)', IsTimber: true },
		{ Name: 'Hobillo (Astronium graveolens)', IsTimber: true },
		{ Name: 'Teak (Tectona grandis)', IsTimber: true },
		{ Name: 'Copa (Protium copal)', IsTimber: true },
		{ Name: 'Breadnut (Brosimum alicastrum)', IsTimber: true }
	];

	// Fruit species
	const fruitSpecies = [
		{ Name: 'Balam', IsTimber: false },
		{ Name: 'Breadnut', IsTimber: false },
		{ Name: 'Bri Bri', IsTimber: false },
		{ Name: 'Cow sap', IsTimber: false },
		{ Name: 'Chinese Plum', IsTimber: false },
		{ Name: 'Jackfruit', IsTimber: false },
		{ Name: 'Kinep', IsTimber: false },
		{ Name: 'Inga Edulis', IsTimber: false },
		{ Name: 'Monkey Cap', IsTimber: false },
		{ Name: 'Mammey sapote', IsTimber: false },
		{ Name: 'Mallay Apple', IsTimber: false },
		{ Name: 'Pacaya', IsTimber: false },
		{ Name: 'Rose Apple', IsTimber: false },
		{ Name: 'Sankil Che', IsTimber: false },
		{ Name: 'Star Apple', IsTimber: false },
		{ Name: 'Suriname Cherry', IsTimber: false },
		{ Name: 'Sweet Lime', IsTimber: false },
		{ Name: 'Velvet Apple', IsTimber: false },
		{ Name: 'Wax Apple', IsTimber: false },
		{ Name: 'Ixim Che', IsTimber: false },
		{ Name: 'Other', IsTimber: false }
	];

	const allSpecies = [...timberSpecies, ...fruitSpecies];

	// Seed TreeSpecies table
	const insertedSpecies = await db
		.insert(TreeSpecies) // Use TreeSpecies table
		.values(allSpecies)
		.onConflictDoNothing() // Handle conflicts (e.g., species already exist)
		.returning();

	console.log(`✅ Seeded ${insertedSpecies.length} tree species!`);

	// Check if we got a valid species ID
	const speciesId = insertedSpecies[0]?.Id; // Use Id here since that's the primary key

	if (!speciesId && insertedSpecies.length === 0) {
		console.log('ℹ️ No new species inserted (may already exist).');
	}
}

async function seed_trees() {
	console.log('🌳 Seeding trees...');

	// Example tree data using images from the perenual.com houseplant image directory
	const imageBaseUrl = 'https://perenual.com/storage/image/survey/houseplant';
	const trees = [
		{
			TreeName: 'Majestic Silver Fir',
			TreeSpecies: 1, // European Silver Fir
			Height: 15.7,
			Health: 'EXCELLENT',
			Age: 8,
			Image: `${imageBaseUrl}/1_houseplant.jpg`,
			Lat: 17.1875,
			Lng: -88.4921,
			PlantedBy: 1,
			PlantedOn: new Date('2018-03-15').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'White Fir Conservation',
			TreeSpecies: 3, // White Fir
			Height: 12.3,
			Health: 'GOOD',
			Age: 5,
			Image: `${imageBaseUrl}/2_houseplant.jpg`,
			Lat: 17.2544,
			Lng: -88.7731,
			PlantedBy: 2,
			PlantedOn: new Date('2020-06-22').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Southern Fraser Fir',
			TreeSpecies: 5, // Fraser Fir
			Height: 8.9,
			Health: 'FAIR',
			Age: 3,
			Image: `${imageBaseUrl}/3_houseplant.jpg`,
			Lat: 17.0426,
			Lng: -88.8231,
			PlantedBy: 3,
			PlantedOn: new Date('2022-01-10').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Golden Korean Fir Grove',
			TreeSpecies: 6, // Golden Korean Fir
			Height: 6.2,
			Health: 'GOOD',
			Age: 4,
			Image: `${imageBaseUrl}/4_houseplant.jpg`,
			Lat: 17.3851,
			Lng: -88.5624,
			PlantedBy: 1,
			PlantedOn: new Date('2021-04-18').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Blue Spanish Fir',
			TreeSpecies: 8, // Blue Spanish Fir
			Height: 9.1,
			Health: 'EXCELLENT',
			Age: 6,
			Image: `${imageBaseUrl}/5_houseplant.jpg`,
			Lat: 17.1129,
			Lng: -89.0438,
			PlantedBy: 2,
			PlantedOn: new Date('2019-09-05').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Struggling Noble Fir',
			TreeSpecies: 9, // Noble Fir
			Height: 4.3,
			Health: 'POOR',
			Age: 2,
			Image: `${imageBaseUrl}/6_houseplant.jpg`,
			Lat: 17.2216,
			Lng: -88.6402,
			PlantedBy: 3,
			PlantedOn: new Date('2023-02-28').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Red Full Moon Maple',
			TreeSpecies: 10, // Johin Japanese Maple
			Height: 7.8,
			Health: 'GOOD',
			Age: 7,
			Image: `${imageBaseUrl}/green.jpg`,
			Lat: 17.514,
			Lng: -88.8653,
			PlantedBy: 1,
			PlantedOn: new Date('2018-11-12').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: "Father David's Maple",
			TreeSpecies: 11, // Snakebark Maple
			Height: 11.2,
			Health: 'FAIR',
			Age: 9,
			Image: `${imageBaseUrl}/tropical.jpg`,
			Lat: 17.0843,
			Lng: -88.9326,
			PlantedBy: 2,
			PlantedOn: new Date('2016-08-04').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Amur Flame Maple',
			TreeSpecies: 13, // Flame Amur Maple
			Height: 6.5,
			Health: 'EXCELLENT',
			Age: 4,
			Image: `${imageBaseUrl}/flower.jpg`,
			Lat: 17.3376,
			Lng: -88.7124,
			PlantedBy: 3,
			PlantedOn: new Date('2021-10-30').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Ruby Slippers Maple',
			TreeSpecies: 15, // Ruby Slippers Amur Maple
			Height: 5.3,
			Health: 'GOOD',
			Age: 3,
			Image: `${imageBaseUrl}/1_flower.jpg`,
			Lat: 17.1653,
			Lng: -88.5217,
			PlantedBy: 1,
			PlantedOn: new Date('2022-05-14').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Paperbark Maple Old Growth',
			TreeSpecies: 16, // Paperbark Maple
			Height: 14.8,
			Health: 'GOOD',
			Age: 12,
			Image: `${imageBaseUrl}/2_flower.jpg`,
			Lat: 17.4563,
			Lng: -88.9812,
			PlantedBy: 2,
			PlantedOn: new Date('2013-07-23').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Fullmoon Maple Sanctuary',
			TreeSpecies: 17, // Fullmoon Maple
			Height: 8.7,
			Health: 'EXCELLENT',
			Age: 6,
			Image: `${imageBaseUrl}/3_flower.jpg`,
			Lat: 17.2897,
			Lng: -88.6318,
			PlantedBy: 3,
			PlantedOn: new Date('2019-04-11').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Fernleaf Full Moon Maple',
			TreeSpecies: 18, // Cutleaf Fullmoon Maple
			Height: 7.4,
			Health: 'FAIR',
			Age: 5,
			Image: `${imageBaseUrl}/4_flower.jpg`,
			Lat: 17.1387,
			Lng: -88.7945,
			PlantedBy: 1,
			PlantedOn: new Date('2020-03-29').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Cascade Japanese Maple',
			TreeSpecies: 22, // Green Cascade Maple
			Height: 5.9,
			Health: 'GOOD',
			Age: 4,
			Image: `${imageBaseUrl}/0_pink_flower.jpg`,
			Lat: 17.3042,
			Lng: -88.5123,
			PlantedBy: 2,
			PlantedOn: new Date('2021-06-08').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Oregon Big Leaf Maple',
			TreeSpecies: 23, // Big Leaf Maple
			Height: 16.2,
			Health: 'GOOD',
			Age: 10,
			Image: `${imageBaseUrl}/indoor.jpg`,
			Lat: 17.4159,
			Lng: -88.8147,
			PlantedBy: 3,
			PlantedOn: new Date('2015-09-17').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Japanese Maple Specimen',
			TreeSpecies: 27, // Japanese Maple
			Height: 9.3,
			Health: 'EXCELLENT',
			Age: 7,
			Image: `${imageBaseUrl}/aesthetic.jpg`,
			Lat: 17.1764,
			Lng: -88.6734,
			PlantedBy: 1,
			PlantedOn: new Date('2018-05-19').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Samurai Maple',
			TreeSpecies: 28, // Aka Shigitatsu Sawa Japanese Maple
			Height: 5.6,
			Health: 'GOOD',
			Age: 4,
			Image: `${imageBaseUrl}/0_fruits.jpg`,
			Lat: 17.2125,
			Lng: -88.6951,
			PlantedBy: 2,
			PlantedOn: new Date('2021-08-07').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Ao Shime No Uchi Maple',
			TreeSpecies: 30, // Ao Shime No Uchi Japanese Maple
			Height: 4.8,
			Health: 'GOOD',
			Age: 3,
			Image: `${imageBaseUrl}/1_fruits.jpg`,
			Lat: 17.2911,
			Lng: -88.7544,
			PlantedBy: 3,
			PlantedOn: new Date('2022-03-12').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Candicans White Fir',
			TreeSpecies: 4, // Candicans White Fir
			Height: 7.9,
			Health: 'FAIR',
			Age: 5,
			Image: `${imageBaseUrl}/2_fruits.jpg`,
			Lat: 17.0734,
			Lng: -88.6013,
			PlantedBy: 1,
			PlantedOn: new Date('2020-04-29').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Alpine Rocky Mountain Fir',
			TreeSpecies: 7, // Alpine Fir
			Height: 10.5,
			Health: 'GOOD',
			Age: 6,
			Image: `${imageBaseUrl}/3_fruits.jpg`,
			Lat: 17.3289,
			Lng: -88.5419,
			PlantedBy: 2,
			PlantedOn: new Date('2019-11-08').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Pyramidalis Silver Fir',
			TreeSpecies: 2, // Pyramidalis Silver Fir
			Height: 13.8,
			Health: 'EXCELLENT',
			Age: 9,
			Image: `${imageBaseUrl}/fruits.jpg`,
			Lat: 17.4012,
			Lng: -88.7338,
			PlantedBy: 3,
			PlantedOn: new Date('2016-10-24').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Classic Amur Maple',
			TreeSpecies: 12, // Amur Maple
			Height: 8.4,
			Health: 'EXCELLENT',
			Age: 8,
			Image: `${imageBaseUrl}/watering.jpg`,
			Lat: 17.1429,
			Lng: -88.9641,
			PlantedBy: 1,
			PlantedOn: new Date('2017-09-03').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Red Rhapsody Maple',
			TreeSpecies: 14, // Red Rhapsody Amur Maple
			Height: 6.8,
			Health: 'GOOD',
			Age: 5,
			Image: `${imageBaseUrl}/0_watering.jpg`,
			Lat: 17.3647,
			Lng: -88.6531,
			PlantedBy: 2,
			PlantedOn: new Date('2020-05-17').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Mocha Rose Big Leaf',
			TreeSpecies: 24, // Mocha Rose Big Leaf Maple
			Height: 12.7,
			Health: 'FAIR',
			Age: 8,
			Image: `${imageBaseUrl}/1_watering.jpg`,
			Lat: 17.4826,
			Lng: -88.8921,
			PlantedBy: 3,
			PlantedOn: new Date('2017-04-21').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Flamingo Boxelder',
			TreeSpecies: 25, // Flamingo Boxelder
			Height: 9.6,
			Health: 'GOOD',
			Age: 6,
			Image: `${imageBaseUrl}/sunlight.jpg`,
			Lat: 17.0921,
			Lng: -88.7493,
			PlantedBy: 1,
			PlantedOn: new Date('2019-08-16').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: "Kelly's Gold Box Elder",
			TreeSpecies: 26, // Kelly's Gold Boxelder
			Height: 7.3,
			Health: 'EXCELLENT',
			Age: 5,
			Image: `${imageBaseUrl}/carelevel.jpg`,
			Lat: 17.2398,
			Lng: -88.4852,
			PlantedBy: 2,
			PlantedOn: new Date('2020-07-03').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Attaryi Fullmoon Maple',
			TreeSpecies: 19, // Attaryi Fullmoon Maple
			Height: 6.1,
			Health: 'GOOD',
			Age: 4,
			Image: `${imageBaseUrl}/0_carelevel.jpg`,
			Lat: 17.3782,
			Lng: -88.6913,
			PlantedBy: 3,
			PlantedOn: new Date('2021-05-22').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: 'Golden Fullmoon Maple',
			TreeSpecies: 20, // Golden Fullmoon Maple
			Height: 5.7,
			Health: 'EXCELLENT',
			Age: 3,
			Image: `${imageBaseUrl}/maintenance.jpg`,
			Lat: 17.1278,
			Lng: -88.8132,
			PlantedBy: 1,
			PlantedOn: new Date('2022-04-09').toISOString().split('T')[0],
			Status: 'APPROVED'
		},
		{
			TreeName: "Emmett's Pumpkin Maple",
			TreeSpecies: 21, // Emmett's Pumpkin Fullmoon Maple
			Height: 4.9,
			Health: 'FAIR',
			Age: 3,
			Image: `${imageBaseUrl}/medicinal.jpg`,
			Lat: 17.2563,
			Lng: -88.5931,
			PlantedBy: 2,
			PlantedOn: new Date('2022-06-17').toISOString().split('T')[0],
			Status: 'APPROVED'
		}
	];

	// @ts-expect-error The Tree Health is correct.
	await db.insert(Trees).values(trees);
}

if (SEED_TYPE == 'species') {
	seed()
		.then(() => {
			console.log('✅ Seeding completed!');
		})
		.catch((err) => {
			console.error('Unhandled error:', err);
			process.exit(1);
		});
} else if (SEED_TYPE == 'trees') {
	seed_trees()
		.then(() => {
			console.log('✅ Seeding completed!');
		})
		.catch((err) => {
			console.error('Unhandled error:', err);
			process.exit(1);
		});
} else if (SEED_TYPE == 'reasons') {
	seed_planting_reasons()
		.then(() => {
			console.log('✅ Seeding completed!');
		})
		.catch((err) => {
			console.error('Unhandled error:', err);
			process.exit(1);
		});
} else {
	console.error('❌ Invalid SEED_TYPE. Use "species", "trees", or "reasons".');
	console.error('Usage: npm run seed <species|trees|reasons>');
	process.exit(1);
}
