import { db } from '$lib/server/db';
import { TreeSpecies, Trees, User } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { and, count, eq, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	// Authenticate user and check permissions
	if (!user) {
		throw redirect(307, '/auth/login');
	}

	// Check if user is admin or environmentalist (roles 1 and 2)
	if (user.Role !== 1 && user.Role !== 2) {
		throw redirect(307, '/');
	}

	// Calculate summary metrics
	const totalTreesResult = await db.select({ count: count() }).from(Trees);
	const totalTrees = totalTreesResult[0].count;

	const totalSpeciesResult = await db.select({ count: count() }).from(TreeSpecies);
	const totalSpecies = totalSpeciesResult[0].count;

	const activeContributorsResult = await db
		.select({ count: count(User.Id) })
		.from(Trees)
		.innerJoin(User, eq(Trees.PlantedBy, User.Id))
		.where(eq(Trees.Status, 'APPROVED'));
	const activeContributors = activeContributorsResult[0].count;

	// Get trees planted in the current month
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	const treesThisMonthResult = await db
		.select({ count: count() })
		.from(Trees)
		.where(
			and(
				gte(Trees.PlantedOn, firstDayOfMonth.toISOString().split('T')[0]),
				eq(Trees.Status, 'APPROVED')
			)
		);
	const treesThisMonth = treesThisMonthResult[0].count;

	// Calculate overall health score (percentage of trees in good or excellent health)
	const healthDistributionResult = await db
		.select({
			health: Trees.Health,
			count: count()
		})
		.from(Trees)
		.where(eq(Trees.Status, 'APPROVED'))
		.groupBy(Trees.Health);

	let healthyCount = 0;
	let totalCount = 0;

	healthDistributionResult.forEach((result) => {
		totalCount += result.count;
		if (result.health === 'GOOD' || result.health === 'EXCELLENT') {
			healthyCount += result.count;
		}
	});

	const healthScore = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;

	return {
		summary: {
			totalTrees,
			totalSpecies,
			activeContributors,
			treesThisMonth,
			healthScore
		}
	};
};
