"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "./AuthProvider/AuthProvider";

// Function to convert markdown-style links to HTML anchors
const formatMessageWithLinks = (content: string) => {
	// Regular expression to match markdown-style links [text](url)
	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	return content.replace(
		linkRegex,
		'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
	);
};

export function Chat({
	id,
	initialMessages,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
}) {
	const { messages, handleSubmit, input, setInput } = useChat({
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
						{messages.map((message) => (
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
						))}
						{/* Initial prompt message */}
						{messages.length === 0 && (
							<Card className="mt-4 bg-secondary text-secondary-foreground">
								<CardContent className="p-3 text-sm">
									<p>
										Welcome! I can help write personalized birthday song lyrics.
										To get started, please tell me about the birthday person.
										What's their name and how old are they turning?
									</p>
								</CardContent>
							</Card>
						)}
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
