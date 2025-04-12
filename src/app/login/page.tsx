import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Login | Video0.dev",
	description:
		"Login to Video0.dev - AI video generator for personalized birthday songs and videos",
};

export default function LoginPage() {
	return (
		<div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-pink-600" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					<Image
						src="/logo.svg"
						alt="Video0.dev Logo"
						width={40}
						height={40}
						className="mr-2"
					/>
					Video0.dev
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							"Video0.dev made creating a personalized birthday video for my
							friend so easy! The AI generated something truly special in
							seconds."
						</p>
						<footer className="text-sm">Sofia Chen</footer>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="font-semibold text-2xl tracking-tight">
							Welcome to Video0.dev
						</h1>
						<p className="text-muted-foreground text-sm">
							Sign in to create personalized birthday songs and videos
						</p>
					</div>
					<div className="grid gap-6">
						<Card className="p-5">
							<div className="flex flex-col space-y-4">
								<GoogleLoginButton />
							</div>
						</Card>
					</div>
					<p className="px-8 text-center text-muted-foreground text-sm">
						By clicking continue, you agree to our{" "}
						<Link
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Terms of Service{" "}
						</Link>
						and
						<Link
							href="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							{" "}
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
