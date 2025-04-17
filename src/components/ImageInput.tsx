/** biome-ignore-all lint/nursery/noImgElement: <explanation> */
import { motion } from "framer-motion";
import { Cake, Clock, Coins, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { supabase } from "@/server/supabase/supabaseClient";
import { api } from "@/trpc/react";
import { useUser } from "./AuthProvider/AuthProvider";

interface ImageInputProps {
	chatId: string;
	onImagesUploaded?: (imageUrls: string[]) => void;
	className?: string;
}

export function ImageInput({
	chatId,
	onImagesUploaded,
	className,
}: ImageInputProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [cartoonizedUrls, setCartoonizedUrls] = useState<string[]>([]);
	const { user } = useUser();
	const MAX_IMAGES = 2;
	const TOKEN_COST = 1;

	const { mutate: generateImages } = api.imageGen.generateImages.useMutation({
		onSuccess: (data) => {
			if (data.success && data.results && data.results.length > 0) {
				const transformedUrls = data.results
					.map((result) => {
						// Handle both string and object with signedUrl property
						const transformedUrl = result?.transformedImageUrl;
						if (!transformedUrl) return null;

						return typeof transformedUrl === "object" &&
							"signedUrl" in transformedUrl
							? transformedUrl.signedUrl
							: transformedUrl;
					})
					.filter(Boolean) as string[];

				if (transformedUrls.length > 0) {
					setCartoonizedUrls(transformedUrls);
					onImagesUploaded?.(transformedUrls);
					toast.success("Images processed successfully");
				}
			} else {
				toast.error(
					`Failed to process images: ${data.error || "Unknown error"}`,
				);
			}
			setIsGenerating(false);
		},
		onError: (error) => {
			console.error("Error processing images:", error);
			toast.error("Failed to process images");
			setIsGenerating(false);
		},
	});

	const handleFileSelect = useCallback(
		async (files: File[]) => {
			// Filter out non-image files
			const imageFiles = files.filter((file) => file.type.startsWith("image/"));

			if (imageFiles.length === 0) {
				toast.error("Please select image files");
				return;
			}

			// Determine how many files we can process (respecting the MAX_IMAGES limit)
			const availableSlots = MAX_IMAGES - previewUrls.length;
			const filesToProcess = imageFiles.slice(0, availableSlots);

			if (filesToProcess.length === 0) {
				toast.error(`You can only upload up to ${MAX_IMAGES} images`);
				return;
			}

			setIsUploading(true);
			const newUrls: string[] = [];

			try {
				// Process each file in sequence
				for (const file of filesToProcess) {
					try {
						// Convert the file to base64
						const base64Image = await readFileAsBase64(file);
						const altText = file.name || "Uploaded image";

						if (!user) {
							throw new Error("User not found");
						}

						// Upload the image
						const imageUrl = await uploadChatImage(
							base64Image,
							chatId,
							altText,
							user.id,
						);

						newUrls.push(imageUrl);
					} catch (error) {
						console.error("Error uploading image:", error);
						toast.error(`Failed to upload image: ${file.name}`);
					}
				}

				if (newUrls.length > 0) {
					// Add all new URLs to previews list
					const updatedUrls = [...previewUrls, ...newUrls];
					setPreviewUrls(updatedUrls);

					toast.success(
						`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded successfully`,
					);

					// Start generating if we've reached the MAX_IMAGES
					if (updatedUrls.length >= MAX_IMAGES) {
						setIsGenerating(true);
						generateImages({
							chatId,
							originalImageUrls: updatedUrls,
						});
						toast.success("Generating your birthday video...");
					}
				}
			} catch (error) {
				console.error("Error processing images:", error);
				toast.error("Failed to process images");
			} finally {
				setIsUploading(false);
			}
		},
		[chatId, generateImages, previewUrls, user],
	);

	// Helper function to read file as base64
	const readFileAsBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result);
				} else {
					reject(new Error("Failed to convert file to base64"));
				}
			};
			reader.onerror = reject;
		});
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: useCallback(
			(acceptedFiles: File[]) => {
				// Process multiple files up to MAX_IMAGES limit
				const filesToProcess = acceptedFiles.slice(
					0,
					MAX_IMAGES - previewUrls.length,
				);

				if (filesToProcess.length === 0) return;

				// Process all files at once using the updated handleFileSelect
				handleFileSelect(filesToProcess);
			},
			[handleFileSelect, previewUrls.length],
		),
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
		},
		maxSize: 10485760, // 10MB
		multiple: true, // Allow multiple file selection
		disabled: previewUrls.length >= MAX_IMAGES || isUploading || isGenerating,
	});

	const removeImage = (index: number) => {
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
		if (cartoonizedUrls.length > 0) {
			setCartoonizedUrls([]);
		}
	};

	return (
		<div className={`w-full max-w-4xl mx-auto px-6 py-8 ${className}`}>
			<div className="mb-8 text-center">
				<h2 className="text-2xl font-bold text-white mb-2">
					Create a Birthday Video
				</h2>
				<p className="text-gray-400">
					Upload up to 2 images of the birthday person to generate a beautiful
					video!
				</p>

				<div className="flex items-center justify-center gap-3 mt-2">
					<div className="flex items-center text-amber-400 text-sm">
						<Coins className="w-4 h-4 mr-1" />
						<span>Costs {TOKEN_COST} token</span>
					</div>
					<div className="flex items-center text-gray-400 text-sm">
						<Clock className="w-4 h-4 mr-1" />
						<span>Processing time: ~1 minute</span>
					</div>
				</div>
			</div>

			{cartoonizedUrls.length > 0 ? (
				<div className="space-y-4">
					{cartoonizedUrls.map((url, index) => (
						<div
							key={index}
							className="relative rounded-lg overflow-hidden group"
						>
							<img
								src={url}
								alt={`Generated birthday video preview ${index + 1}`}
								className="w-full h-auto object-cover rounded-lg max-h-[300px]"
							/>
							{index === 0 && (
								<button
									onClick={() => {
										setPreviewUrls([]);
										setCartoonizedUrls([]);
									}}
									className="absolute top-2 right-2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									aria-label="Remove image"
									type="button"
								>
									<X className="w-5 h-5 text-white" />
								</button>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="bg-[#13111a] border border-gray-800 rounded-lg p-8">
					{isGenerating ? (
						<div className="text-center py-8">
							<div className="bg-[#1a1724] border border-indigo-900/30 rounded-lg p-8 mb-6">
								<Loader2 className="w-14 h-14 text-purple-500 animate-spin mx-auto mb-5" />
								<h3 className="text-xl font-bold text-white mb-3">
									Transforming Your Images
								</h3>
								<p className="text-purple-300 text-lg mb-2">
									Please wait while we create your birthday video
								</p>
								<p className="text-purple-200/70 mb-4">
									This process can take up to 1 minute
								</p>

								<div className="bg-[#221d32] rounded-lg p-4 max-w-md mx-auto">
									<div className="flex items-center">
										<div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2" />
										<p className="text-sm text-gray-300">
											Please don't close this window
										</p>
									</div>
									<div className="mt-3 flex items-start">
										<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2 mt-1" />
										<p className="text-sm text-gray-400">
											We're applying special effects to make your birthday video
											look amazing
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-4 opacity-60">
								{previewUrls.map((url, index) => (
									<div
										key={index}
										className="relative rounded-lg overflow-hidden"
									>
										<img
											src={url}
											alt={`Birthday person portrait ${index + 1}`}
											className="w-full h-auto object-cover rounded-lg max-h-[200px]"
										/>
										<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
											<p className="text-white text-xs font-medium">
												Processing...
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<>
							{previewUrls.length > 0 && (
								<div className="grid grid-cols-2 gap-4 mb-6">
									{previewUrls.map((url, index) => (
										<div
											key={index}
											className="relative rounded-lg overflow-hidden group"
										>
											<img
												src={url}
												alt={`Birthday person portrait ${index + 1}`}
												className="w-full h-auto object-cover rounded-lg max-h-[200px]"
											/>
											<button
												onClick={() => removeImage(index)}
												className="absolute top-2 right-2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
												aria-label="Remove image"
												type="button"
												disabled={isGenerating}
											>
												<X className="w-5 h-5 text-white" />
											</button>
										</div>
									))}
								</div>
							)}

							{previewUrls.length < MAX_IMAGES && !isGenerating && (
								<div
									{...getRootProps()}
									className={`border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[250px] ${
										isDragActive
											? "border-purple-500 bg-purple-900/10"
											: "border-gray-700 hover:border-gray-600"
									} ${isUploading ? "opacity-60" : ""}`}
								>
									<input {...getInputProps()} />

									<motion.div
										animate={{ scale: isDragActive ? 1.02 : 1 }}
										transition={{ duration: 0.2 }}
										className="flex flex-col items-center justify-center w-full h-full"
									>
										{isUploading ? (
											<Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
										) : (
											<>
												<div className="bg-pink-900/30 p-4 rounded-full mb-5">
													<Cake className="w-8 h-8 text-pink-400" />
												</div>
												<p className="text-lg font-medium mb-3 text-white">
													{previewUrls.length === 0
														? "Upload birthday person photos"
														: "Add one more photo"}
												</p>
												<p className="text-gray-400 mb-2">
													We'll transform them into a beautiful birthday video!
												</p>
												<p className="text-sm text-gray-500 mb-1">
													<span className="text-purple-400">
														Click to select
													</span>{" "}
													or drag and drop up to {MAX_IMAGES} photos
												</p>
												<p className="text-xs text-gray-600 mb-3">
													PNG, JPG, GIF (max 10MB)
												</p>
												<p className="text-xs font-medium text-pink-400 mt-2">
													{previewUrls.length === 0
														? `Upload ${MAX_IMAGES} photos of the birthday person`
														: `${MAX_IMAGES - previewUrls.length} more photo needed`}
												</p>
											</>
										)}
									</motion.div>
								</div>
							)}

							{previewUrls.length === MAX_IMAGES && (
								<div className="mt-4 bg-[#1a1724] border border-indigo-900/30 rounded-lg p-4 flex items-center">
									<Coins className="w-5 h-5 text-amber-400 mr-3" />
									<div>
										<p className="text-white text-sm font-medium">
											Ready to generate your birthday video
										</p>
										<p className="text-gray-400 text-xs">
											This will use {TOKEN_COST} token and take about a minute
											to process
										</p>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * Uploads a base64 encoded image to Supabase storage and links it to a menu
 * @param base64Image Base64 encoded image data (with data URI prefix)
 * @param altText Alternative text for the image
 * @returns The public URL of the uploaded image
 */
export const uploadChatImage = async (
	base64Image: string,
	chatId: string,
	altText: string,
	userId: string,
): Promise<string> => {
	try {
		const IMAGE_BUCKET = "images";

		// Parse the base64 image
		const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

		if (!matches || matches.length !== 3) {
			throw new Error("Invalid base64 image format");
		}

		const contentType = matches[1];
		const base64Data = matches[2];
		if (!base64Data) {
			throw new Error("Invalid base64 image format");
		}
		const binaryData = Buffer.from(base64Data, "base64");

		// Generate a unique filename
		const timestamp = Date.now();
		const extension = contentType?.split("/")[1];
		const fileName = `${userId}/${chatId}/${timestamp}-${Math.random()
			.toString(36)
			.substring(2, 10)}.${extension}`;

		// Upload the image
		const { error } = await supabase()
			.storage.from(IMAGE_BUCKET)
			.upload(fileName, binaryData, {
				contentType,
				upsert: false,
				cacheControl: "3600",
				metadata: {
					chatId,
					altText,
					uploadedAt: new Date().toISOString(),
				},
			});

		if (error) throw error;

		// Get the public URL
		const { data, error: signedUrlError } = await supabase()
			.storage.from(IMAGE_BUCKET)
			.createSignedUrl(fileName, 9999999999);
		if (signedUrlError) throw signedUrlError;
		return data.signedUrl;
	} catch (error) {
		console.error("Error uploading menu image to Supabase:", error);
		throw error;
	}
};
