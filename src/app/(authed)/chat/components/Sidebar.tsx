"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { cn } from "@/lib/utils";

const navItems = [
	{ name: "Home", href: "/" },
	{ name: "All Chats", href: "/chat" },
	{ name: "New Chat", href: "/chat/new" },
	{ name: "Profile", href: "/profile" },
];

export default function Sidebar() {
	const { data: chats = [] } = api.chats.getChats.useQuery();
	const pathname = usePathname();

	// Format the chat title to be more readable
	const formatChatTitle = (title: string | null) => {
		if (!title) return "Untitled Chat";
		
		// Limit title length
		if (title.length > 25) {
			return title.substring(0, 22) + "...";
		}
		
		return title;
	};

	return (
		<aside className="w-[260px] md:w-[280px] bg-black/95 backdrop-blur-sm border-r border-purple-700/30 h-screen p-4 font-archivo text-white flex flex-col shadow-xl md:shadow-none">
			<div className="flex items-center justify-between mb-6">
				<Link href="/" className="relative z-20 flex items-center font-medium text-lg">
					<AnimatedLogo />
				</Link>
			</div>

			<Button 
				asChild
				className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mb-6 py-6 md:py-4"
			>
				<Link href="/chat/">Create new Birthday Video</Link>
			</Button>

			<div className="text-sm text-gray-400 font-medium mb-2 mt-2">Recent Generations</div>
			
			<nav className="flex-1 overflow-y-auto scrollbar-hide">
				<ul className="space-y-3 px-1">
					{chats.map((item) => {
						const isActive = pathname === `/chat/${item.id}`;
						return (
							<li key={item.id}>
								<Link
									href={`/chat/${item.id}`}
									className={cn(
										"block py-3 px-4 rounded-md text-sm border transition-all duration-200",
										isActive 
											? "bg-purple-700/30 border-purple-500/50 text-white shadow-sm shadow-purple-700/20" 
											: "border-purple-700/20 bg-black/40 text-gray-300 hover:bg-purple-700/20 hover:border-purple-700/40 hover:shadow-sm hover:shadow-purple-700/10"
									)}
								>
									{formatChatTitle(item.title)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="border-t border-purple-700/30 pt-4 mt-auto">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.name}>
							<Link
								href={item.href}
								className="block py-3 px-3 rounded-md text-gray-300 hover:bg-purple-700/20 transition-colors text-sm"
							>
								{item.name}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</aside>
	);
}
