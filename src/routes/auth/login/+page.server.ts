import {
    DEBUG,
    JWT_SECRET,
    SESSION_HTTP_ONLY,
    SESSION_MAX_AGE,
    SESSION_SAMESITE,
    SESSION_SECURE,
    VERBOSE
} from '$env/static/private';
import { User } from '$lib/class/User';
import { typical_development_notice } from '$lib/utility/typicals';
import { fail, isActionFailure, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import Jwt from 'jsonwebtoken';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	rememberMe: z.boolean().optional().default(false)
});

export const load: PageServerLoad = async (event) => {
	// Redirect if already logged in
	const session = await event.locals.user;
	if (JSON.parse(DEBUG)) {
		typical_development_notice();
		console.log('Current auth session:', session);
	}
	if (session) {
		throw redirect(302, '/explore');
	}

	return {
		form: await superValidate(event, zod(loginSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginSchema));
		const cookies = event.cookies;
		if (JSON.parse(DEBUG)) {
			typical_development_notice();
			console.log('Form:', form);
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		try {
			// Find user by email
			const user = (await User.findByEmail(email.toLowerCase()).catch((error) => {
				if (JSON.parse(DEBUG)) {
					typical_development_notice();
					console.error('Error finding user:', error);
				}
				setError(form, '', 'Invalid email or password');
				throw fail(400, { form });
			})) as User;
			if (!user) {
				setError(form, '', 'Invalid email or password');
				throw fail(400, { form });
			}

			// User not found or password incorrect
			const login_value = await user.login(password).catch((error) => {
				if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
					typical_development_notice();
					console.error('Login error:', error);
				}
				setError(form, '', 'Invalid email or password');
				throw fail(400, { form });
			});
			if (!login_value) {
				setError(form, '', 'Invalid email or password');
				throw fail(400, { form });
			}
			console.log('Login successful:', login_value);

			// Assign the session
			cookies.set(
				'session',
				Jwt.sign({ email: user.Email }, JWT_SECRET, {
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

			throw redirect(302, '/explore');
		} catch (error) {
			if (isActionFailure(error)) {
				return error;
			}
			if (isRedirect(error)) {
				throw error;
			}
			setError(form, '', 'An error occurred during login');
			console.error(error);
		}
	}
};
