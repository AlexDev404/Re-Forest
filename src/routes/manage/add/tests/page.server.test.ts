// file: src/routes/manage/add/tests/page.server.test.ts

import { Tree } from '$lib/class/Tree';
import * as sveltekit from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../+page.server';

// Mock modules and dependencies
vi.mock('$env/static/private', () => ({
	DEBUG: 'true'
}));

vi.mock('$lib/class/Tree', () => ({
	Tree: {
		create: vi.fn().mockResolvedValue({
			Id: 123,
			TreeName: 'Oak Tree',
			TreeSpecies: 'Oak',
			Height: 5,
			Health: 'Good',
			Age: 10,
			Image: 'https://example.com/tree.jpg',
			Lat: 40.7128,
			Lng: -74.006,
			PlantedBy: 1,
			PlantedOn: new Date('2023-01-15'),
			CreatedAt: new Date('2023-01-15T12:30:45Z'),
			UpdatedAt: new Date('2023-01-15T12:30:45Z')
		})
	}
}));

vi.mock('$lib/utility/typicals', () => ({
	typical_development_notice: vi.fn()
}));

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		redirect: vi.fn(),
		fail: vi.fn().mockImplementation((code, data) => {
			return { status: code, data };
		}),
		isRedirect: vi.fn(),
		isActionFailure: vi.fn()
	};
});

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({
		valid: true,
		data: {
			tree_name: 'Oak Tree',
			tree_image: 'https://example.com/tree.jpg',
			tree_lat: 40.7128,
			tree_lng: -74.006,
			tree_height: 5,
			tree_age: 10,
			tree_species: 'Oak'
		}
	}),
	setError: vi.fn()
}));

describe('Add/Manage Tree page server', () => {
	let mockEvent: any;
	let insertMock: any;
	let valuesMock: any;
	let returningMock: any;

	beforeEach(() => {
		// Initialize mocks before each test
		returningMock = vi.fn().mockResolvedValue([{ Id: 123 }]);
		valuesMock = vi.fn(() => ({ returning: returningMock }));
		insertMock = vi.fn(() => ({ values: valuesMock }));

		// Set up the mock db module with the initialized mocks inside beforeEach
		vi.mock('$lib/server/db', () => {
			const returningMock = vi.fn().mockResolvedValue([{ Id: 123 }]);
			const valuesMock = vi.fn(() => ({ returning: returningMock }));
			const insertMock = vi.fn(() => ({ values: valuesMock }));
			return {
				db: { insert: insertMock }
			};
		});

		// Initialize mock event
		mockEvent = {
			locals: {
				user: {
					Id: 1
				}
			},
			request: {}
		};

		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should return form data', async () => {
			const result = await load(mockEvent);
			expect(result).toBeDefined();
		});
	});

	describe('actions.default function', () => {
		it('should fail if user is not logged in', async () => {
			mockEvent.locals.user = null;

			const result = await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(401, expect.anything());
		});

		it('should fail validation if form is invalid', async () => {
			const { superValidate } = await import('sveltekit-superforms');
			(superValidate as any).mockResolvedValueOnce({
				valid: false,
				data: {}
			});

			const result = await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
		});

		it('should create new tree and redirect on success', async () => {
			await actions.default(mockEvent);

			expect(Tree.create).toHaveBeenCalled();
			expect(sveltekit.redirect).toHaveBeenCalledWith(303, '/explore?tree_id=123');
		});

		it('should handle errors during tree creation', async () => {
			returningMock.mockRejectedValueOnce(new Error('Database error'));

			const result = await actions.default(mockEvent);

			expect(sveltekit.fail).toHaveBeenCalledWith(500, expect.anything());
		});
	});
});
