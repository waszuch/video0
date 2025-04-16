import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { chats, messages } from "@/server/db/schema";

export const chatsRouter = createTRPCRouter({
	getChats: privateProcedure.query(async ({ ctx }) => {
		const foundChats = await ctx.db.query.chats.findMany({
			where: eq(chats.profileId, ctx.user.id),
			orderBy: desc(chats.createdAt),
		});

		return foundChats;
	}),
	getChatMessagesByChatId: privateProcedure
		.input(
			z.object({
				chatId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const foundChat = await ctx.db.query.chats.findFirst({
				where: and(
					eq(chats.id, input.chatId),
					eq(chats.profileId, ctx.user.id),
				),
				with: {
					messages: { orderBy: asc(messages.createdAt) },
				},
			});

			return foundChat;
		}),
});
