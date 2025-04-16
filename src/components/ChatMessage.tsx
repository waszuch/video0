"use client";

import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { generatedAssetsDataSchema } from "@/server/schemas/generatedAssetsSchema";
import { Markdown } from "./markdown";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const PurePreviewMessage = ({ message }: { message: UIMessage }) => {
	return (
		<AnimatePresence>
			<motion.div
				data-testid={`message-${message.role}`}
				className="w-full mx-auto max-w-2xl px-2 md:px-4 group/message overflow-hidden"
				initial={{ y: 5, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				data-role={message.role}
			>
				<div
					className={cn(
						"flex gap-3 md:gap-4 w-full",
						message.role === "user" ? "justify-end" : ""
					)}
				>
					{message.role === "assistant" && (
						<div className="size-8 flex items-center rounded-full justify-center shrink-0 bg-transparent">
							<Image 
								src="/icon.svg" 
								alt="AI Assistant" 
								width={28} 
								height={28} 
								className="w-7 h-7"
							/>
						</div>
					)}

					<div className={cn(
						"flex flex-col gap-3 md:gap-4 overflow-hidden",
						message.role === "assistant" ? "w-[85%] md:w-[85%]" : "w-[85%] md:w-[75%]"
					)}>
						{message.parts?.map((part, index) => {
							const { type } = part;
							const key = `message-${message.id}-part-${index}`;

							if (type === "text") {
								// Skip rendering text parts that contain raw JSON of video data
								// This prevents showing the raw JSON output in the chat
								if (part.text && (
									part.text.includes('"type":"birthdayVideo"') ||
									part.text.includes('"imagesUrl"') ||
									part.text.includes('"videoUrl"') && part.text.includes('"songUrl"') && part.text.includes('"lyrics"')
								)) {
									return null;
								}
								
								return (
									<div key={key} className={cn(
										"flex flex-row gap-2 items-start",
										message.role === "user" ? "justify-end" : ""
									)}>
										<div
											data-testid="message-content"
											className={cn("flex flex-col gap-3 md:gap-4 overflow-hidden text-sm md:text-base", {
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
												skeleton: ["generateMusicFromLyrics", "generateVideoFromMusic"].includes(
													toolName,
												),
											})}
										>
											{toolName === "generateMusicFromLyrics" ? (
												<SongGeneratingIndicator />
											) : toolName === "generateVideoFromMusic" ? (
												<VideoGeneratingIndicator />
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
												<SongPlayer songUrl={parsedResult.songUrl} />
											</div>
										);
									}
									if (parsedResult.type === "birthdayVideo") {
										return (
											<div key={toolCallId}>
												<VideoPlayer 
													videoData={parsedResult} 
												/>
											</div>
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
			className="w-full mx-auto max-w-2xl px-2 md:px-4 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
			data-role={role}
		>
			<div
				className={cn(
					"flex gap-3 md:gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
					{
						"group-data-[role=user]/message:bg-muted": true,
					},
				)}
			>
				<div className="size-7 md:size-8 flex items-center rounded-full justify-center shrink-0 bg-transparent">
					<Image 
						src="/icon.svg" 
						alt="AI Assistant" 
						width={28} 
						height={28} 
						className="w-7 h-7"
					/>
				</div>

				<div className="flex flex-col gap-2 w-[85%]">
					<div className="flex flex-col gap-3 md:gap-4 text-muted-foreground text-sm md:text-base">
						Hmm...
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const SongPlayer = ({ songUrl }: { songUrl: string }) => {
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

const VideoGeneratingIndicator = () => {
	return (
		<div className="mt-2 p-3 bg-muted/50 rounded-md animate-pulse">
			<div className="flex items-center space-x-2">
				<div className="w-4 h-4 rounded-full bg-primary/70" />
				<div className="text-sm">
					Creating your music video... This may take a few moments
				</div>
			</div>
		</div>
	);
};

const VideoPlayer = ({ videoData }: { videoData: { videoUrl: string, imagesUrl: string[], songUrl: string, lyrics: string } }) => {
	// Check if we have an MP4 video - look for data:video/mp4 prefix
	// Some data URLs might have base64 encoding explicitly mentioned
	const isMP4Video = videoData.videoUrl.startsWith('data:video/mp4') || 
	                  videoData.videoUrl.startsWith('data:video/mp4;base64');
	
	// If videoUrl is the same as songUrl, we're in fallback mode (video generation failed)
	const isVideoSameAsSong = videoData.videoUrl === videoData.songUrl;
	
	// Log for debugging
	console.log("VideoPlayer component:");
	console.log("- videoUrl starts with:", videoData.videoUrl.substring(0, 50));
	console.log("- isMP4Video:", isMP4Video);
	console.log("- isVideoSameAsSong:", isVideoSameAsSong);
	console.log("- Number of images:", videoData.imagesUrl?.length || 0);
	
	// Add state to track errors and handle retries
	const [hasError, setHasError] = useState(false);
	const [isRetrying, setIsRetrying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	
	// Handle video error
	const handleVideoError = () => {
		console.log("Video playback error occurred");
		if (!hasError) {
			setHasError(true);
		}
	};
	
	// Auto-retry playback
	const retryPlayback = () => {
		if (videoRef.current && hasError && !isRetrying) {
			setIsRetrying(true);
			console.log("Retrying video playback");
			
			// Reset source to trigger reload
			const currentSrc = videoRef.current.src;
			videoRef.current.src = "";
			
			// Small delay before reloading source
			setTimeout(() => {
				if (videoRef.current) {
					videoRef.current.src = currentSrc;
					videoRef.current.load();
					videoRef.current.play().catch(e => console.log("Retry play failed:", e));
					setIsRetrying(false);
					setHasError(false);
				}
			}, 100);
		}
	};
	
	// Auto-retry when error occurs
	useEffect(() => {
		if (hasError) {
			retryPlayback();
		}
	}, [hasError]);
	
	return (
		<div className="mt-2 p-2 md:p-3 bg-muted/50 rounded-md overflow-hidden w-full">
			
				<div className="mb-2 md:mb-4 overflow-hidden">
					<video 
						ref={videoRef}
						controls
						autoPlay={false}
						preload="metadata"
						className="w-full rounded-md max-w-full" 
						style={{ maxHeight: "300px", objectFit: "contain" }}
						playsInline
						onError={handleVideoError}
					>
						<source src={videoData.videoUrl} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
                    <div className="text-xs text-muted-foreground mt-1">
                        If video doesn't play, try downloading it using the button below.
                    </div>
				</div>
		
			
		
			{isMP4Video && !isVideoSameAsSong && (
				<a
					href={videoData.videoUrl}
					download={"Birthday video.mp4"}
					className="inline-flex items-center px-3 py-2 md:py-1 bg-primary text-primary-foreground rounded-md text-sm ml-2"
				>
					Download Video
				</a>
			)}
		</div>
	);
};
