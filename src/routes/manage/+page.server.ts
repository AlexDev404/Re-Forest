// file: src/routes/manage/+page.server.ts
import type { PageServerLoad } from './$types';
import { Tree } from '$lib/class/Tree';

export const load: PageServerLoad = async () => {
	const trees = await Tree.getAll();
  
	const treeData = trees.map(tree => ({
		Id: tree.Id,
		TreeName: tree.TreeName,
		TreeSpecies: tree.TreeSpecies,
		Height: tree.Height,
		Health: tree.Health,
		Age: tree.Age,
		Image: tree.Image,
		Lat: tree.Lat,
		Lng: tree.Lng,
		PlantedBy: tree.PlantedBy,
		PlantedOn: tree.PlantedOn.toISOString(),
		CreatedAt: tree.CreatedAt.toISOString(),
		UpdatedAt: tree.UpdatedAt.toISOString()
	}));
	return { trees: treeData };
};

export const actions = {
	delete: async ({ request }) => {
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
