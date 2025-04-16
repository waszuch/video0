"use client";

import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/server/supabase/supabaseClient";

export const GoogleLoginButton = () => {
	return (
		<button
			type="button"
			className="w-full bg-black group cursor-pointer relative shadow-lg shadow-purple-900/20 rounded-2xl p-px text-base font-semibold leading-6 text-white"
			onClick={() => {
				supabase().auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: `${window.location.origin}/chat`,
					},
				});
			}}
		>
			<span className="absolute inset-0 overflow-hidden rounded-2xl">
				<span className="absolute inset-0 rounded-2xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.6)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
			</span>
			<div className="relative flex items-center justify-center z-10 rounded-2xl bg-gradient-to-b from-purple-600 to-purple-800 py-3 px-4 ring-1 ring-purple-700/30">
				<FcGoogle className="mr-2 h-5 w-5" />
				Continue with Google
			</div>
			<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-opacity duration-500 group-hover:opacity-40" />
		</button>
	);
};
