import { FREE_INITIAL_TOKEN_AMOUNT } from "@/lib/contants";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  generationTokens,
  generationTransactions,
  type DBGenerationToken,
} from "@/server/db/schema";
import { polar } from "@/utils/polar";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { Z } from "node_modules/@upstash/redis/zmscore-CjoCv9kz.mjs";
import { z } from "zod";

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

    return tokens.availableTokens;
  }),
  use: privateProcedure.mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    await db.transaction(async (tx) => {
      const token = await tx.query.generationTokens.findFirst({
        where: eq(generationTokens.profileId, user.id),
      });
      if (!token) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await tx
        .update(generationTokens)
        .set({
          availableTokens: sql`${generationTokens.availableTokens} - 1`,
        })
        .where(eq(generationTokens.profileId, user.id));

      await tx.insert(generationTransactions).values({
        id: crypto.randomUUID(),
        generationTokenId: token.id,
        amount: 1,
      });
    });
  }),
  checkout: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
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
            "7de2cf42-ca66-4669-b7dd-8c5ba1a50137",
            "8e2f8241-6edd-4a4a-ae5a-ed58fd031509",
            "ef1408e3-d305-4c99-9ab3-84d3cd777845",
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
            "7de2cf42-ca66-4669-b7dd-8c5ba1a50137",
            "8e2f8241-6edd-4a4a-ae5a-ed58fd031509",
            "ef1408e3-d305-4c99-9ab3-84d3cd777845",
          ],
        });

        return checkoutUrl;
      }
    }),
});
