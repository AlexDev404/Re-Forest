import { DEBUG, JWT_SECRET } from '$env/static/private';
import { User } from '$lib/class/User';
import { typical_development_notice } from '$lib/utility/typicals';
import type { Handle } from '@sveltejs/kit';
import Jwt from 'jsonwebtoken';
export const handle: Handle = async ({ event, resolve }) => {
	try {
		const cookies = event.cookies;
		const session = cookies.get('session');

		// Check if the user is authenticated
		if (!session) return await resolve(event);
		const jwt: Jwt.JwtPayload = Jwt.verify(session, JWT_SECRET) as Jwt.JwtPayload;
		if (!jwt) return await resolve(event);

		// Get the user's raw data from the database
		const temp_user = (await User.findByEmail(jwt['email']).catch((error) => {
			if (JSON.parse(DEBUG)) {
				typical_development_notice();
				console.error('[HOOK_AUTH]: Error finding user:', error);
			}
			throw new Error('User not found');
		})) as User;

		// Cast the raw data to the User type
		const new_user: App.Locals['user'] = temp_user as unknown as App.Locals['user'];
		if (!new_user) throw new Error('User not found');

		// Reassign the correct types to the user object
		new_user.CreatedAt = new Date(temp_user.CreatedAt);

		// Set the user in the event locals
		event.locals.user = new_user;

		// response = await handleI18n({ event, resolve });
	} catch (e) {
		console.error('[HOOK_AUTH_CATCH]: ' + e);
		return await resolve(event);
	}

	const response = await resolve(event);
	return response;
};
