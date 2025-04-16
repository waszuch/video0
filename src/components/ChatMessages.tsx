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
			className="flex flex-col min-w-0 gap-4 md:gap-6 flex-1 overflow-y-auto overflow-x-hidden pt-4 px-3 md:px-8 text-white w-full"
			style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%' }}
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
	const firstLine = "Let's create a unique birthday video song!";
	const secondLine = "Just tell me the name of the person celebrating.";
	
	// Calculate when second line should start (after first line completes)
	const firstLineCompletionTime = 0.5 + firstLine.length * 0.03;
	const pauseBetweenLines = 0.8; // Pause between first and second line
	const secondLineStartTime = firstLineCompletionTime + pauseBetweenLines;

	return (
		<div
			key="overview"
			className="max-w-2xl mx-auto md:mt-20 mt-8 px-4 md:px-8 flex flex-col justify-center"
		>
			<div className="text-xl md:text-3xl font-semibold leading-relaxed overflow-hidden bg-gradient-to-br from-white via-gray-300  bg-clip-text">
				{firstLine.split("").map((char, index) => (
					<motion.span
						key={`first-${index}`}
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.2,
							delay: 0.5 + index * 0.03,
							ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
						}}
						style={{ display: 'inline-block', lineHeight: 1.5 }}
						className=""
					>
						{char === " " ? "\u00A0" : char}
					</motion.span>
				))}
			</div>
			<div className="text-lg md:text-2xl text-zinc-500 mt-4 md:mt-6 leading-relaxed overflow-hidden">
				{secondLine.split("").map((char, index) => (
					<motion.span
						key={`second-${index}`}
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.2,
							delay: secondLineStartTime + index * 0.03,
							ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
						}}
						style={{ display: 'inline-block', lineHeight: 1.5 }}
					>
						{char === " " ? "\u00A0" : char}
					</motion.span>
				))}
			</div>
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
