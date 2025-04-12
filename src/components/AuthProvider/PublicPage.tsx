"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/Loading";
import { useUser } from "./AuthProvider";

export default function PublicPage({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { user, isLoading } = useUser();
	const isUserDataLoaded = !isLoading;

	useEffect(() => {
		if (user && isUserDataLoaded) {
			router.push("/generate");
		}
	}, [user, isUserDataLoaded, router]);

	if (user ?? !isUserDataLoaded) return <LoadingScreen />;

	return <>{children}</>;
}
