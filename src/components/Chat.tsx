"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { ChatMessages } from "./ChatMessages";
import { MouseEventGlow } from "@/components/MouseEventGlow";

export function Chat({
	id,
	initialMessages,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
}) {
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
			},
			onError: () => {
				toast.error("An error occurred, please try again!");
			},
		});
	const submitInput = () => {
		window.history.replaceState({}, "", `/chat/${id}`);
		handleSubmit();
	};

	return (
		<>
			<div className="flex flex-col min-w-0 h-dvh bg-black text-white font-archivo relative overflow-x-hidden">
				<MouseEventGlow />
				<div className="relative z-10 flex-1 overflow-hidden">
					<ChatMessages status={status} messages={messages} />
				</div>
				<form className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t border-purple-700/30 bg-black p-3 md:p-4 z-10">
					<Input
						placeholder="Type your message..."
						className="flex-1 bg-black/80 border-purple-700/30 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 h-12 md:h-auto"
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
					<Button 
						type="submit" 
						size="icon" 
						disabled={!input.trim()}
						className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 w-12 md:h-10 md:w-10"
					>
						<SendHorizontalIcon className="h-5 w-5 md:h-4 md:w-4" />
						<span className="sr-only">Send</span>
					</Button>
				</form>
			</div>
		</>
	);
}
