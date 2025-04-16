"use client";

import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generatedAssetsDataSchema } from "@/server/schemas/generatedAssetsSchema";
import { Markdown } from "./markdown";

const PurePreviewMessage = ({ message }: { message: UIMessage }) => {
	return (
		<AnimatePresence>
			<motion.div
				data-testid={`message-${message.role}`}
				className="w-full mx-auto max-w-3xl px-4 group/message"
				initial={{ y: 5, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				data-role={message.role}
			>
				<div
					className={cn(
						"flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
					)}
				>
					{message.role === "assistant" && (
						<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
							<div className="translate-y-px">
								<SparklesIcon size={14} />
							</div>
						</div>
					)}

					<div className="flex flex-col gap-4 w-full">
						{message.parts?.map((part, index) => {
							const { type } = part;
							const key = `message-${message.id}-part-${index}`;

							if (type === "text") {
								return (
									<div key={key} className="flex flex-row gap-2 items-start">
										<div
											data-testid="message-content"
											className={cn("flex flex-col gap-4", {
												"bg-primary text-primary-foreground px-3 py-2 rounded-xl":
													message.role === "user",
											})}
										>
											<Markdown>{part.text}</Markdown>
										</div>
									</div>
								);
							}

							if (type === "tool-invocation") {
								const { toolInvocation } = part;
								const { toolName, toolCallId, state } = toolInvocation;

								if (state === "call") {
									return (
										<div
											key={toolCallId}
											className={cn({
												skeleton: ["generateMusicFromLyrics"].includes(
													toolName,
												),
											})}
										>
											{toolName === "generateMusicFromLyrics" ? (
												<SongGeneratingIndicator />
											) : null}
										</div>
									);
								}

								if (state === "result") {
									const { result } = toolInvocation;
									const parsedResult = generatedAssetsDataSchema.parse(result);

									if (parsedResult.type === "birthdaySong") {
										return (
											<div key={toolCallId}>
												<SongPlayer
													songUrl={parsedResult.songUrl}
													linkToSongPage={`/happy-birthday/${parsedResult.id}`}
												/>
											</div>
										);
									}
									if (parsedResult.type === "birthdayVideo") {
										return (
											<div key={toolCallId}>birthday video display @todo</div>
										);
									}
								}
							}
						})}
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export const PreviewMessage = memo(
	PurePreviewMessage,
	(prevProps, nextProps) => {
		if (prevProps.message.id !== nextProps.message.id) return false;
		if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

		return true;
	},
);

export const ThinkingMessage = () => {
	const role = "assistant";

	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 group/message "
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
			data-role={role}
		>
			<div
				className={cn(
					"flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
					{
						"group-data-[role=user]/message:bg-muted": true,
					},
				)}
			>
				<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
					<SparklesIcon size={14} />
				</div>

				<div className="flex flex-col gap-2 w-full">
					<div className="flex flex-col gap-4 text-muted-foreground">
						Hmm...
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const SongPlayer = ({
	songUrl,
	linkToSongPage,
}: {
	songUrl: string;
	linkToSongPage: string;
}) => {
	return (
		<div className="mt-2 p-3 bg-muted/50 rounded-md">
			<div className="font-medium mb-2">Your birthday song is ready!</div>
			<audio controls className="w-full mb-2">
				<source src={songUrl} type="audio/mpeg" />
				<track kind="captions" src="" label="English captions" />
				Your browser does not support the audio element.
			</audio>
			<a
				href={songUrl}
				download={"Birthday song"}
				className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
			>
				Download Song
			</a>
			<button
				type="button"
				onClick={() => {
					toast.success("Link copied to clipboard");
					navigator.clipboard.writeText(
						window.location.origin + linkToSongPage,
					);
				}}
				className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm ml-2 cursor-pointer"
			>
				Copy birthday video link
			</button>
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
