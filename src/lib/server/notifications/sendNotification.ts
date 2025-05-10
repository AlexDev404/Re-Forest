import { db } from '$lib/server/db';
import { Notification } from '$lib/class/Notification';
import { messaging } from '$lib/server/firebase';
import { eq } from 'drizzle-orm';
import { UserTokens } from '$lib/server/db/schema';

/**
 * Creates a DB notification and attempts to send a Firebase push notification
 */
export async function sendNotification(userId: number, treeId: number, type: string, message: string) {
	// Create DB notification
	await Notification.create(userId, treeId, type, message);

	// Get user push tokens
	const tokens = await db.select().from(UserTokens).where(eq(UserTokens.userId, userId));

	if (!tokens || tokens.length === 0) {
		console.warn(`No push tokens found for user ${userId}`);
		return;
	}

	const tokenList = tokens.map((t) => t.fcmToken).filter(Boolean);

	if (tokenList.length === 0) return;

	// Compose and send Firebase notification
	const payload = {
		notification: {
			title: 'Tree Submission Update',
			body: message
		}
	};

	try {
		await Promise.all(
			tokenList.map((token) =>
				messaging.send({
					token,
					...payload
				}).catch((err) => {
					console.warn(`Failed to send push to token ${token}`, err);
				})
			)
		);
	} catch (error) {
		console.error('Error sending push notification:', error);
	}
}
