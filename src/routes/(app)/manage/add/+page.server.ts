import { DEBUG } from '$env/static/private';
import { Tree } from '$lib/class/Tree';
import { db } from '$lib/server/db/';
import { PlantingReasons } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, isActionFailure, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const treeSchema = z.object({
	tree_name: z.string().min(1).max(50),
	tree_image: z.string().url(),
	tree_lat: z.number().min(-90).max(90),
	tree_lng: z.number().min(-180).max(180),
	tree_height: z.number().min(0).max(100).optional(),
	tree_age: z.number().min(0).max(100).optional(),
	tree_species: z.string(), // Will contain the species ID
	planter_type: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
	organization_name: z.string().max(255).optional(),
	planting_reason_id: z.string().default('1'), // Changed from planting_reason to planting_reason_id
	hashtags: z.string().max(500).optional(),
	quantity: z.number().min(1).optional(),
	area_hectares: z.number().min(0).optional()
});

export const load: PageServerLoad = async (event) => {
	const request = event.request;

	// Fetch all planting reasons from database
	const plantingReasons = await db.select().from(PlantingReasons);

	return {
		form: await superValidate(request, zod4(treeSchema)),
		plantingReasons
	};
};

export const actions: Actions = {
	default: async (event) => {
		const request = event.request;
		const form = await superValidate(request, zod4(treeSchema));
		const user = event.locals.user;

		if (!user) {
			setError(form, '', 'You must be logged in to create a tree');
			return fail(401, { form });
		}

		if (DEBUG) {
			typical_development_notice();
			console.log(form.data);
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			tree_name,
			tree_image,
			tree_lat,
			tree_lng,
			tree_height,
			tree_age,
			tree_species,
			planter_type,
			organization_name,
			planting_reason_id,
			hashtags,
			quantity,
			area_hectares
		} = form.data;

		try {
			// Convert the tree species ID from string to number (if provided)
			let speciesId = 0; // Default to 0 if not provided

			if (tree_species && tree_species.trim() !== '') {
				speciesId = parseInt(tree_species, 10);

				if (isNaN(speciesId)) {
					setError(form, 'tree_species', 'Invalid species selection');
					return fail(400, { form });
				}
			} else {
				setError(form, 'tree_species', 'Plant species is required');
				return fail(400, { form });
			}

			// Convert planting_reason_id to number if provided
			let plantingReasonIdNum: number | null = null;
			if (planting_reason_id && planting_reason_id.trim() !== '') {
				plantingReasonIdNum = parseInt(planting_reason_id, 10);
				if (isNaN(plantingReasonIdNum)) {
					setError(form, 'planting_reason_id', 'Invalid planting reason selection');
					return fail(400, { form });
				}
			}

			const new_tree = await Tree.create(
				tree_name,
				speciesId, // Use the parsed species ID (0 if not provided)
				tree_height ?? 0,
				'EXCELLENT', // Placeholder health status
				tree_age ?? 0,
				tree_image,
				tree_lat,
				tree_lng,
				user.Id,
				planter_type,
				organization_name ?? null,
				hashtags ?? null,
				quantity ?? 1,
				area_hectares ?? null,
				plantingReasonIdNum // Pass the planting reason ID
			);

			if (new_tree instanceof Error) {
				console.error('Tree creation failed:', new_tree.message);
				setError(form, 'tree_name', new_tree.message);
				return fail(500, { form });
			}
			if (DEBUG) {
				typical_development_notice();
				console.log('New tree created with ID:', new_tree.Id);
			}
			throw redirect(303, `/confirmation?tree_id=${new_tree.Id}`);
		} catch (error) {
			if (isActionFailure(error)) {
				return error;
			}
			if (isRedirect(error)) {
				throw error;
			}

			setError(form, 'tree_species', 'Failed to create the tree');
			console.error(error);
			return fail(500, { form });
		}
	}
};
