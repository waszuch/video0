"use client";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { ChevronsUpDown, LogOut, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useUser } from "@/components/AuthProvider/AuthProvider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/server/supabase/supabaseClient";
import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export const UserDropdown = () => {
	const { user } = useUser();
	const isMobile = useIsMobile();
	useEffect(() => {
		PolarEmbedCheckout.init();
	}, []);
	const { mutateAsync: checkout, isPending: isCheckoutPending } =
		api.tokens.checkout.useMutation();
	if (!user) return null;

	const avatar = user.user_metadata.avatar_url ?? "";
	const name = user.user_metadata.display_name ?? "";
	const email = user.email ?? "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-3 px-2 py-1.5 rounded-lg w-full cursor-pointer"
					variant="ghost"
				>
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={avatar} alt={email} />
						<AvatarFallback className="rounded-lg">
							{email
								?.split("@")
								?.map((n) => n?.[0])
								?.join("") || "CN"}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight min-w-0">
						<span className="truncate font-medium">{name}</span>
						<span className="truncate text-xs">{email}</span>
					</div>
					<ChevronsUpDown className="ml-auto size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="min-w-56 rounded-lg "
				side={isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={avatar} alt={email} />
							<AvatarFallback className="rounded-lg">
								{email
									?.split("@")
									?.map((n) => n?.[0])
									?.join("") || "CN"}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight min-w-0">
							<span className="truncate font-medium">{name}</span>
							<span className="truncate text-xs">{email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="cursor-pointer"
						onMouseDown={() =>
							checkout({}).then((checkout) => {
								PolarEmbedCheckout.create(checkout.url, "dark");
							})
						}
					>
						<Sparkles className="mr-2 size-4" />
						Buy more credits
					</DropdownMenuItem >
				</DropdownMenuGroup>
				{/* <DropdownMenuSeparator /> */}
				{/* <DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck className="mr-2 size-4" />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard className="mr-2 size-4" />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell className="mr-2 size-4" />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup> */}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer" onClick={() => supabase().auth.signOut()}>
					<LogOut className="mr-2 size-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
