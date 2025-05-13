import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    // Authenticate user and check permissions
    if (!user) {
        throw redirect(307, '/auth/login');
    }
    
    // Check if user is admin or environmentalist (roles 1 and 2)
    if (user.Role !== 1 && user.Role !== 2) {
        throw redirect(307, '/');
    }

    return {};
};
