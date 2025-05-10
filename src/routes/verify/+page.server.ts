import { DEBUG, DEVELOPMENT } from '$env/static/private';
import { db } from '$lib/server/db';
import { Trees as TreeSchema} from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { sendNotification } from '$lib/server/notifications/sendNotification';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	// Check if user is admin
	if (!user || user.Role !== 1) {
		throw redirect(308, '/');
	}

	try {
		// Get pending trees
		const pendingTrees = await getPendingTrees();
		const pojoTrees = JSON.parse(JSON.stringify(pendingTrees));

		if (JSON.parse(DEBUG) && JSON.parse(DEVELOPMENT)) {
			typical_development_notice();
			console.log('Pending trees:', pojoTrees);
		}
		return {
			pendingTrees: pojoTrees
		};
	} catch (error) {
		console.error('Error loading pending trees:', error);
		return {
			pendingTrees: []
		};
	}
};

export const actions: Actions = {
	verify: async (event) => {
		const user = event.locals.user;

		// Check if user is admin
		if (!user || user.Role !== 1) {
			return fail(403, { message: 'Unauthorized' });
		}

		const formData = await event.request.formData();
		const treeId = formData.get('tree_id')?.toString();
		const approved = formData.get('approved') === 'true';

		if (!treeId) {
			return fail(400, { message: 'Tree ID is required' });
		}

		const tree = await db.query.Trees.findFirst({
			where: eq(TreeSchema.Id, parseInt(treeId))
		});

		if (!tree) return fail(404, { message: 'Tree not found' });

		try {
			const status = approved ? 'APPROVED' : 'DECLINED';
			const result = await updateTreeStatus(parseInt(treeId), status);

			if (result instanceof Error) {
				if (JSON.parse(DEBUG) && JSON.parse(DEVELOPMENT)) {
					typical_development_notice();
					console.error(`Failed to ${approved ? 'approve' : 'decline'} tree:`, result.message);
				}
				return fail(500, { message: result.message });
			}

			// Create notification
			await sendNotification(
			tree.PlantedBy ?? 0,
			tree.Id,
			'status_change',
			`Your tree submission for ${tree.TreeName} has been ${status.toLowerCase()}.`
			);
			return { success: true };
		} catch (error) {
			if (JSON.parse(DEBUG) && JSON.parse(DEVELOPMENT)) {
				typical_development_notice();
				console.error('Error processing tree verification:', error);
			}
			return fail(500, { message: 'Failed to process verification' });
		}
	},

	getPending: async (event) => {
		const user = event.locals.user;

		// Check if user is admin
		if (!user || user.Role !== 1) {
			return fail(403, { message: 'Unauthorized' });
		}

		try {
			const pendingTrees = await getPendingTrees();
			return { pendingTrees };
		} catch (error) {
			if (JSON.parse(DEBUG) && JSON.parse(DEVELOPMENT)) {
				typical_development_notice();
				console.error('Error fetching pending trees:', error);
			}
			return fail(500, { message: 'Failed to fetch pending trees' });
		}
	}
};

/**
 * Helper function to get all pending trees
 */
async function getPendingTrees() {
	const result = await db.query.Trees.findMany({
		where: (trees, { eq }) => eq(trees.Status, 'PENDING'),
		with: {
			user: true
		},
		orderBy: (trees, { asc }) => asc(trees.CreatedAt)
	});

	// Replace PlantedBy with user object and remove original user key
	return result.map((tree) => {
		const { user, ...rest } = tree;
		return {
			...rest,
			PlantedBy: user
		};
	});
}

/**
 * Helper function to update tree status
 */
async function updateTreeStatus(treeId: number, status: 'PENDING' | 'APPROVED' | 'DECLINED') {
	try {
		await db
			.update(TreeSchema)
			.set({
				Status: status,
				UpdatedAt: new Date()
			})
			.where(eq(TreeSchema.Id, treeId));

		return true;
	} catch (error) {
		console.error('Error updating tree status:', error);
		return new Error('Failed to update tree status');
	}
}
