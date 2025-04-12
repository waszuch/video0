"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { supabase } from "@/server/supabase/supabaseClient";
import { api } from "@/trpc/react";

export const AuthContext = createContext<{
	user: User | null;
	session: Session | null;
	isLoading: boolean;
}>({
	user: null,
	session: null,
	isLoading: false,
});

const setCookiesLocalhost = (session: Session | null) => {
	if (session) {
		const maxAge = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years, never expires
		document.cookie = `access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax;`;
		document.cookie = `refresh-token=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax;`;
	} else {
		const expires = new Date(0).toUTCString();
		document.cookie = `access-token=; path=/; expires=${expires}; SameSite=Lax;`;
		document.cookie = `refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
	}
};

const setCookies = (session: Session | null) => {
	if (
		process.env.NODE_ENV === "development" ||
		window.location.hostname.includes("localhost")
	) {
		return setCookiesLocalhost(session);
	}

	if (session) {
		const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires

		document.cookie = `access-token=${session.access_token}; path=/;  max-age=${maxAge}; SameSite=Lax;`;
		document.cookie = `refresh-token=${session.refresh_token}; path=/;  max-age=${maxAge}; SameSite=Lax;`;
	} else {
		const expires = new Date(0).toUTCString();

		document.cookie = `access-token=; path=/;  expires=${expires}; SameSite=Lax;`;
		document.cookie = `refresh-token=; path=/;  expires=${expires}; SameSite=Lax;`;
	}
};

export const AuthProvider = ({
	user: initialUser,
	session: initialSession,
	children,
}: {
	user: User | null;
	session: Session | null;
	children: ReactNode;
}) => {
	const [userSession, setUserSession] = useState<Session | null>(
		initialSession,
	);
	const [user, setUser] = useState<User | null>(initialUser);
	const [isLoading, setIsLoading] = useState(!initialUser);

	const router = useRouter();

	const utils = api.useUtils();
	const trpcUtils = api.useUtils();
	useEffect(() => {
		void supabase()
			.auth.getSession()
			.then(({ data: { session } }) => {
				setUserSession(session);
				setUser(session?.user ?? null);
				setCookies(session);
				setIsLoading(false);
			});

		const { data: authListener } = supabase().auth.onAuthStateChange(
			(event, session) => {
				setUserSession(session);
				setUser(session?.user ?? null);
				setCookies(session);
				setIsLoading(false);

				if (
					event === "SIGNED_OUT" ||
					event === "SIGNED_IN" ||
					event === "INITIAL_SESSION"
				) {
					router.refresh();
				}

				if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
					if (session?.user) {
						const identifyPosthogUser = async () => {
							posthog.identify(
								session?.user?.id,
								{
									email: session?.user.email,
									avatar: session?.user.user_metadata?.avatar_url,
								},
								{
									supabase_id: session?.user.id ?? "",
								},
							);
						};
						identifyPosthogUser();
					} else {
						posthog.reset();
					}
				}

				if (event === "SIGNED_OUT") {
					posthog.reset();
				}
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [router, utils]);

	const value = {
		session: userSession,
		user,
		isLoading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useUser must be used within a AuthContextProvider.");
	}

	return context;
};
