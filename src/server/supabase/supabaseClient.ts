import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

export const getServiceSupabase = () =>
	createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

export const clientSupabase = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabase = () =>
	typeof window === "undefined" ? getServiceSupabase() : clientSupabase;

export const getUserAsAdmin = async (token: string) => {
	const { data, error } = await getServiceSupabase().auth.getUser(token);

	if (error) {
		console.error(error);
		throw error;
	}

	return data;
};

export const storageBucketsNames = {} as const;
