// file: src/routes/api/trees/batch/+server.test.ts

import { Tree } from '$lib/class/Tree';
import { json } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './+server';

// Mock modules
vi.mock('$env/static/private', () => ({
	DEBUG: 'false'
}));

vi.mock('$lib/class/Tree', () => ({
	Tree: {
		create: vi.fn()
	}
}));

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		json: vi.fn((data, init) => ({
			...data,
			status: init?.status || 200
		}))
	};
});

describe('POST /api/trees/batch', () => {
	let mockEvent: any;

	beforeEach(() => {
		vi.clearAllMocks();
		
		mockEvent = {
			locals: {
				user: {
					Id: 1,
					Email: 'test@example.com'
				}
			},
			request: {
				json: vi.fn()
			}
		};
	});

	it('should reject unauthenticated requests', async () => {
		mockEvent.locals.user = null;
		mockEvent.request.json.mockResolvedValue({
			trees: []
		});

		const result = await POST(mockEvent);

		expect(result.status).toBe(401);
		expect(result.success).toBe(false);
		expect(result.error).toContain('logged in');
	});

	it('should validate request data', async () => {
		mockEvent.request.json.mockResolvedValue({
			trees: 'invalid'
		});

		const result = await POST(mockEvent);

		expect(result.status).toBe(400);
		expect(result.success).toBe(false);
		expect(result.error).toContain('Invalid');
	});

	it('should successfully create multiple trees', async () => {
		const mockTrees = [
			{
				tree_name: 'Oak Tree 1',
				tree_image: 'https://example.com/tree1.jpg',
				tree_lat: 17.25,
				tree_lng: -88.77,
				tree_height: 5,
				tree_age: 3,
				tree_species: '1',
				planter_type: 'INDIVIDUAL',
				organization_name: null,
				planting_reason_id: '1',
				hashtags: '#test',
				quantity: 1,
				area_hectares: null
			},
			{
				tree_name: 'Mahogany Tree 2',
				tree_image: 'https://example.com/tree2.jpg',
				tree_lat: 17.26,
				tree_lng: -88.78,
				tree_height: 8,
				tree_age: 5,
				tree_species: '2',
				planter_type: 'INDIVIDUAL',
				organization_name: null,
				planting_reason_id: '2',
				hashtags: null,
				quantity: 1,
				area_hectares: null
			}
		];

		mockEvent.request.json.mockResolvedValue({ trees: mockTrees });

		// Mock Tree.create to return different IDs
		(Tree.create as any)
			.mockResolvedValueOnce({ Id: 101 })
			.mockResolvedValueOnce({ Id: 102 });

		const result = await POST(mockEvent);

		expect(result.success).toBe(true);
		expect(result.treeIds).toEqual([101, 102]);
		expect(result.message).toContain('2 trees');
		expect(Tree.create).toHaveBeenCalledTimes(2);
	});

	it('should handle tree creation errors', async () => {
		const mockTrees = [
			{
				tree_name: 'Oak Tree',
				tree_image: 'https://example.com/tree.jpg',
				tree_lat: 17.25,
				tree_lng: -88.77,
				tree_species: '1',
				planter_type: 'INDIVIDUAL',
				planting_reason_id: '1'
			}
		];

		mockEvent.request.json.mockResolvedValue({ trees: mockTrees });

		// Mock Tree.create to return an error
		(Tree.create as any).mockResolvedValue(new Error('Database error'));

		const result = await POST(mockEvent);

		expect(result.success).toBe(false);
		expect(result.status).toBe(500);
		expect(result.error).toContain('Failed to create tree');
	});

	it('should validate species ID', async () => {
		const mockTrees = [
			{
				tree_name: 'Oak Tree',
				tree_image: 'https://example.com/tree.jpg',
				tree_lat: 17.25,
				tree_lng: -88.77,
				tree_species: 'invalid',
				planter_type: 'INDIVIDUAL',
				planting_reason_id: '1'
			}
		];

		mockEvent.request.json.mockResolvedValue({ trees: mockTrees });

		const result = await POST(mockEvent);

		expect(result.success).toBe(false);
		expect(result.status).toBe(400);
		expect(result.error).toContain('Invalid species selection');
	});

	it('should require species ID', async () => {
		const mockTrees = [
			{
				tree_name: 'Oak Tree',
				tree_image: 'https://example.com/tree.jpg',
				tree_lat: 17.25,
				tree_lng: -88.77,
				tree_species: '',
				planter_type: 'INDIVIDUAL',
				planting_reason_id: '1'
			}
		];

		mockEvent.request.json.mockResolvedValue({ trees: mockTrees });

		const result = await POST(mockEvent);

		expect(result.success).toBe(false);
		expect(result.status).toBe(400);
		expect(result.error).toContain('Plant species is required');
	});
});
