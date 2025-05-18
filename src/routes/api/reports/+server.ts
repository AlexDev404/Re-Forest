import { db } from '$lib/server/db';
import { TreeSpecies, Trees, User } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
	// Check authentication
	const user = event.locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (user.Role !== 1 && user.Role !== 2) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	// Get query parameters
	const reportType = event.url.searchParams.get('type') || 'tree-health';
	const timeFrame = event.url.searchParams.get('timeFrame') || 'all-time';

	// Apply date filtering based on timeframe
	let startDate: Date | null = null;
	const now = new Date();

	if (timeFrame !== 'all-time') {
		startDate = new Date();
		switch (timeFrame) {
			case 'week':
				startDate.setDate(now.getDate() - 7);
				break;
			case 'month':
				startDate.setMonth(now.getMonth() - 1);
				break;
			case 'year':
				startDate.setFullYear(now.getFullYear() - 1);
				break;
		}
	}

	try {
		switch (reportType) {
			case 'tree-health':
				return await getTreeHealthReport(startDate);
			case 'trees-by-species':
				return await getTreesBySpeciesReport(startDate);
			case 'planting-activity':
				return await getPlantingActivityReport(startDate);
			case 'user-contributions':
				return await getUserContributionsReport(startDate);
			case 'tree-growth':
				return await getTreeGrowthReport(startDate);
			default:
				return json({ error: 'Invalid report type' }, { status: 400 });
		}
	} catch (error) {
		console.error(`Error generating ${reportType} report:`, error);
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}
}

async function getTreeHealthReport(startDate: Date | null) {
	// Query condition based on start date
	let condition = eq(Trees.Status, 'APPROVED');
	if (startDate) {
		condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
	}

	const healthDistribution = await db
		.select({
			health: Trees.Health,
			count: count()
		})
		.from(Trees)
		.where(condition)
		.groupBy(Trees.Health);

	// Transform data for the chart
	const data = healthDistribution.map((item) => ({
		label: formatHealthStatus(item.health),
		value: item.count
	}));

	return json({
		title: 'Tree Health Distribution',
		data,
		columns: ['Health Status', 'Count'],
		colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']
	});
}

async function getTreesBySpeciesReport(startDate: Date | null) {
	// Query condition based on start date
	let condition = eq(Trees.Status, 'APPROVED');
	if (startDate) {
		condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
	}

	const speciesDistribution = await db
		.select({
			speciesId: Trees.TreeSpecies,
			speciesName: TreeSpecies.Name,
			count: count()
		})
		.from(Trees)
		.innerJoin(TreeSpecies, eq(Trees.TreeSpecies, TreeSpecies.Id))
		.where(condition)
		.groupBy(Trees.TreeSpecies, TreeSpecies.Name)
		.orderBy(desc(sql<number>`count(*)`));

	// Transform data for the chart
	const data = speciesDistribution.map((item) => ({
		label: item.speciesName || 'Unknown',
		value: item.count
	}));

	return json({
		title: 'Trees by Species',
		data,
		columns: ['Species', 'Count']
	});
}

async function getPlantingActivityReport(startDate: Date | null) {
	// Create date range for the report
	let periodStartDate = startDate;
	if (!periodStartDate) {
		// Default to epoch (January 1, 1970) if no start date specified
		periodStartDate = new Date(0); // 0 milliseconds since the epoch
	}

	// Determine the grouping period (monthly is default for simplicity)
	// Query approved trees grouped by month
	const plantingActivity = await db
		.select({
			month: sql<string>`date_trunc('month', ${Trees.PlantedOn})::date`,
			count: count()
		})
		.from(Trees)
		.where(
			and(
				eq(Trees.Status, 'APPROVED'),
				gte(Trees.PlantedOn, periodStartDate.toISOString().split('T')[0])
			)
		)
		.groupBy(sql`date_trunc('month', ${Trees.PlantedOn})::date`)
		.orderBy(sql`date_trunc('month', ${Trees.PlantedOn})::date`);

	// Transform data for the line chart
	const data = plantingActivity.map((item) => ({
		label: formatDate(item.month),
		value: item.count
	}));

	return json({
		title: 'Planting Activity Over Time',
		data,
		columns: ['Month', 'Trees Planted']
	});
}

async function getUserContributionsReport(startDate: Date | null) {
	// Query condition based on start date
	let condition = eq(Trees.Status, 'APPROVED');
	if (startDate) {
		condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
	}

	const contributions = await db
		.select({
			userId: Trees.PlantedBy,
			firstName: User.FirstName,
			lastName: User.LastName,
			count: count()
		})
		.from(Trees)
		.innerJoin(User, eq(Trees.PlantedBy, User.Id))
		.where(condition)
		.groupBy(Trees.PlantedBy, User.FirstName, User.LastName)
		.orderBy(desc(sql<number>`count(*)`))
		.limit(10);

	// Transform data for the bar chart
	const data = contributions.map((item) => ({
		label: `${item.firstName} ${item.lastName}`,
		value: item.count
	}));

	return json({
		title: 'Top Contributors',
		data,
		columns: ['User', 'Trees Planted']
	});
}

async function getTreeGrowthReport(startDate: Date | null) {
	// Query condition based on start date
	let condition = eq(Trees.Status, 'APPROVED');
	if (startDate) {
		condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
	}

	// Group trees by age ranges
	const ageRanges = [
		{ label: '0-1 years', min: 0, max: 1 },
		{ label: '2-3 years', min: 2, max: 3 },
		{ label: '4-5 years', min: 4, max: 5 },
		{ label: '6-10 years', min: 6, max: 10 },
		{ label: '10+ years', min: 11, max: 1000 }
	];

	const result = [];

	for (const range of ageRanges) {
		const ageCondition = and(
			condition,
			sql`${Trees.Age} >= ${range.min} AND ${Trees.Age} <= ${range.max}`
		);

		const countResult = await db
			.select({
				count: count(),
				avgHeight: sql<number>`AVG(${Trees.Height})::numeric(10,2)`
			})
			.from(Trees)
			.where(ageCondition);

		result.push({
			label: range.label,
			value: countResult[0].avgHeight || 0
		});
	}

	return json({
		title: 'Average Tree Height by Age',
		data: result,
		columns: ['Age Range', 'Avg Height (m)']
	});
}

// Helper functions
function formatHealthStatus(status: string | null): string {
	if (!status) return 'Unknown';

	return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDate(dateString: string | null): string {
	if (!dateString) return 'Unknown';

	const date = new Date(dateString);

	// Use consistent format: shortened month name + space + full year
	// This matches the regex pattern we're looking for in the Chart component
	return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}
