import { User } from '$lib/class/User';
import * as sveltekit from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../+page.server';

// Mock modules and dependencies
vi.mock('$env/static/private', () => ({
	DEBUG: 'true',
	VERBOSE: 'false',
	JWT_SECRET: 'test-secret',
	SESSION_MAX_AGE: '24',
	SESSION_SECURE: 'false',
	SESSION_HTTP_ONLY: 'true',
	SESSION_SAMESITE: 'lax'
}));

vi.mock('$lib/class/User', () => ({
	User: {
		findByEmail: vi.fn()
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
			email: 'test@example.com',
			password: 'password123',
			rememberMe: false
		}
	}),
	setError: vi.fn()
}));

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn().mockReturnValue('mock-jwt-token')
	}
}));

describe('Login page server', () => {
	let mockEvent: any;
	let mockUser: any;

	beforeEach(() => {
		mockUser = {
			Id: 1,
			Email: 'test@example.com',
			login: vi.fn().mockResolvedValue(true)
		};

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
		(User.findByEmail as any).mockResolvedValue(mockUser);
	});

	describe('load function', () => {
		it('should redirect if user is already logged in', async () => {
			mockEvent.locals.user = mockUser;

			await expect(load(mockEvent)).rejects.toThrow();
			expect(sveltekit.redirect).toHaveBeenCalledWith(302, '/');
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

		it('should authenticate user and set session cookie on successful login', async () => {
			const result = await actions.default(mockEvent);

			expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
			expect(mockUser.login).toHaveBeenCalledWith('password123');
			expect(mockEvent.cookies.set).toHaveBeenCalledWith(
				'session',
				'mock-jwt-token',
				expect.objectContaining({
					path: '/',
					httpOnly: true,
					sameSite: 'lax'
				})
			);
			expect(sveltekit.redirect).toHaveBeenCalledWith(302, '/');
		});

		it('should fail with error message if user authentication fails', async () => {
			mockUser.login.mockRejectedValueOnce(new Error('Invalid password'));

			// Since the action catches the error and calls fail() instead of rejecting,
			// we should test for the fail() call, not for a rejection
			await actions.default(mockEvent);
			expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
		});
	});
});
