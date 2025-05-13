// scripts/seed.ts
import { TreeSpecies, Trees } from '../src/lib/server/db/schema.js'; // Import correct table names
import { db } from './support/db.js';
import type { SourceData } from './types/SourceData.ts';
const SEED_TYPE: 'species' | 'trees' = process.argv[2] as 'species' | 'trees';

async function seed() {
	console.log('🌱 Seeding the database...');

	const response = await fetch(
		'https://perenual.com/api/species-list?key=sk-tzM06822d8ca57cc110407&page=1'
	);
	const data: SourceData = await response.json();
	const speciesList = data.data.map((species) => ({
		Name: species.common_name
	}));

	// Seed TreeSpecies table
	const insertedSpecies = await db
		.insert(TreeSpecies) // Use TreeSpecies table
		.values(speciesList)
		.onConflictDoNothing() // Handle conflicts (e.g., species already exist)
		.returning();

	// Check if we got a valid species ID
	const speciesId = insertedSpecies[0]?.Id; // Use Id here since that's the primary key

	if (!speciesId) {
		console.error('❌ Failed to seed species or species already exist. Aborting tree seed.');
		process.exit(1); // Abort if species insertion failed
	}
}

async function seed_trees() {
	console.log('🌳 Seeding trees...');

	// Example tree data using the sample API response
	const trees = [
		{
			TreeName: 'Majestic Silver Fir',
			TreeSpecies: 1, // European Silver Fir
			Height: 15.7,
			Health: 'EXCELLENT',
			Age: 8,
			Image:
				'https://perenual.com/storage/species_image/1_abies_alba/medium/1536px-Abies_alba_SkalitC3A9.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/3_abies_concolor/medium/52292935430_f4f3b22614_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/5_abies_fraseri/medium/36843539702_e80fc436e0_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/6_abies_koreana_aurea/medium/49235570926_99ec10781d_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/8_abies_pinsapo_glauca/medium/21657514018_c0d9fed9f4_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/9_abies_procera/medium/49107504112_6bd7effb8b_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/10_acer_johin/medium/pexels-photo-2183508.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/11_acer_davidii/medium/6868591754_f4ac5b0510_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/13_acer_ginnala_flame/medium/pexels-photo-1649190.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/15_acer_ginnala_ruby_slippers/medium/pexels-photo-1640820.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/16_acer_griseum/medium/5158906371_ed08a86876_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/17_acer_japonicum/medium/7175475239_52543c51b3_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/18_acer_japonicum_aconitifolium/medium/23528789198_c419363323_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/22_acer_japonicum_green_cascade/medium/4847225395_2509ee2bfe_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/23_acer_macrophyllum/medium/52135137216_8a124b5188_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/27_acer_palmatum/medium/2560px-Acer_palmatum_27Bloodgood27_kz01.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/28_acer_palmatum_aka_shigitatsu_sawa/medium/Acer_palmatum_Aka_shigitatsu_sawa_2zz.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/30_acer_palmatum_ao_shime_no_uchi/medium/Acer_palmatum_Ao_shime_no_uchi_3zz.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/4_abies_concolor_candicans/medium/49283844888_332c9e46f2_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/7_abies_lasiocarpa/medium/51002756843_74fae3c2fa_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/2_abies_alba_pyramidalis/medium/49255769768_df55596553_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/12_acer_ginnala/medium/10476032513_76ca899bc4_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/14_acer_ginnala_mondy/medium/pexels-photo-1789879.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/24_acer_macrophyllum_mocha_rose/medium/4715169892_220a9d39f6_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/25_acer_negundo_flamingo/medium/5867345385_a9dff5bee7_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/26_acer_negundo_kellys_gold/medium/28819730054_e2a2b797c9_b.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/19_acer_japonicum_attaryi/medium/pexels-photo-669323.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/20_acer_japonicum_aureum/medium/2560px-Acer_shirasawanum_27Aureum27.jpg',
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
			Image:
				'https://perenual.com/storage/species_image/21_acer_japonicum_emmetts_pumpkin/medium/Acer_shirasawanum_28golden_fullmoon_maple29_2_284633285838129.jpg',
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
} else {
	console.error('❌ Invalid SEED_TYPE. Use "species" or "trees".');
	console.error('Usage: npm run seed <species|trees>');
	process.exit(1);
}
