import type { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload.js";
import { eq, sql } from "drizzle-orm";
import {
	FREE_INITIAL_TOKEN_AMOUNT,
	POLAR_TOKEN_AMOUNTS_BY_IDS,
} from "@/lib/contants";
import { db } from "@/server/db";
import {
	type DBGenerationToken,
	generationTokens,
	generationTokenTopups,
} from "@/server/db/schema";

export const handlePolarOrderPaid = async (
	payload: WebhookOrderPaidPayload,
) => {
	const { status, createdAt, id, customer, productId } = payload.data;

	const { externalId } = customer;
	if (!externalId) {
		throw new Error("Customer external ID is required");
	}

	if (status !== "paid") {
		throw new Error("Order is not paid");
	}

	const tokensToAdd = POLAR_TOKEN_AMOUNTS_BY_IDS[productId];

	if (!tokensToAdd) {
		throw new Error("Invalid product ID");
	}

	await db.transaction(async (tx) => {
		let generationToken: DBGenerationToken | undefined;
		generationToken = await tx.query.generationTokens.findFirst({
			where: eq(generationTokens.profileId, externalId),
		});

		if (!generationToken) {
			generationToken = (
				await tx
					.insert(generationTokens)
					.values({
						id: crypto.randomUUID(),
						profileId: externalId,
						createdAt: createdAt.toISOString(),
						availableTokens: FREE_INITIAL_TOKEN_AMOUNT,
						initialTokenAmount: FREE_INITIAL_TOKEN_AMOUNT,
					})
					.returning()
			)?.[0];

			if (!generationToken) {
				throw new Error("Generation token not found");
			}
		}

		// Create a generation token topup
		await tx.insert(generationTokenTopups).values({
			id: crypto.randomUUID(),
			generationTokenId: generationToken.id,
			amount: tokensToAdd,
			createdAt: createdAt.toISOString(),
			polarOrderId: id,
			profileId: externalId,
		});

		// Increment the generation token available tokens and initial token amount
		await tx
			.update(generationTokens)
			.set({
				availableTokens: sql`${generationTokens.availableTokens} + ${tokensToAdd}`,
				initialTokenAmount: sql`${generationTokens.initialTokenAmount} + ${tokensToAdd}`,
			})
			.where(eq(generationTokens.id, generationToken.id));
	});
};
