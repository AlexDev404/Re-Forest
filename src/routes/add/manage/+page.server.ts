import { db } from '$lib/server/db/index.js';
import { trees } from '$lib/server/db/schema';
import { fail, redirect, type Actions } from '@sveltejs/kit';
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
	createTree: async (event) => {
		const form = await superValidate(event, zod(treeSchema));
console.log(form.data)
		if (!form.valid) {
			return fail(400, { form });
		}

		const { tree_name, tree_image, tree_lat, tree_lng, tree_height, tree_age, tree_species } =
			form.data;

		try {
			const new_tree: { id: number }[] = await db
				.insert(trees)
				.values({
					treeName: tree_name,
					// image: tree_image,
                    image: "https://i.ibb.co/VczSY0xg/blob.jpg",
					lat: tree_lat,
					lng: tree_lng,
					height: tree_height,
					age: tree_age,
					treeSpecies: 1 // Assuming you have a way to get the tree species ID from the name
				})
				.returning({ id: trees.id });

			throw redirect(303, `/explore?tree_id=${new_tree[0].id}`);
		} catch (error) {
			console.error(error);
			setError(form, 'tree_species', 'Failed to create the tree');
			return fail(500, { form });
		}
	}
};
