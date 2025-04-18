import { and } from "drizzle-orm";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { chats, generatedAssets, messages } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const chatsRouter = createTRPCRouter({
	getChats: privateProcedure.input(z.object({})).query(async ({ ctx }) => {
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

			const assets = await ctx.db.query.generatedAssets.findMany({
				where: eq(generatedAssets.chatId, input.chatId),
				with: {
					profile: true,
				},
			});

			return foundChat ? { ...foundChat, generatedAssets: assets } : null;
		}),
	getChatGeneratedAssetsByChatId: privateProcedure
		.input(
			z.object({
				chatId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const assets = await ctx.db.query.generatedAssets.findMany({
				where: eq(generatedAssets.chatId, input.chatId),
			});

			return assets;
		}),
});
