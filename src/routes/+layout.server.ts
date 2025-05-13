import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, locals }) => {
	const user = locals.user;

	if (!user && !request.url.includes('/auth/')) {
		return redirect(307, '/auth/login');
	}

	return {
		authenticated: !!user,
		user: user
			? {
					Id: user.Id,
					FirstName: user.FirstName,
					LastName: user.LastName,
					Role: user.Role
				}
			: {
					Id: null,
					FirstName: 'Guest',
					LastName: '',
					Role: 3
				}
	};
};
