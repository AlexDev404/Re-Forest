import {
	DEBUG,
	JWT_SECRET,
	SESSION_HTTP_ONLY,
	SESSION_MAX_AGE,
	SESSION_SAMESITE,
	SESSION_SECURE
} from '$env/static/private';
import { User } from '$lib/class/User';
import { db } from '$lib/server/db';
import { User as UserSchema } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, isActionFailure, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import Jwt from 'jsonwebtoken';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const registerSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters long'),
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters long'),
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters long')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async (event) => {
	// Redirect if already logged in
	const session = await event.locals.user;
	if (JSON.parse(DEBUG)) {
		typical_development_notice();
		console.log('Current auth session:', session);
	}
	if (session) {
		throw redirect(302, '/');
	}

	return {
		form: await superValidate(event, zod4(registerSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(registerSchema));
		const cookies = event.cookies;

		if (JSON.parse(DEBUG)) {
			typical_development_notice();
			console.log('Form:', form);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { name, email, password } = form.data;

		// Split name into first and last name
		const nameParts = name.trim().split(' ');
		const firstName = nameParts[0];
		const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

		try {
			// Check if user already exists
			const existingUser = await db
				.select()
				.from(UserSchema)
				.where(eq(UserSchema.Email, email.toLowerCase()))
				.then((result) => result.length > 0)
				.catch((error) => {
					if (JSON.parse(DEBUG)) {
						typical_development_notice();
						console.error('Error checking existing user:', error);
					}
					throw error;
				});

			if (existingUser) {
				setError(form, 'email', 'Email already in use');
				return fail(400, { form });
			}

			// Create a new user
			const user = new User(0, 3, firstName, lastName, email.toLowerCase(), '');
			const registrationResult = await user
				.register(email.toLowerCase(), password, firstName, lastName)
				.catch((error) => {
					if (JSON.parse(DEBUG)) {
						typical_development_notice();
						console.error('Registration error:', error);
					}
					throw error;
				});

			if (!registrationResult) {
				setError(form, '', 'Registration failed');
				return fail(400, { form });
			}

			// Log the user in automatically
			cookies.set(
				'session',
				Jwt.sign({ email: email.toLowerCase() }, JWT_SECRET, {
					expiresIn: SESSION_MAX_AGE + 'h'
				}),
				{
					path: '/',
					expires: new Date(Date.now() + parseInt(SESSION_MAX_AGE) * 60 * 60 * 1000),
					secure: JSON.parse(SESSION_SECURE),
					httpOnly: JSON.parse(SESSION_HTTP_ONLY),
					sameSite: SESSION_SAMESITE as boolean | 'lax' | 'strict' | 'none' | undefined
				}
			);

			// Redirect to explore page after successful registration
			throw redirect(302, '/');
		} catch (error) {
			if (isActionFailure(error)) {
				return error;
			}
			if (isRedirect(error)) {
				throw error;
			}

			if (JSON.parse(DEBUG)) {
				typical_development_notice();
				console.error('Registration error:', error);
			}

			setError(form, '', 'An error occurred during registration');
			return fail(500, { form });
		}
	}
};
