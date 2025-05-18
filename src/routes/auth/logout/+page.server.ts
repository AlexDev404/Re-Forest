import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	// Clear all cookies
	const cookies = event.cookies;

	if (cookies) {
		const allCookies = cookies.getAll();
		for (const cookie of allCookies) {
			cookies.set(cookie.name, '', { path: '/', expires: new Date(0) });
		}
	}
};
