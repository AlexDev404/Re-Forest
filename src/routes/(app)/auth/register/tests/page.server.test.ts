import { db } from '$lib/server/db';
import * as sveltekit from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../+page.server';

// Mock modules and dependencies
vi.mock('$env/static/private', () => ({
	DEBUG: 'true',
	JWT_SECRET: 'test-secret',
	SESSION_MAX_AGE: '24',
	SESSION_SECURE: 'false',
	SESSION_HTTP_ONLY: 'true',
	SESSION_SAMESITE: 'lax'
}));

// Create a mock register function we can track
const mockRegister = vi.fn().mockResolvedValue(true);

vi.mock('$lib/class/User', () => ({
	User: class MockUser {
		Id = 1;
		Role = 3;
		FirstName = 'Test';
		LastName = 'User';
		Email = 'test@example.com';
		Password = '';

		constructor() {}

		static create = vi.fn().mockImplementation(() => {
			return new this();
		});

		register = mockRegister;
	}
}));

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		then: vi.fn().mockImplementation((callback) => {
			// Simulate no existing user
			return Promise.resolve(callback([]));
		}),
		catch: vi.fn().mockImplementation(() => Promise.resolve())
	}
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
			name: 'Test User',
			email: 'test@example.com',
			password: 'password123',
			confirmPassword: 'password123'
		}
	}),
	setError: vi.fn()
}));

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn().mockReturnValue('mock-jwt-token')
	}
}));

describe('Register page server', () => {
	let mockEvent: any;

	beforeEach(() => {
		mockEvent = {
			locals: {
				user: null
			},
			cookies: {
				set: vi.fn()
			}
		};

		// Reset mocks
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should redirect if user is already logged in', async () => {
			mockEvent.locals.user = { Id: 1 };

			await expect(load(mockEvent)).rejects.toThrow();
			expect(sveltekit.redirect).toHaveBeenCalledWith(302, '/explore');
		});

		it('should return form data when user is not logged in', async () => {
			mockEvent.locals.user = null;

			const result = await load(mockEvent);
			expect(result).toHaveProperty('form');
		});
	});

	describe('actions.default', () => {
		it('should fail validation if form is invalid', async () => {
			const { superValidate } = await import('sveltekit-superforms');
			(superValidate as any).mockResolvedValueOnce({
				valid: false,
				data: {}
			});

			const result = await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
		});

		it('should fail if email already exists', async () => {
			// Mock to simulate existing user
			const mockDb = db as any;
			mockDb.then.mockImplementationOnce((callback) => {
				return Promise.resolve(callback([{ email: 'test@example.com' }]));
			});

			await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
		});

		it('should register user and set session cookie on successful registration', async () => {
			await actions.default(mockEvent);

			// Check that the register method was called with the correct arguments
			expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test', 'User');

			expect(mockEvent.cookies.set).toHaveBeenCalledWith(
				'session',
				'mock-jwt-token',
				expect.objectContaining({
					path: '/',
					httpOnly: true,
					sameSite: 'lax'
				})
			);

			expect(sveltekit.redirect).toHaveBeenCalledWith(302, '/explore');
		});
	});
});
