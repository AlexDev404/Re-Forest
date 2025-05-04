// file: src/routes/manage/+page.server.ts
import { DEBUG } from '$env/static/private';
import { Tree } from '$lib/class/Tree';
import { User } from '$lib/class/User';
import { typical_development_notice } from '$lib/utility/typicals';
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

	if (JSON.parse(DEBUG)) {
		typical_development_notice();
		console.log('Tree data:', treeData);
	}
	return { trees: treeData };
};
