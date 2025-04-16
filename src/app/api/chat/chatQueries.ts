import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
	chats,
	type DBMessage,
	generatedAssets,
	messages,
} from "@/server/db/schema";

export async function saveChat({
	id,
	profileId,
	title,
}: {
	id: string;
	profileId: string;
	title: string;
}) {
	try {
		return await db.insert(chats).values({
			id,
			createdAt: new Date(),
			profileId,
			title,
		});
	} catch (error) {
		console.error("Failed to save chat in database", error);
		throw error;
	}
}

export async function getChatById({
	id,
	profileId,
}: {
	id: string;
	profileId: string;
}) {
	try {
		const foundChat = await db.query.chats.findFirst({
			where: and(eq(chats.id, id), eq(chats.profileId, profileId)),
		});

		return foundChat;
	} catch (error) {
		console.error("Failed to get chat by id from database", error);
		throw error;
	}
}

export async function getMessagesByChatId({ id }: { id: string }) {
	try {
		return await db.query.messages.findMany({
			where: eq(messages.chatId, id),
			orderBy: asc(messages.createdAt),
		});
	} catch (error) {
		console.error("Failed to get messages by chat id from database", error);
		throw error;
	}
}

export async function saveMessages({
	messages: messagesToInsert,
}: {
	messages: Array<DBMessage>;
}) {
	try {
		return await db.insert(messages).values(messagesToInsert);
	} catch (error) {
		console.error("Failed to save messages in database", error);
		throw error;
	}
}

export async function saveGeneratedAssets({
	asset,
}: {
	asset: typeof generatedAssets.$inferInsert;
}) {
	try {
		return await db.insert(generatedAssets).values(asset);
	} catch (error) {
		console.error("Failed to save generated assets in database", error);
		throw error;
	}
}
