import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { FREE_INITIAL_TOKEN_AMOUNT } from "@/lib/contants";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { generationTokens, profiles } from "@/server/db/schema";

export const profileRouter = createTRPCRouter({
	getProfile: privateProcedure.query(async ({ ctx }) => {
		const { user } = ctx;
		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const profile = await db.query.profiles.findFirst({
			where: eq(profiles.id, user.id),
			with: {
				generationTokens: { columns: { availableTokens: true } },
			},
		});

		if (!profile?.generationTokens) {
			await db.insert(generationTokens).values({
				id: uuidv4(),
				profileId: user.id,
				initialTokenAmount: FREE_INITIAL_TOKEN_AMOUNT,
				availableTokens: FREE_INITIAL_TOKEN_AMOUNT,
			});
		}

		return profile;
	}),
});
