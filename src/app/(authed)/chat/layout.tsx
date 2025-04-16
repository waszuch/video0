"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { Button } from "@/components/ui/button";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Check if we're on mobile when component mounts and on window resize
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		// Initial check
		checkIfMobile();
		
		// Add event listener for window resize
		window.addEventListener("resize", checkIfMobile);
		
		// Cleanup
		return () => {
			window.removeEventListener("resize", checkIfMobile);
		};
	}, []);

	// Close sidebar when clicking outside on mobile
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (isMobile && sidebarOpen) {
				const target = e.target as HTMLElement;
				if (!target.closest('aside')) {
					setSidebarOpen(false);
				}
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isMobile, sidebarOpen]);

	return (
		<div style={{ display: "flex", minHeight: "100vh", overflow: "hidden", maxWidth: "100vw", position: "relative" }}>
			{/* Mobile menu button - only show on mobile */}
			<Button 
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className={`md:hidden fixed top-3 left-3 z-40 size-10 p-2 bg-black/70 border border-purple-700/30 rounded-md ${sidebarOpen ? 'hidden' : 'flex'}`}
				variant="ghost"
			>
				<Menu className="text-white" />
			</Button>

			{/* Sidebar - different styling for mobile vs desktop */}
			<div 
				className={`${isMobile ? 'fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out' : 'relative'} 
					${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
			>
				{/* Close button inside sidebar - only on mobile */}
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

			{/* Main content area - full width on mobile */}
			<main 
				style={{ 
					flex: 1, 
					overflow: "hidden",
					marginLeft: isMobile ? 0 : undefined
				}}
			>
				{children}
			</main>
		</div>
	);
}
