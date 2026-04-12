import { Hono } from 'hono';
import { z } from 'zod';
import type { UserData } from '../repositories/UserRepository';
import { TreeRepository } from '../repositories/TreeRepository';

const trees = new Hono();

/**
 * GET /trees - Get trees with filters
 */
trees.get('/', async (c) => {
  try {
    const q = c.req.query('q') || '';
    const health = c.req.query('health') || 'all';
    const date = c.req.query('date') || 'all';
    const height = c.req.query('height') || 'all';

    const result = await TreeRepository.getFiltered({ q, health, date, height });
    return c.json(result);
  } catch (error) {
    console.error('Error fetching trees:', error);
    return c.json({ error: 'Failed to fetch trees' }, 500);
  }
});

/**
 * GET /trees/approved - Get all approved trees (enriched)
 */
trees.get('/approved', async (c) => {
  try {
    const result = await TreeRepository.getAllApproved();
    return c.json({ trees: result });
  } catch (error) {
    console.error('Error fetching approved trees:', error);
    return c.json({ error: 'Failed to fetch approved trees' }, 500);
  }
});

const treeBatchSchema = z.object({
  trees: z.array(
    z.object({
      tree_name: z.string().min(1).max(50),
      tree_image: z.string().url(),
      tree_lat: z.number().min(-90).max(90),
      tree_lng: z.number().min(-180).max(180),
      tree_height: z.number().min(0).max(100).optional(),
      tree_age: z.number().min(0).max(100).optional(),
      tree_species: z.string(),
      planter_type: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
      organization_name: z.string().max(255).optional().nullable(),
      planting_reason_id: z.string().default('1'),
      hashtags: z.string().max(500).optional().nullable(),
      quantity: z.number().min(1).optional(),
      area_hectares: z.number().min(0).optional().nullable()
    })
  )
});

/**
 * POST /trees/batch - Batch create trees
 */
trees.post('/batch', async (c) => {
  const user = c.get('user') as UserData | null;
  if (!user) {
    return c.json({ success: false, error: 'You must be logged in to create trees' }, 401);
  }

  try {
    const body = await c.req.json();
    const validation = treeBatchSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        { success: false, error: 'Invalid request data', details: validation.error.issues },
        400
      );
    }

    const { trees: treesData } = validation.data;
    const createdTrees: number[] = [];

    for (const treeData of treesData) {
      let speciesId = parseInt(treeData.tree_species, 10);
      if (isNaN(speciesId) || !treeData.tree_species.trim()) {
        return c.json(
          { success: false, error: `Invalid or missing species for tree: ${treeData.tree_name}` },
          400
        );
      }

      let plantingReasonIdNum: number | null = null;
      if (treeData.planting_reason_id?.trim()) {
        plantingReasonIdNum = parseInt(treeData.planting_reason_id, 10);
        if (isNaN(plantingReasonIdNum)) {
          return c.json(
            { success: false, error: `Invalid planting reason for tree: ${treeData.tree_name}` },
            400
          );
        }
      }

      const newTree = await TreeRepository.create({
        treeName: treeData.tree_name,
        treeSpecies: speciesId,
        height: treeData.tree_height ?? 0,
        health: 'EXCELLENT',
        age: treeData.tree_age ?? 0,
        image: treeData.tree_image,
        lat: treeData.tree_lat,
        lng: treeData.tree_lng,
        plantedBy: user.Id,
        planterType: treeData.planter_type,
        organizationName: treeData.organization_name ?? null,
        hashtags: treeData.hashtags ?? null,
        quantity: treeData.quantity ?? 1,
        areaHectares: treeData.area_hectares ?? null,
        plantingReasonId: plantingReasonIdNum
      });

      createdTrees.push(newTree.Id);
    }

    return c.json({
      success: true,
      message: `Successfully created ${createdTrees.length} trees`,
      treeIds: createdTrees
    });
  } catch (error) {
    console.error('Batch tree creation error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to create trees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
});

const treeSchema = z.object({
  tree_name: z.string().min(1).max(50),
  tree_image: z.string().url(),
  tree_lat: z.number().min(-90).max(90),
  tree_lng: z.number().min(-180).max(180),
  tree_height: z.number().min(0).max(100).optional(),
  tree_age: z.number().min(0).max(100).optional(),
  tree_species: z.string(),
  planter_type: z.enum(['INDIVIDUAL', 'ORGANIZATION']),
  organization_name: z.string().max(255).optional(),
  planting_reason_id: z.string().default('1'),
  hashtags: z.string().max(500).optional(),
  quantity: z.number().min(1).optional(),
  area_hectares: z.number().min(0).optional()
});

/**
 * POST /trees - Create a single tree
 */
trees.post('/', async (c) => {
  const user = c.get('user') as UserData | null;
  if (!user) {
    return c.json({ success: false, error: 'You must be logged in to create a tree' }, 401);
  }

  try {
    const body = await c.req.json();
    const validation = treeSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        { success: false, error: 'Invalid request data', details: validation.error.issues },
        400
      );
    }

    const data = validation.data;

    let speciesId = parseInt(data.tree_species, 10);
    if (isNaN(speciesId) || !data.tree_species.trim()) {
      return c.json({ success: false, error: 'Plant species is required' }, 400);
    }

    let plantingReasonIdNum: number | null = null;
    if (data.planting_reason_id?.trim()) {
      plantingReasonIdNum = parseInt(data.planting_reason_id, 10);
      if (isNaN(plantingReasonIdNum)) {
        return c.json({ success: false, error: 'Invalid planting reason' }, 400);
      }
    }

    const newTree = await TreeRepository.create({
      treeName: data.tree_name,
      treeSpecies: speciesId,
      height: data.tree_height ?? 0,
      health: 'EXCELLENT',
      age: data.tree_age ?? 0,
      image: data.tree_image,
      lat: data.tree_lat,
      lng: data.tree_lng,
      plantedBy: user.Id,
      planterType: data.planter_type,
      organizationName: data.organization_name ?? null,
      hashtags: data.hashtags ?? null,
      quantity: data.quantity ?? 1,
      areaHectares: data.area_hectares ?? null,
      plantingReasonId: plantingReasonIdNum
    });

    return c.json({ success: true, treeId: newTree.Id });
  } catch (error) {
    console.error('Tree creation error:', error);
    return c.json(
      { success: false, error: 'Failed to create tree', details: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * DELETE /trees/:id - Delete a tree
 */
trees.delete('/:id', async (c) => {
  const user = c.get('user') as UserData | null;
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ error: 'Invalid tree ID' }, 400);
    }
    await TreeRepository.delete(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting tree:', error);
    return c.json({ error: 'Failed to delete tree' }, 500);
  }
});

export default trees;
