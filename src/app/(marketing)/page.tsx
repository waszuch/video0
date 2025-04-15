import Link from "next/link";
import Image from "next/image";
import AnimatedLogo from "@/components/AnimatedLogo";
import { MouseEventGlow } from "@/components/MouseEventGlow";
import VideoGrid from "@/components/VideoGrid";
import type { ReactNode } from "react";

interface NavButtonProps {
	href: string;
	filled?: boolean;
	children: ReactNode;
}

const NavButton = ({ href, filled = false, children }: NavButtonProps) => (
	<Link
		href={href}
		className="bg-black no-underline group cursor-pointer relative rounded-2xl p-px text-sm font-semibold leading-6 text-white inline-block"
	>
		<span className="absolute inset-0 overflow-hidden rounded-2xl">
			<span className="absolute inset-0 rounded-2xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.6)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
		</span>
		<div className={`relative flex items-center z-10 rounded-2xl ${filled ? 'bg-gradient-to-b from-purple-600 to-purple-800' : 'bg-black'} py-1.5 px-4 ring-1 ring-purple-700/30`}>
			{children}
		</div>
		<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-opacity duration-500 group-hover:opacity-40" />
	</Link>
);

const HeroButton = ({ href, children }: { href: string; children: ReactNode }) => (
	<Link
		href={href}
		className="bg-black no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-2xl p-px text-lg md:text-2xl font-semibold leading-6 text-white inline-block mb-8 w-auto"
	>
		<span className="absolute inset-0 overflow-hidden rounded-2xl">
			<span className="absolute inset-0 rounded-2xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.6)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
		</span>
		<div className="relative flex items-center z-10 rounded-2xl bg-gradient-to-b from-purple-600 to-purple-800 py-4 px-10 ring-1 ring-purple-700/30">
			{children}
		</div>
		<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-all duration-500 group-hover:opacity-80 group-hover:h-[2px] group-hover:w-[calc(100%-1rem)]" />
	</Link>
);

const LegalLink = ({ href }: { href: string }) => (
	<Link
		href={href}
		className="bg-black no-underline group cursor-pointer relative rounded-full p-px text-xs font-medium leading-6 text-gray-400 hover:text-white inline-flex items-center transition-colors"
	>
		<span className="absolute inset-0 overflow-hidden rounded-full">
			<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
		</span>
		<div className="relative flex items-center z-10 rounded-full bg-black py-1 px-3 ring-1 ring-white/10">
			<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
				<path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
			</svg>
			<span>Legal</span>
		</div>
	</Link>
);

const Stars = () => (
	<div className="flex items-center mb-8">
		<div className="flex text-yellow-400">
			{Array(5).fill('★').map((star, i) => (
				<span key={i}>{star}</span>
			))}
		</div>
		<span className="ml-2 text-gray-400">Loved by users</span>
	</div>
);

export default async function Home() {
	return (
		<main className="flex min-h-screen flex-col bg-black text-white font-archivo relative overflow-hidden">
			<MouseEventGlow />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-screen relative z-10">
				<div className="flex flex-col p-8 lg:p-16 relative">
					<header className="flex justify-between items-center mb-16">
						<AnimatedLogo />
						<nav className="flex gap-4">
							<NavButton href="/pricing">Pricing</NavButton>
							<NavButton href="/login" filled>Login</NavButton>
						</nav>
					</header>

					<div className="flex-grow flex flex-col justify-center">
						<h1 className="text-7xl font-bold text-left mb-6 bg-gradient-to-br from-white via-gray-300 to-gray-500 text-transparent bg-clip-text">
							Birthday video generator.
						</h1>
						<p className="text-lg text-gray-300 mb-8">
							Generate personalized videos for your friends and family in seconds
						</p>
						
						<div className="flex">
							<HeroButton href="/login">
								<img 
									src="/magic.svg" 
									alt="Magic wand" 
									className="h-7 w-7 brightness-0 invert mr-3 transition-transform duration-300 group-hover:scale-125 group-hover:animate-juggle"
								/>
								<span>Generate for Free</span>
							</HeroButton>
						</div>
						
						<Stars />
					</div>

					<div className="absolute bottom-4 right-8 lg:bottom-8 lg:right-16">
						<LegalLink href="/privacy" />
					</div>
				</div>

				<VideoGrid />
			</div>
		</main>
	);
}
