// file: src/routes/manage/+page.server.ts
import { DEBUG, VERBOSE } from '$env/static/private';
import { Tree } from '$lib/class/Tree';
import type { PageServerLoad } from './$types';

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
    if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)){
        console.log('Tree data:', treeData);
    }
    return { trees: treeData };
};