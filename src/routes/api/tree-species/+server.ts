import { db } from '$lib/server/db';
import { TreeSpecies } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { and, desc, eq, ilike } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
	try {
		// Get the search query from the URL params
		const searchQuery = event.url.searchParams.get('q') || '';
		const limit = parseInt(event.url.searchParams.get('limit') || '20');
		const isTimber = event.url.searchParams.get('is_timber'); // Get is_timber filter

		let query = db
			.select({
				id: TreeSpecies.Id,
				name: TreeSpecies.Name
			})
			.from(TreeSpecies);

		// Build filter conditions
		const conditions = [];
		
		// Apply search filter if query exists
		if (searchQuery) {
			conditions.push(ilike(TreeSpecies.Name, `%${searchQuery}%`));
		}
		
		// Apply is_timber filter if provided
		if (isTimber !== null) {
			const isTimberBool = isTimber === 'true';
			conditions.push(eq(TreeSpecies.IsTimber, isTimberBool));
		}
		
		// Apply all conditions
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
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
