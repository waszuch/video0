import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { CSPostHogProvider } from "@/components/Posthog/PosthogProvider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Video0.dev",
	description: "AI video generator for personalized birthday songs and videos",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const _headers = await headers();
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<CSPostHogProvider>
					<TRPCReactProvider headers={_headers}>{children}</TRPCReactProvider>
				</CSPostHogProvider>
			</body>
		</html>
	);
}
