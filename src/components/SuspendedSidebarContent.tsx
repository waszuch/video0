import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

const formatChatTitle = (title: string | null) => {
	if (!title) return "Untitled Chat";
	return title.length > 25 ? `${title.substring(0, 22)}...` : title;
};
export const SuspendedSidebarContent = () => {
	const [chats] = api.chats.getChats.useSuspenseQuery();
	const pathname = usePathname();
	return (
		<>
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
									: "border-purple-700/20 bg-black/40 text-gray-300 hover:bg-purple-700/20 hover:border-purple-700/40 hover:shadow-sm hover:shadow-purple-700/10",
							)}
						>
							{formatChatTitle(item.title)}
						</Link>
					</li>
				);
			})}
		</>
	);
};
