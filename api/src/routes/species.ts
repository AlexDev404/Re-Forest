import { Hono } from 'hono';
import { TreeRepository } from '../repositories/TreeRepository';

const species = new Hono();

/**
 * GET /tree-species - Search/list tree species
 */
species.get('/', async (c) => {
  try {
    const q = c.req.query('q') || '';
    const limit = parseInt(c.req.query('limit') || '20');
    const isTimber = c.req.query('is_timber');

    const result = await TreeRepository.getSpecies({
      q,
      limit,
      isTimber: isTimber ?? undefined
    });

    return c.json({ species: result });
  } catch (error) {
    console.error('Error fetching tree species:', error);
    return c.json({ error: 'Failed to fetch tree species' }, 500);
  }
});

export default species;
