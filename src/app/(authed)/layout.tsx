import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { getServerUser } from "@/components/AuthProvider/getServerUser";

export default async function AuthedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { user, session } = await getServerUser();
	return (
		<AuthProvider user={user} session={session}>
			{children}
		</AuthProvider>
	);
}
