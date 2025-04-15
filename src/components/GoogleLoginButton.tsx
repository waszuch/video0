"use client";

import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/server/supabase/supabaseClient";
import { Button } from "./ui/button";

export const GoogleLoginButton = () => {
	return (
		<Button
			variant="outline"
			type="button"
			className="flex items-center justify-center gap-2"
			onClick={() => {
				supabase().auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: `${window.location.origin}/chat/random-id-we-need-to-update-it-later`,
					},
				});
			}}
		>
			<FcGoogle className="mr-2 h-4 w-4" />
			Continue with Google
		</Button>
	);
};
