import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, locals }) => {
	const user = locals.user;

	if (!user && !request.url.includes('/auth/')) {
		return redirect(307, '/auth/login');
	}

    return {
        authenticated: !!user,
    }
};
