import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { CSPostHogProvider } from "@/components/Posthog/PosthogProvider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { microgamma, archivo } from './fonts';

export const metadata: Metadata = {
	title: "Video0.dev",
	description: "AI video generator for personalized birthday songs and videos",
	icons: [{ rel: "icon", url: "/icon.svg" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const inter = Geist({ subsets: ["latin"] });

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const _headers = await headers();
	return (
		<html lang="en" className={`${geist.variable} ${microgamma.variable} ${archivo.variable}`}>
			<body className={inter.className}>
				<CSPostHogProvider>
					<TRPCReactProvider headers={_headers}>{children}</TRPCReactProvider>
				</CSPostHogProvider>
				<Toaster />
			</body>
		</html>
	);
}
