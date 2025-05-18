import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.Role === 3) {
		throw redirect(302, '/');
	}

	return {
		role: locals.user.Role
	};
};
