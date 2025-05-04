import { db } from '$lib/server/db';
import { Trees } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ilike, and, gte, lte, eq } from 'drizzle-orm';
import { treehealth } from '$lib/server/db/schema';

type TreeHealth = "BAD" | "FAIR" | "GOOD" | "EXCELLENT";

export async function GET(event: RequestEvent) {
    try {
        const searchQuery = event.url.searchParams.get('q') || '';
        const healthFilter = event.url.searchParams.get('health') || 'all';
        const dateFilter = event.url.searchParams.get('date') || 'all';
        const heightFilter = event.url.searchParams.get('height') || 'all';

        let conditions = [];

        // Apply text search if query exists
        if (searchQuery) {
            // Use case-insensitive partial matching
            conditions.push(ilike(Trees.TreeName, `%${searchQuery}%`));
        }

        // Apply health filter
        if (healthFilter !== 'all') {
            const healthMap = {
                'poor': 'BAD',
                'fair': 'FAIR',
                'good': 'GOOD',
                'excellent': 'EXCELLENT'
            };
            const healthValue = healthMap[healthFilter as keyof typeof healthMap];
            if (healthValue) {
                conditions.push(eq(Trees.Health, healthValue));
            }
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            switch (dateFilter) {
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
            
            conditions.push(gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
        }

        // Apply height filter
        if (heightFilter !== 'all') {
            switch (heightFilter) {
                case 'short':
                    conditions.push(lte(Trees.Height, 10));
                    break;
                case 'medium':
                    conditions.push(and(gte(Trees.Height, 10), lte(Trees.Height, 20)));
                    break;
                case 'tall':
                    conditions.push(gte(Trees.Height, 20));
                    break;
            }
        }

        const dbTrees = await db.select().from(Trees).where(and(...conditions));
        
        // Transform database trees to match UI format
        const trees = dbTrees.map(tree => {
            const healthMap = {
                'BAD': 'poor',
                'FAIR': 'fair',
                'GOOD': 'good',
                'EXCELLENT': 'excellent'
            };
            const health = healthMap[tree.Health || 'EXCELLENT'] || 'excellent';
            const height = tree.Height?.toString() || '0';
            return {
                name: tree.TreeName,
                plantedBy: tree.PlantedBy?.toString() || 'Unknown',
                health,
                height,
                lat: tree.Lat,
                lng: tree.Lng,
                location_readable: undefined,  // Will be populated by reverse geocoding
                plantedOn: tree.PlantedOn,
                image: tree.Image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2613&q=80',
                age: tree.Age?.toString() || 'Unknown',
                description: `A ${health} tree that stands ${height} meters tall.`
            };
        });

        return json(trees);
    } catch (error) {
        console.error('Error fetching trees:', error);
        return json({ error: 'Failed to fetch trees' }, { status: 500 });
    }
} 