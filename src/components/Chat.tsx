"use client";

import { useChat } from "@ai-sdk/react";
import type { ToolInvocation, UIMessage } from "ai";
import { SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "./AuthProvider/AuthProvider";

// Function to convert markdown-style links to HTML anchors and parse JSON data
const formatMessageWithLinks = (content: string) => {
	// Check if the content is a JSON string with our custom structure
	try {
		const jsonData = JSON.parse(content);
		if (jsonData.type === "song") {
			return jsonData.message;
		}
	} catch (e) {
		// Not a JSON string, proceed with normal formatting
	}

	// Regular expression to match markdown-style links [text](url)
	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	return content.replace(
		linkRegex,
		'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
	);
};

const SongPlayer = ({ url }: { url: string }) => {
	return (
		<div className="mt-2 p-3 bg-muted/50 rounded-md">
			<div className="font-medium mb-2">Your birthday song is ready!</div>
			<audio controls className="w-full mb-2">
				<source src={url} type="audio/mpeg" />
				<track kind="captions" src="" label="English captions" />
				Your browser does not support the audio element.
			</audio>
			<a
				href={url}
				download={"Birthday song"}
				className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
			>
				Download Song
			</a>
		</div>
	);
};

const SongGeneratingIndicator = () => {
	return (
		<div className="mt-2 p-3 bg-muted/50 rounded-md animate-pulse">
			<div className="flex items-center space-x-2">
				<div className="w-4 h-4 rounded-full bg-primary/70" />
				<div className="text-sm">
					Generating your birthday song... This may take a moment
				</div>
			</div>
		</div>
	);
};

export function Chat({
	id,
	initialMessages,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
}) {
	const { messages, handleSubmit, input, setInput, isLoading } = useChat({
		id,
		body: { id },
		initialMessages,
		experimental_throttle: 100,
		sendExtraMessageFields: true,
		generateId: () => crypto.randomUUID(),
		onError: () => {
			toast.error("An error occurred, please try again!");
		},
	});
	const { user } = useUser();

	return (
		<>
			<div className="flex flex-col min-w-0 h-dvh bg-background relative">
				<ScrollArea className="flex-1 overflow-y-auto p-4">
					<div className="space-y-4 ">
						{messages.map((message) => {
							return (
								<div
									key={message.id}
									className={`flex items-start gap-3 ${
										message.role === "user" ? "justify-end" : ""
									}`}
								>
									{message.role !== "user" && (
										<Avatar className="h-8 w-8">
											<AvatarFallback>AI</AvatarFallback>
										</Avatar>
									)}
									<Card
										className={`max-w-[75%] p-3 rounded-lg ${
											message.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}
									>
										<CardContent className="p-0 text-sm whitespace-pre-wrap">
											<div
												dangerouslySetInnerHTML={{
													__html: formatMessageWithLinks(message.content),
												}}
											/>
											{/* Render tool-specific UI if tool invocation */}
											{message.parts.map((part) => {
												if (part.type === "tool-invocation") {
													return (
														<>
															<ToolInvocationMessage
																toolInvocation={part.toolInvocation}
															/>
														</>
													);
												}
												return null;
											})}
										</CardContent>
									</Card>
									{message.role === "user" && (
										<Avatar className="h-8 w-8">
											{/* <AvatarImage src={user?.avatar_url ?? undefined} /> */}
											<AvatarFallback>
												{user?.email?.charAt(0).toUpperCase() ?? "U"}
											</AvatarFallback>
										</Avatar>
									)}
								</div>
							);
						})}
						{/* Display loading indicator for song generation */}
					</div>
				</ScrollArea>

				<form
					onSubmit={handleSubmit}
					className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t bg-background p-4"
				>
					<Input
						placeholder="Type your message..."
						className="flex-1"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
					<Button type="submit" size="icon" disabled={!input.trim()}>
						<SendHorizontalIcon className="h-4 w-4" />
						<span className="sr-only">Send</span>
					</Button>
				</form>
			</div>
		</>
	);
}

const ToolInvocationMessage = ({
	toolInvocation,
}: {
	toolInvocation: ToolInvocation;
}) => {
	if (toolInvocation.state === "partial-call") {
		return <SongGeneratingIndicator />;
	}

	if (toolInvocation.state === "call") {
		return <SongGeneratingIndicator />;
	}

	if (toolInvocation.state === "result") {
		return <SongPlayer url={toolInvocation.result.songUrl} />;
	}
};
