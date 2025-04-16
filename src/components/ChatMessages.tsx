import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo, useEffect, useRef } from "react";
import { PreviewMessage, ThinkingMessage } from "./ChatMessage";

interface MessagesProps {
	status: UseChatHelpers["status"];
	messages: Array<UIMessage>;
}

function PureMessages({ status, messages }: MessagesProps) {
	const [messagesContainerRef, messagesEndRef] =
		useScrollToBottom<HTMLDivElement>();

	return (
		<div
			ref={messagesContainerRef}
			className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
		>
			{messages.length === 0 && <Greeting />}

			{messages.map((message, index) => (
				<PreviewMessage key={message.id} message={message} />
			))}

			{status === "submitted" &&
				messages.length > 0 &&
				messages[messages.length - 1]?.role === "user" && <ThinkingMessage />}

			<div
				ref={messagesEndRef}
				className="shrink-0 min-w-[24px] min-h-[24px]"
			/>
		</div>
	);
}

export const ChatMessages = memo(PureMessages, (prevProps, nextProps) => {
	if (prevProps.status !== nextProps.status) return false;
	if (prevProps.status && nextProps.status) return false;
	if (prevProps.messages.length !== nextProps.messages.length) return false;
	if (!equal(prevProps.messages, nextProps.messages)) return false;

	return true;
});

const Greeting = () => {
	return (
		<div
			key="overview"
			className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
		>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 10 }}
				transition={{ delay: 0.5 }}
				className="text-2xl font-semibold"
			>
				I will help you generate a birthday video song.
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 10 }}
				transition={{ delay: 0.6 }}
				className="text-2xl text-zinc-500"
			>
				Please start by typing the name of the person having a birthday.
			</motion.div>
		</div>
	);
};

function useScrollToBottom<T extends HTMLElement>() {
	const containerRef = useRef<T>(null);
	const endRef = useRef<T>(null);

	useEffect(() => {
		const container = containerRef.current;
		const end = endRef.current;

		if (container && end) {
			const observer = new MutationObserver(() => {
				end.scrollIntoView({ behavior: "instant", block: "end" });
			});

			observer.observe(container, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true,
			});

			return () => observer.disconnect();
		}
	}, []);

	return [containerRef, endRef];
}
