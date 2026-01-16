import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from '../+page.svelte';

// Properly mock Svelte with createEventDispatcher
vi.mock('svelte', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		onMount: vi.fn((cb) => cb()),
		createEventDispatcher: vi.fn(() => vi.fn())
	};
});

// Mock superform
vi.mock('sveltekit-superforms/client', () => ({
	superForm: vi.fn().mockReturnValue({
		form: {
			subscribe: vi.fn((cb) => {
				cb({
					name: '',
					email: '',
					password: '',
					confirmPassword: ''
				});
				return { unsubscribe: vi.fn() };
			})
		},
		errors: {
			subscribe: vi.fn((cb) => {
				cb({
					name: '',
					email: '',
					password: '',
					confirmPassword: '',
					_errors: ''
				});
				return { unsubscribe: vi.fn() };
			})
		},
		constraints: {
			subscribe: vi.fn((cb) => {
				cb({});
				return { unsubscribe: vi.fn() };
			})
		},
		enhance: vi.fn(),
		message: {
			subscribe: vi.fn((cb) => {
				cb('');
				return { unsubscribe: vi.fn() };
			})
		}
	})
}));

describe('Register Page Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders registration form with all required fields', () => {
		const props = {
			data: {
				form: {}
			}
		};

		render(RegisterPage, { props });

		// Check for the presence of form elements
		expect(screen.getByText('Greening Belize')).toBeInTheDocument();
		expect(screen.getByText('Full Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Password')).toBeInTheDocument();
		expect(screen.getByText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
		expect(screen.getByText('Already have an account? Log in')).toBeInTheDocument();
	});

	it('shows validation errors when provided', async () => {
		// Mock for errors
		const { superForm } = await import('sveltekit-superforms/client');
		(superForm as any).mockReturnValueOnce({
			form: {
				subscribe: vi.fn((cb) => {
					cb({
						name: 'John Doe',
						email: 'invalid-email',
						password: 'short',
						confirmPassword: 'different'
					});
					return { unsubscribe: vi.fn() };
				})
			},
			errors: {
				subscribe: vi.fn((cb) => {
					cb({
						name: '',
						email: 'Invalid email format',
						password: 'Password too short',
						confirmPassword: 'Passwords do not match',
						_errors: 'Please fix the errors above'
					});
					return { unsubscribe: vi.fn() };
				})
			},
			constraints: {
				subscribe: vi.fn((cb) => {
					cb({});
					return { unsubscribe: vi.fn() };
				})
			},
			enhance: vi.fn(),
			message: {
				subscribe: vi.fn((cb) => {
					cb('');
					return { unsubscribe: vi.fn() };
				})
			}
		});

		const props = {
			data: {
				form: {}
			}
		};

		render(RegisterPage, { props });

		// Check for error messages
		expect(screen.getByText('Invalid email format')).toBeInTheDocument();
		expect(screen.getByText('Password too short')).toBeInTheDocument();
		expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
		expect(screen.getByText('Please fix the errors above')).toBeInTheDocument();
	});

	it('shows success message when provided', async () => {
		// Mock for success message
		const { superForm } = await import('sveltekit-superforms/client');
		(superForm as any).mockReturnValueOnce({
			form: {
				subscribe: vi.fn((cb) => {
					cb({
						name: '',
						email: '',
						password: '',
						confirmPassword: ''
					});
					return { unsubscribe: vi.fn() };
				})
			},
			errors: {
				subscribe: vi.fn((cb) => {
					cb({});
					return { unsubscribe: vi.fn() };
				})
			},
			constraints: {
				subscribe: vi.fn((cb) => {
					cb({});
					return { unsubscribe: vi.fn() };
				})
			},
			enhance: vi.fn(),
			message: {
				subscribe: vi.fn((cb) => {
					cb('Registration successful');
					return { unsubscribe: vi.fn() };
				})
			}
		});

		const props = {
			data: {
				form: {}
			}
		};

		render(RegisterPage, { props });

		// Check for success message
		expect(screen.getByText('Registration successful')).toBeInTheDocument();
	});
});
