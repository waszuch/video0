"use client";

import { useChat } from "@ai-sdk/react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useUser } from "./AuthProvider/AuthProvider";
import { ChatMessages } from "./ChatMessages";

export function Chat({
	id,
	initialMessages,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
}) {
	const { user } = useUser();
	const { data: availableTokens } = api.tokens.get.useQuery(undefined, {
		enabled: !!user,
	});

	const { mutateAsync: checkout, isPending: isCheckoutPending } =
		api.tokens.checkout.useMutation();

	const trpcUtils = api.useUtils();
	const { messages, handleSubmit, input, setInput, isLoading, status } =
		useChat({
			id,
			body: { id },
			initialMessages,
			experimental_throttle: 100,
			sendExtraMessageFields: true,
			generateId: () => crypto.randomUUID(),
			onFinish: () => {
				trpcUtils.chats.getChatMessagesByChatId.invalidate({
					chatId: id,
				});
				trpcUtils.chats.getChats.invalidate();
				trpcUtils.tokens.get.invalidate();
			},
			onError: (error) => {
				console.error("Error:", error);
				toast.error("An error occurred, please try again!");
			},
		});
	const submitInput = () => {
		if (typeof availableTokens === "number" && availableTokens <= 0) {
			toast.error("You have no tokens left!");
			checkout({ chatId: id }).then((checkout) => {
				PolarEmbedCheckout.create(checkout.url, "dark");
			});

			return;
		}
		window.history.replaceState({}, "", `/chat/${id}`);
		handleSubmit();
	};

	return (
		<AnimatePresence>
			<div className="flex flex-col min-w-0 h-dvh bg-background relative">
				<motion.div
					className="absolute  top-2 right-2 z-10  bg-background px-4 py-1 rounded-full border-border border-2 flex items-center gap-2 text-xs font-semibold"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.3 }}
				>
					Tokens left{" "}
					<span className="font-bold bg-black text-white rounded-full flex items-center w-10 h-10 justify-center aspect-square shrink-0 border-border border">
						{availableTokens}
					</span>
				</motion.div>
				<ChatMessages status={status} messages={messages} />
				{typeof availableTokens === "number" && availableTokens > 0 ? (
					<motion.form
						className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t bg-background p-4"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.3 }}
					>
						<Input
							placeholder="Type your message..."
							className="flex-1"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(event) => {
								if (
									event.key === "Enter" &&
									!event.shiftKey &&
									!event.nativeEvent.isComposing
								) {
									event.preventDefault();

									if (status !== "ready") {
										toast.error(
											"Please wait for the model to finish its response!",
										);
									} else {
										submitInput();
									}
								}
							}}
						/>
						<Button type="submit" size="icon" disabled={!input.trim()}>
							<SendHorizontalIcon className="h-4 w-4" />
							<span className="sr-only">Send</span>
						</Button>
					</motion.form>
				) : (
					<motion.div className="sticky bottom-0 left-0 right-0 flex justify-center items-center gap-2 border-t bg-background p-4 w-full">
						<motion.div
							initial={{ y: 0 }}
							animate={{ y: 3 }}
							exit={{ y: 0 }}
							transition={{
								duration: 1.5,
								type: "spring",
								bounce: 0.5,
								repeat: Number.POSITIVE_INFINITY,
							}}
						>
							<Button
								onClick={() => {
									checkout({ chatId: id }).then((checkout) => {
										PolarEmbedCheckout.create(checkout.url, "dark");
									});
								}}
								disabled={isCheckoutPending}
							>
								{isCheckoutPending
									? "Loading..."
									: "You ran out of tokens! Buy more tokens 🚀"}
							</Button>
						</motion.div>
					</motion.div>
				)}
			</div>
		</AnimatePresence>
	);
}
