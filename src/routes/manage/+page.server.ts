// file: src/routes/manage/+page.server.ts
import { Tree } from '$lib/class/Tree';
import { User } from '$lib/class/User';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const trees = await Tree.getAll();

	const treePromises = trees.map(async (tree) => ({
		Id: tree.Id,
		TreeName: tree.TreeName,
		TreeSpecies: tree.TreeSpecies,
		Height: tree.Height,
		Health: tree.Health,
		Age: tree.Age,
		Image: tree.Image,
		Lat: tree.Lat,
		Lng: tree.Lng,
		PlantedBy: tree.PlantedBy ? { ...(await User.findById(tree.PlantedBy)) } : null,
		PlantedOn: tree.PlantedOn !== null ? tree.PlantedOn.toISOString() : null,
		CreatedAt: tree.CreatedAt !== null ? tree.CreatedAt.toISOString() : null,
		UpdatedAt: tree.UpdatedAt !== null ? tree.UpdatedAt.toISOString() : null
	}));

	const treeData = await Promise.all(treePromises);
	return { trees: treeData };
};

export const actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user || locals.user.Role === 3) {
			return { success: false, error: 'Unauthorized' };
		}
		const formData = await request.formData();
		const treeId = formData.get('treeId');

		if (!treeId) {
			return { success: false, error: 'Tree ID is required' };
		}

		try {
			await Tree.delete(Number(treeId));
			return { success: true };
		} catch (error) {
			console.error('Error deleting tree:', error);
			return { success: false, error: 'Failed to delete tree' };
		}
	}
};
