import { DEBUG, VERBOSE } from '$env/static/private';
import { Tree } from '$lib/class/Tree';
import { Trees as TreeSchema } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, json, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/';

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;

    // Check if user is admin
    if (!user || !user.isAdmin) {
        throw redirect(303, '/');
    }

    try {
        // Get pending trees
        const pendingTrees = await getPendingTrees();
        
        return {
            pendingTrees
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
        if (!user || !user.isAdmin) {
            return fail(403, { message: 'Unauthorized' });
        }

        const formData = await event.request.formData();
        const treeId = formData.get('tree_id')?.toString();
        const approved = formData.get('approved') === 'true';

        if (!treeId) {
            return fail(400, { message: 'Tree ID is required' });
        }

        try {
            const status = approved ? 'APPROVED' : 'DECLINED';
            const result = await updateTreeStatus(parseInt(treeId), status);
            
            if (result instanceof Error) {
                if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
                    typical_development_notice();
                    console.error(`Failed to ${approved ? 'approve' : 'decline'} tree:`, result.message);
                }
                return fail(500, { message: result.message });
            }

            return { success: true };
        } catch (error) {
            if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
                typical_development_notice();
                console.error('Error processing tree verification:', error);
            }
            return fail(500, { message: 'Failed to process verification' });
        }
    },
    
    getPending: async (event) => {
        const user = event.locals.user;

        // Check if user is admin
        if (!user || !user.isAdmin) {
            return fail(403, { message: 'Unauthorized' });
        }

        try {
            const pendingTrees = await getPendingTrees();
            return { pendingTrees };
        } catch (error) {
            if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
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
    const result = await db
        .select()
        .from(TreeSchema)
        .where(eq(TreeSchema.Status, 'PENDING'))
        .orderBy(TreeSchema.CreatedAt);
    
    return result.map(
        (treeData) =>
            new Tree(
                treeData.Id,
                treeData.TreeName ?? '',
                treeData.TreeSpecies ?? 0,
                treeData.Height ?? 0,
                treeData.Health ?? 'EXCELLENT',
                treeData.Status ?? 'PENDING',
                treeData.Age ?? 0,
                treeData.Image ?? null,
                treeData.Lat ?? 0,
                treeData.Lng ?? 0,
                treeData.PlantedBy ?? 0,
                treeData.PlantedOn !== null ? new Date(treeData.PlantedOn) : null,
                treeData.CreatedAt !== null ? new Date(treeData.CreatedAt) : null,
                treeData.UpdatedAt !== null ? new Date(treeData.UpdatedAt) : null
            )
    );
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
                UpdatedAt: new Date().toISOString()
            })
            .where(eq(TreeSchema.Id, treeId));
        
        return true;
    } catch (error) {
        console.error('Error updating tree status:', error);
        return new Error('Failed to update tree status');
    }
}