import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		SUPABASE_SERVICE_KEY: z.string().min(1),
		OPENROUTER_API_KEY: z.string().min(1),
		REPLICATE_API_TOKEN: z.string().min(1),
		POLAR_ACCESS_TOKEN: z.string().min(1),
		POLAR_WEBHOOK_SECRET: z.string().min(1),
		LUMAAI_API_KEY: z.string().min(1),
		NOTION_TOKEN: z.string().min(1),
		NOTION_DATABASE_ID: z.string().min(1),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
		NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
		// NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
		OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
		REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
		POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
		POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
		LUMAAI_API_KEY: process.env.LUMAAI_API_KEY,
		NOTION_TOKEN: process.env.NOTION_TOKEN,
		NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
