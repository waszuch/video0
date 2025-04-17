"use client";

import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

const initialTokens = 30;
export function TokenDisplay() {
	const { data: availableTokens } = api.tokens.get.useQuery();

	const { mutateAsync: checkout, isPending: isCheckoutPending } =
		api.tokens.checkout.useMutation();

	const handleBuyMore = async () => {
		try {
			const checkoutResult = await checkout({ chatId: "" });
			PolarEmbedCheckout.create(checkoutResult.url, "dark");
		} catch (error) {
			toast.error("Failed to open checkout");
		}
	};

	return (
		<div className="border-t border-purple-700/30 pt-4 pb-4">
			<div className="flex flex-col space-y-3">
				{/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="bg-gradient-to-br from-purple-900/30 to-black/90 rounded-lg p-3 border border-purple-700/40 cursor-pointer hover:border-purple-500/60 transition-colors"
					onClick={handleBuyMore}
				>
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-purple-200">Videos left</span>
						<div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-bold cursor-pointer hover:shadow-md transition-shadow">
							{availableTokens || 0}/{initialTokens || 0}
						</div>
					</div>
					<div className="w-full bg-purple-900/20 rounded-full h-1.5 mb-1">
						<div
							className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
							style={{
								width: `${availableTokens && initialTokens ? Math.min(100, (availableTokens / initialTokens) * 100) : 0}%`,
							}}
						/>
					</div>
				</div>

				<Button
					onClick={handleBuyMore}
					disabled={isCheckoutPending}
					className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium cursor-pointer"
				>
					<Sparkles className="mr-2 size-4" />
					Buy more credits
				</Button>
			</div>
		</div>
	);
}
