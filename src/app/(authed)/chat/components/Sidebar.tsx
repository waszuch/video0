"use client";
import Link from "next/link";
import { UserDropdown } from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

const navItems = [
	{ name: "Home", href: "/" },
	{ name: "All Chats", href: "/chat" },
	{ name: "New Chat", href: "/chat/new" },
	{ name: "Profile", href: "/profile" },
];

export default function Sidebar() {
	const { data: chats = [] } = api.chats.getChats.useQuery();

	return (
		<aside
			style={{
				width: 220,
				background: "#f4f4f4",
				height: "100vh",
				padding: 16,
				boxSizing: "border-box",
			}}
		>
			<nav>
				<Button asChild>
					<Link href="/chat/">Create new Birthday Video</Link>
				</Button>
				<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
					{chats.map((item) => (
						<li key={item.id} style={{ marginBottom: 16 }}>
							<Link
								href={`/chat/${item.id}`}
								style={{
									textDecoration: "none",
									color: "#333",
									fontWeight: 500,
								}}
							>
								{item.title}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<UserDropdown />
		</aside>
	);
}
