import { z } from "zod";

const birthdaySongDataSchema = z.object({
	type: z.literal("birthdaySong"),
	songUrl: z.string(),
	lyrics: z.string(),
});

const birthdayVideoDataSchema = z.object({
	type: z.literal("birthdayVideo"),
	videoUrl: z.string(),
	imagesUrl: z.array(z.string()),
	songUrl: z.string(),
	lyrics: z.string(),
});

export const generatedAssetsDataSchema = z.discriminatedUnion("type", [
	birthdaySongDataSchema,
	birthdayVideoDataSchema,
]);

export type GeneratedAssetsDataSchema = z.infer<
	typeof generatedAssetsDataSchema
>;
