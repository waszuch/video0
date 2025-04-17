"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Sidebar from "../../../components/Sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIfMobile = () => setIsMobile(window.innerWidth < 768);

		checkIfMobile();
		window.addEventListener("resize", checkIfMobile);

		return () => window.removeEventListener("resize", checkIfMobile);
	}, []);

	useEffect(() => {
		if (!isMobile) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (sidebarOpen && !target.closest("aside")) {
				setSidebarOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [isMobile, sidebarOpen]);

	return (
		<div className="flex min-h-screen overflow-hidden max-w-full relative">
			<Button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className={`md:hidden fixed top-3 left-3 z-40 size-10 p-2 bg-black/70 border border-purple-700/30 rounded-md ${sidebarOpen ? "hidden" : "flex"}`}
				variant="ghost"
			>
				<Menu className="text-white" />
			</Button>

			<div
				className={`${isMobile ? "fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out" : "relative"} 
				${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
			>
				{isMobile && sidebarOpen && (
					<Button
						onClick={() => setSidebarOpen(false)}
						className="absolute top-3 right-3 z-40 size-10 p-2 bg-black/70 border border-purple-700/30 rounded-md"
						variant="ghost"
					>
						<X className="text-white" />
					</Button>
				)}
				<Sidebar />
			</div>

			<main className={`flex-1 overflow-hidden ${isMobile ? "ml-0" : ""}`}>
				{children}
			</main>
		</div>
	);
}
