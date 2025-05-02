import { Tree } from '$lib/class/Tree';
import { fail, redirect, type Actions, type PageServerLoad } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const treeSchema = z.object({
	tree_name: z.string().min(1, "Tree name is required").max(50),
	tree_image: z.string().url("A valid image URL is required"),
	tree_lat: z.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90"),
	tree_lng: z.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180"),
	tree_height: z.number().min(0, "Height must be non-negative").max(100),
	tree_age: z.number().min(0, "Age must be non-negative").max(100),
	tree_species: z.string().min(1, "Tree species is required").max(50)
});


export const load: PageServerLoad = async (event) => {
	return await superValidate(event, zod(treeSchema));
	return {
		form: await superValidate(event, zod(treeSchema))}
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(treeSchema));

		if (!form.valid) {
			console.warn("Validation failed", form.errors);
			return fail(400, { form });
		}

		const user = event.locals.user;

		try {
			const {
				tree_name,
				tree_image,
				tree_lat,
				tree_lng,
				tree_height,
				tree_age,
				tree_species
			} = form.data;

			// Attempt to parse tree_species into a number if expected
			const speciesId = parseInt(tree_species);
			if (isNaN(speciesId)) {
				setError(form, 'tree_species', 'Tree species must be a valid number ID');
				return fail(400, { form });
			}

			const newTree = await Tree.create(
				tree_name,
				speciesId,
				tree_height,
				'GOOD', // Placeholder health status
				tree_age,
				tree_image,
				tree_lat,
				tree_lng,
				user?.Id ?? 1
			);

			// If Tree.create returns an Error, handle it
			if (newTree instanceof Error) {
				console.error("Tree creation failed:", newTree.message);
				setError(form, 'tree_name', newTree.message);
				return fail(500, { form });
			}

			console.log("Tree created with ID:", newTree.Id);
			
		} catch (error: any) {
			console.error("Unhandled error:", error);
			setError(form, '', 'Unexpected error occurred. Please try again.');
			return fail(500, { form });
		}
		return redirect(303, '/manage');
	}
};
