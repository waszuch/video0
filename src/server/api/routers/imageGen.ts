import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "@/env";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { chats } from "@/server/db/schema";
import { supabase } from "@/server/supabase/supabaseClient";

export const imageGenRouter = createTRPCRouter({
	generateImages: privateProcedure
		.input(
			z.object({
				chatId: z.string(),
				originalImageUrls: z.array(z.string()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { user } = ctx;
			if (!user) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// Lazy import LumaAI
			const { LumaAI } = await import("lumaai");
			const client = new LumaAI({
				authToken: env.LUMAAI_API_KEY,
			});

			try {
				// Create separate generations for each image URL
				const generationPromises = input.originalImageUrls.map(
					async (imageUrl) => {
						// Create individual generation for each image
						const generation = await client.generations.image.create({
							prompt:
								"Cartoon character, attractive and charming. Celebrating their birthday with a festive appearance. Attractive",
							aspect_ratio: "9:16",
							character_ref: {
								identity0: { images: [imageUrl] },
							},
						});

						// Ensure we have a valid generation ID
						const generationId = generation.id;
						if (!generationId) {
							throw new Error("Generation ID is undefined");
						}

						// Poll until completion
						let completed = false;
						let currentGeneration = generation;

						while (!completed) {
							// Get the latest generation status
							currentGeneration = await client.generations.get(generationId);

							if (currentGeneration.state === "completed") {
								completed = true;
								const resultImageUrl = currentGeneration.assets?.image;
								if (!resultImageUrl) {
									throw new Error("Image URL is undefined");
								}

								const imageBlob = await fetch(resultImageUrl).then((res) =>
									res.blob(),
								);
								const { data, error } = await supabase()
									.storage.from("images")
									.upload(`${generationId}.jpg`, imageBlob, {
										upsert: true,
									});

								if (error) {
									throw new Error(error.message);
								}

								// Get the public URL
								const { data: signedUrl, error: signedUrlError } =
									await supabase()
										.storage.from("images")
										.createSignedUrl(`${generationId}.jpg`, 9999999999);
								if (signedUrlError) throw signedUrlError;

								return {
									originalUrl: imageUrl,
									generationId,
									transformedImageUrl: signedUrl,
								};
							}

							if (currentGeneration.state === "failed") {
								throw new Error(
									`Generation failed: ${currentGeneration.failure_reason || "Unknown reason"}`,
								);
							}

							// Wait before checking again
							await new Promise((r) => setTimeout(r, 3000));
						}
					},
				);

				// Wait for all generations to complete
				const generationResults = await Promise.all(generationPromises);

				const transformedImagesUrls = generationResults
					.map((result) => result?.transformedImageUrl.signedUrl)
					.filter(Boolean) as string[];

				await ctx.db.insert(chats).values({
					id: input.chatId,
					transformedImages: transformedImagesUrls,
					createdAt: new Date(),
					title: "",
					profileId: user.id,
				});

				return {
					success: true,
					results: generationResults,
				};
			} catch (error) {
				console.error("Error processing images:", error);
				return {
					success: false,
					error: error instanceof Error ? error.message : String(error),
				};
			}
		}),
});
