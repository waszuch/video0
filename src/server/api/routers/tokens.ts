import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { Z } from "node_modules/@upstash/redis/zmscore-CjoCv9kz.mjs";
import { z } from "zod";
import { FREE_INITIAL_TOKEN_AMOUNT, POLAR_PRODUCT_IDS } from "@/lib/contants";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
	type DBGenerationToken,
	generationTokens,
	generationTransactions,
} from "@/server/db/schema";
import { polar } from "@/utils/polar";

export const tokensRouter = createTRPCRouter({
	get: privateProcedure.query(async ({ ctx }) => {
		const { user } = ctx;
		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		let tokens: Partial<DBGenerationToken> | undefined =
			await db.query.generationTokens.findFirst({
				where: eq(generationTokens.profileId, user.id),
				columns: {
					availableTokens: true,
				},
			});

		if (!tokens) {
			tokens = (
				await db
					.insert(generationTokens)
					.values({
						id: crypto.randomUUID(),
						profileId: user.id,
						availableTokens: FREE_INITIAL_TOKEN_AMOUNT,
						initialTokenAmount: FREE_INITIAL_TOKEN_AMOUNT,
					})
					.returning()
			)?.[0];
		}

		if (!tokens) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return tokens.availableTokens ?? 0;
	}),
	checkout: privateProcedure
		.input(
			z.object({
				chatId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const customer = await polar.customers.getStateExternal({
					externalId: ctx.user.id,
				});

				const checkoutUrl = await polar.checkouts.create({
					customerId: customer.id,
					customerExternalId: ctx.user.id,
					successUrl: `https://video0.dev/chat/${input.chatId}`,
					products: [
						POLAR_PRODUCT_IDS["3_TOKENS"].id,
						POLAR_PRODUCT_IDS["5_TOKENS"].id,
						POLAR_PRODUCT_IDS["10_TOKENS"].id,
					],
				});

				return checkoutUrl;
			} catch (error) {
				const customer = await polar.customers.create({
					email: ctx.user.email ?? "",
					externalId: ctx.user.id,
				});

				const checkoutUrl = await polar.checkouts.create({
					customerId: customer.id,
					customerExternalId: ctx.user.id,
					successUrl: `https://video0.dev/chat/${input.chatId}`,
					products: [
						POLAR_PRODUCT_IDS["3_TOKENS"].id,
						POLAR_PRODUCT_IDS["5_TOKENS"].id,
						POLAR_PRODUCT_IDS["10_TOKENS"].id,
					],
				});

				return checkoutUrl;
			}
		}),
});
