import { db } from '$lib/server/db';
import { TreeSpecies } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { desc, ilike } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
	try {
		// Get the search query from the URL params
		const searchQuery = event.url.searchParams.get('q') || '';
		const limit = parseInt(event.url.searchParams.get('limit') || '20');

		let query = db
			.select({
				id: TreeSpecies.Id,
				name: TreeSpecies.Name
			})
			.from(TreeSpecies);

		// Apply search filter if query exists
		if (searchQuery) {
			query = query.where(ilike(TreeSpecies.Name, `%${searchQuery}%`));
		}

		// Apply ordering
		query = query.orderBy(desc(TreeSpecies.Id));

		// Apply limit
		query = query.limit(limit);

		const species = await query;

		return json({
			species
		});
	} catch (error) {
		console.error('Error fetching tree species:', error);
		return json({ error: 'Failed to fetch tree species' }, { status: 500 });
	}
}
