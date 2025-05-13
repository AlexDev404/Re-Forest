import { db } from '$lib/server/db';
import { Notifications } from '$lib/server/db/schema';

export class Notification {
	id: number;
	userId: number;
	treeId: number;
	type: string;
	message: string;
	createdAt: Date | null;

	constructor(
		id: number,
		userId: number,
		treeId: number,
		type: string,
		message: string,
		createdAt: Date | null = null
	) {
		this.id = id;
		this.userId = userId;
		this.treeId = treeId;
		this.type = type;
		this.message = message;
		this.createdAt = createdAt;
	}

	static async create(
		userId: number,
		treeId: number,
		type: string,
		message: string
	): Promise<Notification | undefined> {
		try {
			const newNotification = await db
				.insert(Notifications)
				.values({
					userId,
					treeId,
					type,
					message
				})
				.returning();

			if (newNotification.length > 0) {
				const created = newNotification[0];
				return new Notification(
					created.id,
					created.userId,
					created.treeId,
					created.type,
					created.message,
					created.createdAt
				);
			}

			return undefined;
		} catch (error) {
			console.error('Error creating notification:', error);
			return undefined;
		}
	}
}
