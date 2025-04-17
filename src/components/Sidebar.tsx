/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */

import Link from "next/link";
import { Suspense } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { TokenDisplay } from "@/components/TokenDisplay";
import { UserDropdown } from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { SuspendedSidebarContent } from "./SuspendedSidebarContent";

const navItems = [
	{
		name: "Privacy",
		href: "/privacy",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-4 w-4 mr-1"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fillRule="evenodd"
					d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z"
					clipRule="evenodd"
				/>
			</svg>
		),
	},
	{
		name: "Terms",
		href: "/terms",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-4 w-4 mr-1"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fillRule="evenodd"
					d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
					clipRule="evenodd"
				/>
			</svg>
		),
	},
];

const LegalLink = ({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) => (
	<Link
		href={href}
		className="bg-black no-underline group cursor-pointer relative rounded-full p-px text-xs font-medium leading-6 text-gray-400 hover:text-white inline-flex items-center transition-colors"
	>
		<span className="absolute inset-0 overflow-hidden rounded-full">
			<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
		</span>
		<div className="relative flex items-center z-10 rounded-full bg-black py-1 px-3 ring-1 ring-white/10">
			{children}
		</div>
	</Link>
);

export default function Sidebar() {
	return (
		<aside className="w-[260px] md:w-[280px] bg-black/95 backdrop-blur-sm border-r border-purple-700/30 h-screen p-4 font-archivo text-white flex flex-col shadow-xl md:shadow-none">
			<div className="flex items-center justify-between mb-6">
				<Link
					href="/"
					className="relative z-20 flex items-center font-medium text-lg"
				>
					<AnimatedLogo />
				</Link>
			</div>

			<Button
				asChild
				className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mb-6 py-6 md:py-4"
			>
				<Link
					href="/chat/"
					className="flex items-center justify-center gap-2 group"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5 transition-transform duration-200 group-hover:scale-125"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
							clipRule="evenodd"
						/>
					</svg>
					Create new video
				</Link>
			</Button>

			<div className="text-sm text-gray-400 font-medium mb-2 mt-2">
				Recent Generations
			</div>

			<nav className="flex-1 overflow-y-auto scrollbar-hide">
				<ul className="space-y-3 px-1">
					<Suspense
						fallback={
							// biome-ignore lint/complexity/noUselessFragments: <explanation>
							<>
								{[1, 2, 3].map((i) => (
									<li key={i}>
										<div className="block py-3 px-4 rounded-md text-sm border border-purple-700/20 bg-black/40 text-gray-300">
											<div className="h-4 w-3/4 bg-purple-700/20 rounded animate-pulse" />
										</div>
									</li>
								))}
							</>
						}
					>
						<SuspendedSidebarContent />
					</Suspense>
				</ul>
			</nav>

			<TokenDisplay />

			<div className="border-t border-purple-700/30 pt-4 mt-auto">
				<UserDropdown />
				<div className="flex gap-2 justify-between mt-3">
					{navItems.map((item) => (
						<LegalLink key={item.name} href={item.href}>
							{item.icon}
							<span>{item.name}</span>
						</LegalLink>
					))}
				</div>
			</div>
		</aside>
	);
}
