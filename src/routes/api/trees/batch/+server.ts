import { DEBUG } from '$env/static/private';
import { Tree } from '$lib/class/Tree';
import { typical_development_notice } from '$lib/utility/typicals';
import { json, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

const treeBatchSchema = z.object({
	trees: z.array(
		z.object({
			tree_name: z.string().min(1).max(50),
			tree_image: z.string().url(),
			tree_lat: z.number().min(-90).max(90),
			tree_lng: z.number().min(-180).max(180),
			tree_height: z.number().min(0).max(100).optional(),
			tree_age: z.number().min(0).max(100).optional(),
			tree_species: z.string(), // Will contain the species ID
			planter_type: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
			organization_name: z.string().max(255).optional().nullable(),
			planting_reason_id: z.string().default('1'),
			hashtags: z.string().max(500).optional().nullable(),
			quantity: z.number().min(1).optional(),
			area_hectares: z.number().min(0).optional().nullable()
		})
	)
});

export async function POST(event: RequestEvent) {
	const user = event.locals.user;

	if (!user) {
		return json({ success: false, error: 'You must be logged in to create trees' }, { status: 401 });
	}

	try {
		const body = await event.request.json();
		const validationResult = treeBatchSchema.safeParse(body);

		if (!validationResult.success) {
			return json(
				{
					success: false,
					error: 'Invalid request data',
					details: validationResult.error.issues
				},
				{ status: 400 }
			);
		}

		const { trees } = validationResult.data;
		const createdTrees: number[] = [];

		// Process each tree in the batch
		for (const treeData of trees) {
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
			} = treeData;

			// Convert the tree species ID from string to number
			let speciesId = 0;

			if (tree_species && tree_species.trim() !== '') {
				speciesId = parseInt(tree_species, 10);

				if (isNaN(speciesId)) {
					return json(
						{
							success: false,
							error: `Invalid species selection for tree: ${tree_name}`
						},
						{ status: 400 }
					);
				}
			} else {
				return json(
					{
						success: false,
						error: `Plant species is required for tree: ${tree_name}`
					},
					{ status: 400 }
				);
			}

			// Convert planting_reason_id to number if provided
			let plantingReasonIdNum: number | null = null;
			if (planting_reason_id && planting_reason_id.trim() !== '') {
				plantingReasonIdNum = parseInt(planting_reason_id, 10);
				if (isNaN(plantingReasonIdNum)) {
					return json(
						{
							success: false,
							error: `Invalid planting reason selection for tree: ${tree_name}`
						},
						{ status: 400 }
					);
				}
			}

			const new_tree = await Tree.create(
				tree_name,
				speciesId,
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
				plantingReasonIdNum
			);

			if (new_tree instanceof Error) {
				console.error('Tree creation failed:', new_tree.message);
				return json(
					{
						success: false,
						error: `Failed to create tree: ${tree_name}`,
						details: new_tree.message
					},
					{ status: 500 }
				);
			}

			createdTrees.push(new_tree.Id);

			if (DEBUG) {
				typical_development_notice();
				console.log('New tree created with ID:', new_tree.Id);
			}
		}

		return json({
			success: true,
			message: `Successfully created ${createdTrees.length} trees`,
			treeIds: createdTrees
		});
	} catch (error) {
		console.error('Batch tree creation error:', error);
		return json(
			{
				success: false,
				error: 'Failed to create trees',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
