"use client";

import { useChat } from "@ai-sdk/react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import type { UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { CopyIcon, DownloadIcon, SendHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MouseEventGlow } from "@/components/MouseEventGlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type RouterOutputs } from "@/trpc/react";
import { useUser } from "./AuthProvider/AuthProvider";
import { ChatMessages } from "./ChatMessages";
import { ImageInput } from "./ImageInput";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export const Chat = ({
	id,
	initialMessages,
	initialTransformedImages = [],
	initialGeneratedAssets = [],
}: {
	id: string;
	initialMessages: Array<UIMessage>;
	initialTransformedImages: string[];
	initialGeneratedAssets?: RouterOutputs["chats"]["getChatGeneratedAssetsByChatId"];
}) => {
	const [transformedImages, setTransformedImages] = useState<string[]>(
		initialTransformedImages,
	);

	const { data: generatedAssets } =
		api.chats.getChatGeneratedAssetsByChatId.useQuery(
			{ chatId: id },
			{ enabled: !!id, initialData: initialGeneratedAssets },
		);
	const hasGeneratedAssets =
		typeof generatedAssets !== "undefined" && generatedAssets.length > 0;

	if (hasGeneratedAssets) {
		return <GeneratedAssets generatedAssets={generatedAssets} />;
	}

	if (transformedImages.length > 0) {
		return (
			<ChatContent
				id={id}
				initialMessages={initialMessages}
				transformedImages={transformedImages}
			/>
		);
	}

	return <ImageInput chatId={id} onImagesUploaded={setTransformedImages} />;
};

export function ChatContent({
	id,
	initialMessages,
	transformedImages,
}: {
	id: string;
	initialMessages: Array<UIMessage>;
	transformedImages: string[];
}) {
	const { user } = useUser();
	const { data: availableTokens } = api.tokens.get.useQuery(undefined, {
		enabled: !!user,
	});

	const { mutateAsync: checkout } = api.tokens.checkout.useMutation();

	const trpcUtils = api.useUtils();
	const { messages, handleSubmit, input, setInput, isLoading, status } =
		useChat({
			id,
			body: { id, transformedImages },
			initialMessages,
			experimental_throttle: 100,
			sendExtraMessageFields: true,
			generateId: () => crypto.randomUUID(),
			onFinish: () => {
				trpcUtils.chats.getChatGeneratedAssetsByChatId.invalidate({
					chatId: id,
				});
				trpcUtils.chats.getChatMessagesByChatId.invalidate({
					chatId: id,
				});
				trpcUtils.chats.getChats.invalidate();
				trpcUtils.tokens.get.invalidate();
			},
			onError: () => {
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
			<div className="flex flex-col min-w-0 h-dvh bg-black text-white font-archivo relative overflow-x-hidden">
				<MouseEventGlow />
				<div className="relative z-10 flex-1 overflow-hidden">
					<ChatMessages status={status} messages={messages} />
				</div>
				<form
					className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t border-purple-700/30 bg-black p-3 md:p-4 z-10"
					onSubmit={(e) => {
						e.preventDefault();
						if (status !== "ready") {
							toast.error("Please wait for the model to finish its response!");
						} else {
							submitInput();
						}
					}}
				>
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
		</AnimatePresence>
	);
}

export function GeneratedAssets({
	generatedAssets,
}: {
	generatedAssets: RouterOutputs["chats"]["getChatGeneratedAssetsByChatId"];
}) {
	return (
		<div className="relative z-10 flex-1 overflow-hidden h-screen">
			<AnimatePresence>
				<ScrollArea className="h-full">
					<div className="flex flex-col gap-4 p-4">
						<div className="flex flex-col gap-1 items-center mt-10">
							<motion.h1
								className="text-3xl font-bold text-white"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.5,
									ease: "easeOut",
								}}
							>
								🎉 Woohoo! Your Birthday Video is Ready! 🎂
							</motion.h1>
							<motion.span
								className="text-gray-400 text-center max-w-xl"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.5,
									ease: "easeOut",
									delay: 0.5,
								}}
							>
								Hi! We generated awesome videos for your friend and family with
								different songs! Choose the one you like best and share it with
								friends either by downloading or sending a link (recommended) ✨
							</motion.span>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.5,
								ease: "easeOut",
								delay: 1,
							}}
							className="flex gap-4 z-50 w-full flex-wrap justify-center p-4"
						>
							{generatedAssets.map((asset) => (
								<Card
									key={asset.id}
									className="max-w-[500px] w-full bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-700/10 hover:to-pink-700/10 border-purple-700/30"
								>
									<CardContent>
										{asset.type === "birthdaySong" && (
											<audio
												src={asset.data.songUrl}
												className="w-full max-w-[500px]"
											>
												<track kind="captions" />
											</audio>
										)}
										{asset.type === "birthdayVideo" &&
											"videoUrl" in asset.data && (
												<div className="flex justify-center flex-col gap-2">
													<video
														src={asset.data.videoUrl}
														controls
														className="max-w-[500px] w-full rounded-lg"
													>
														<track kind="captions" />
														Your browser does not support the video element.
													</video>
													<div className="flex gap-2 justify-end">
														<Button
															className="text-sm text-gray-400 cursor-pointer"
															onClick={() => {
																const url = new URL(
																	`/happy-birthday/${asset.id}`,
																	window.location.origin,
																);
																navigator.clipboard.writeText(url.toString());
																toast.success("Link copied to clipboard! 🔗");
															}}
														>
															<CopyIcon className="w-4 h-4" />
															Copy link
														</Button>
														<Button
															className="text-sm text-gray-400 cursor-pointer"
															onClick={() => {
																if ("videoUrl" in asset.data) {
																	const videoUrl = asset.data.videoUrl;
																	const downloadVideo = async () => {
																		try {
																			const response = await fetch(videoUrl);
																			const blob = await response.blob();
																			const url =
																				window.URL.createObjectURL(blob);
																			const a = document.createElement("a");
																			a.href = url;
																			a.download = `birthday-video-${asset.id}.mp4`;
																			document.body.appendChild(a);
																			a.click();
																			window.URL.revokeObjectURL(url);
																			document.body.removeChild(a);
																		} catch (error) {
																			toast.error(
																				"Failed to download video 😞",
																			);
																		}
																	};
																	downloadVideo();
																}
															}}
														>
															<DownloadIcon className="w-4 h-4" />
															Download video
														</Button>
													</div>
												</div>
											)}
									</CardContent>
								</Card>
							))}
						</motion.div>

						<motion.div
							className="text-center text-gray-300 text-lg mt-6 mb-10"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.5,
								ease: "easeOut",
								delay: 1.5,
							}}
						>
							<p>Have fun! 🎁 Make someone&apos;s day special! 💖</p>
						</motion.div>
					</div>
				</ScrollArea>
			</AnimatePresence>
		</div>
	);
}
