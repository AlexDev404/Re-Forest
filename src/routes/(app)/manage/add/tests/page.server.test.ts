// file: src/routes/manage/add/tests/page.server.test.ts

import { Tree } from '$lib/class/Tree';
import type { User } from '$lib/class/User';
import * as sveltekit from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { actions, load } from '../+page.server';

// Mock modules and dependencies
vi.mock('$env/static/private', () => ({
	DEBUG: 'true'
}));

vi.mock('$lib/server/db', () => {
	const mockSelect = vi.fn(() => ({
		from: vi.fn(() => Promise.resolve([
			{ Id: 1, Name: 'Event', CreatedAt: new Date() },
			{ Id: 2, Name: 'Reforestation', CreatedAt: new Date() },
			{ Id: 3, Name: 'Other', CreatedAt: new Date() }
		]))
	}));
	
	return {
		db: {
			insert: vi.fn(),
			select: mockSelect
		},
		PlantingReasons: {}
	};
});

vi.mock('$lib/class/Tree', () => ({
	Tree: {
		create: vi.fn().mockResolvedValue({
			Id: 123,
			TreeName: 'Oak Tree',
			TreeSpecies: 'Oak',
			Height: 5,
			Health: 'Good',
			Status: 'PENDING',
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
			tree_species: '1',
			planter_type: 'INDIVIDUAL',
			planting_reason_id: '1'
		}
	}),
	setError: vi.fn()
}));

describe('Add/Manage Tree page server', () => {
	let mockEvent: sveltekit.ServerLoadEvent;
	let insertMock: Mock;
	let valuesMock: Mock;
	let returningMock: Mock;

	beforeEach(() => {
		// Initialize mocks before each test
		returningMock = vi.fn().mockResolvedValue([{ Id: 123 }]);
		valuesMock = vi.fn(() => ({ returning: returningMock }));
		insertMock = vi.fn(() => ({ values: valuesMock }));

		// Initialize mock event
		mockEvent = {
			locals: {
				user: {
					Id: 1,
					Role: 1,
					FirstName: 'Test',
					LastName: 'User',
					Email: 'test@example.com',
					Password: 'password',
					CreatedAt: new Date()
				} as unknown as User
			},
			request: new Request('http://localhost')
		} as unknown as sveltekit.ServerLoadEvent;

		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should return form data and planting reasons', async () => {
			// @ts-expect-error Forcing the type to match the expected structure
			const result = await load(mockEvent);
			expect(result).toBeDefined();
			expect(result.form).toBeDefined();
			expect(result.plantingReasons).toBeDefined();
		});
	});

	describe('actions.default function', () => {
		it('should fail if user is not logged in', async () => {
			mockEvent.locals.user = undefined;

			await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(401, expect.anything());
		});

		it('should fail validation if form is invalid', async () => {
			const { superValidate } = await import('sveltekit-superforms');
			(superValidate as Mock).mockResolvedValueOnce({
				valid: false,
				data: {}
			});

			await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
		});

		it('should create new tree and redirect on success', async () => {
			await actions.default(mockEvent);

			expect(Tree.create).toHaveBeenCalled();
			expect(sveltekit.redirect).toHaveBeenCalledWith(303, '/confirmation?tree_id=123');
		});

		it('should handle errors during tree creation', async () => {
			returningMock.mockRejectedValueOnce(new Error('Database error'));

			await actions.default(mockEvent);

			expect(sveltekit.fail).toHaveBeenCalledWith(500, expect.anything());
		});
	});
});
