"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/Loading";
import { useUser } from "./AuthProvider";

export default function PrivatePage({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();

	const { user, isLoading } = useUser();

	useEffect(() => {
		if (!user && !isLoading) {
			toast.info("You must be logged in to access this page");
			router.push("/login");
		}
	}, [user, router, isLoading]);

	if (!user || isLoading) return <LoadingScreen />;

	return <>{children}</>;
}
