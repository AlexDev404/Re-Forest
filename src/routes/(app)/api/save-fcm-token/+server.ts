// src/routes/api/save-fcm-token/+server.ts
import { db } from '$lib/server/db';
import { UserTokens } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
	const { fcmToken, deviceInfo } = await request.json();
	const userId = locals.user?.Id;

	if (!userId || !fcmToken) {
		console.warn('Missing data:', { userId, fcmToken });
		return json({ error: 'Missing data' }, { status: 400 });
	}

	const existing = await db.select().from(UserTokens).where(eq(UserTokens.userId, userId));

	if (existing.length) {
		await db
			.update(UserTokens)
			.set({ fcmToken, deviceInfo, lastUpdated: new Date() })
			.where(eq(UserTokens.userId, userId));
		console.log('Updated token for user:', userId);
	} else {
		await db.insert(UserTokens).values({
			userId,
			fcmToken,
			deviceInfo,
			lastUpdated: new Date()
		});
		console.log('Inserted token for user:', userId);
	}

	return json({ success: true });
}
