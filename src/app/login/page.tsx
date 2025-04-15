import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import AnimatedLogo from "@/components/AnimatedLogo";
import { MouseEventGlow } from "@/components/MouseEventGlow";
import { VideoPlayer } from "@/components/VideoPlayer";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export const metadata: Metadata = {
	title: "Login | Video0.dev",
	description: "Login to Video0.dev - AI video generator for personalized birthday songs and videos",
};

const Testimonial = () => (
	<blockquote className="space-y-2">
		<p className="text-lg">
			"Video0.dev made creating a personalized birthday video for my
			friend so easy! The AI generated something truly special in
			seconds."
		</p>
		<footer className="text-sm">Sofia Chen</footer>
	</blockquote>
);

const LeftPanel = () => (
	<div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-pink-600 opacity-20" />
		
		<div className="relative z-20 flex items-center font-medium text-lg mb-6">
			<Link href="/">
				<AnimatedLogo />
			</Link>
		</div>
		
		<div className="relative z-20 flex-grow flex items-center justify-center w-full">
			<div className="w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
				<VideoPlayer />
			</div>
		</div>
		
		<div className="relative z-20 mt-8">
			<Testimonial />
		</div>
	</div>
);

const LoginForm = () => (
	<div className="lg:p-8 relative z-10">
		<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="font-semibold text-2xl tracking-tight bg-gradient-to-br from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
					Welcome to Video0.dev
				</h1>
				<p className="text-gray-400 text-sm">
					Sign in to create personalized birthday songs and videos
				</p>
			</div>
			
			<Card className="p-5 bg-black border border-purple-700/30">
				<div className="flex flex-col space-y-4">
					<GoogleLoginButton />
				</div>
			</Card>
			
			<p className="px-8 text-center text-gray-400 text-sm">
				By clicking continue, you agree to our{" "}
				<Link
					href="/terms"
					className="underline underline-offset-4 hover:text-purple-400"
				>
					Terms of Service
				</Link>
				{" "}and{" "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-purple-400"
				>
					Privacy Policy
				</Link>
				.
			</p>
		</div>
	</div>
);

export default function LoginPage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-black text-white font-archivo">
			<MouseEventGlow />
			<LeftPanel />
			<LoginForm />
		</div>
	);
}
