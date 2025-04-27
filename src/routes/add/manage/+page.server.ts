import { DEBUG } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { Trees } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, isActionFailure, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const treeSchema = z.object({
	tree_name: z.string().min(1).max(50),
	tree_image: z.string().url(),
	tree_lat: z.number().min(-90).max(90),
	tree_lng: z.number().min(-180).max(180),
	tree_height: z.number().min(0).max(100),
	tree_age: z.number().min(0).max(100),
	tree_species: z.string().min(1).max(50)
});

export const load: PageServerLoad = async (event) => {
	return await superValidate(event, zod(treeSchema));
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(treeSchema));
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

		const { tree_name, tree_image, tree_lat, tree_lng, tree_height, tree_age, tree_species } =
			form.data;

		try {
			const new_tree = await db
				.insert(Trees)
				.values({
					TreeName: tree_name,
					Image: tree_image,
					Lat: tree_lat,
					Lng: tree_lng,
					Height: tree_height,
					Health: 'EXCELLENT', // Assuming you have a way to get the health status from the enum
					PlantedBy: user.Id,
					Age: tree_age,
					TreeSpecies: 1 // Assuming you have a way to get the tree species ID from the name
				})
				.returning();

			if (DEBUG) {
				typical_development_notice();
				console.log('New tree created:', new_tree[0]);
			}
			throw redirect(303, `/explore?tree_id=${new_tree[0].Id}`);
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
