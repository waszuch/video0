import { FREE_INITIAL_TOKEN_AMOUNT } from "@/lib/contants";
import { db } from "@/server/db";
import {
  generationTokens,
  generationTokenTopups,
  type DBGenerationToken,
} from "@/server/db/schema";
import type { WebhookOrderPaidPayload } from "@polar-sh/sdk/models/components/webhookorderpaidpayload.js";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const polarMetadataSchema = z.object({
  tokenAmount: z.coerce.number(),
});

export const handlePolarOrderPaid = async (
  payload: WebhookOrderPaidPayload
) => {
  const { status, createdAt, metadata, id, customer } = payload.data;

  const { externalId } = customer;
  if (!externalId) {
    throw new Error("Customer external ID is required");
  }

  if (status !== "paid") {
    throw new Error("Order is not paid");
  }

  const polarMetadata = polarMetadataSchema.parse(metadata);
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
      amount: polarMetadata.tokenAmount,
      createdAt: createdAt.toISOString(),
      polarOrderId: id,
      profileId: externalId,
    });

    // Increment the generation token available tokens and initial token amount
    await tx
      .update(generationTokens)
      .set({
        availableTokens: sql`${generationTokens.availableTokens} + ${polarMetadata.tokenAmount}`,
        initialTokenAmount: sql`${generationTokens.initialTokenAmount} + ${polarMetadata.tokenAmount}`,
      })
      .where(eq(generationTokens.id, generationToken.id));
  });
};
