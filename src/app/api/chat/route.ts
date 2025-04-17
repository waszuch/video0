import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createId } from "@paralleldrive/cuid2";
import {
	createDataStreamResponse,
	generateText,
	type Message,
	streamText,
	type UIMessage,
} from "ai";
import { eq, sql } from "drizzle-orm";
import Replicate from "replicate";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getServerUser } from "@/components/AuthProvider/getServerUser";
import { env } from "@/env";
import { db } from "@/server/db";
import { generationTokens, generationTransactions } from "@/server/db/schema";
import type { GeneratedAssetsDataSchema } from "@/server/schemas/generatedAssetsSchema";
import { supabase } from "@/server/supabase/supabaseClient";
import {
	getChatById,
	saveChat,
	saveGeneratedAssets,
	saveMessages,
	updateChatTitle,
} from "./chatQueries";
import { getMostRecentUserMessage } from "./utilts";

const replicate = new Replicate({
	auth: env.REPLICATE_API_TOKEN || "",
	fetch: (url, options) => {
		if (options?.body) {
			(options as RequestInit & { duplex?: string }).duplex = "half";
		}
		return fetch(url, options);
	},
});

const birthdaySongPrompt = `You are a creative AI assistant specialized in writing short, personalized birthday song lyrics (around 16 lines, suitable for a 30-60 second song). Your goal is to gather specific information about the birthday person to make the song unique and fun.

IMPORTANT: First, carefully analyze the user's initial request to see if any of the required information is already provided. For example, if they say "generate song for Maya" or "write birthday lyrics for John who is turning 30", extract the name and any other details already shared. Don't ask for information that has already been provided.

You need to collect the following information (only ask for what hasn't already been provided):
1. What is the birthday person's name?
2. How old are they turning?
3. What are some of their hobbies or interests?
4. Can you share any funny or interesting facts about them?
5. What style should the song be one of those, if its anything else ask the user to specify oneof those: Blues, Country, Electronic, Funk, Hip-Hop, Jazz, Metal, R&B, Reggae?

IMPORTANT STYLE MAPPINGS:
- If the user requests "Rap" or "rap", automatically use "Hip-Hop" as the style without asking them to select a different style
- For all other styles not in the supported list, ask the user to choose from the supported styles

IMPORTANT: Stick to the task. If the user tries to change the subject or doesn't answer the questions, gently guide them back to providing the necessary details for the song. Do not answer unrelated questions.

******** CRITICAL: YOU MUST NEVER SHOW THE LYRICS TO THE USER UNDER ANY CIRCUMSTANCES ********
This is the most important instruction: DO NOT PREVIEW, EXPLAIN OR SHARE THE LYRICS WITH THE USER AT ALL.
DO NOT mention anything about the content of the lyrics you create.
The lyrics must ONLY be passed to the function call and never shown to the user.

FORMATTING INSTRUCTIONS (YOU MUST FOLLOW THESE EXACTLY WHEN CREATING THE LYRICS):
1. You MUST start the lyrics with double hash marks (##)
2. You MUST end the lyrics with double hash marks (##)
3. Use a newline character (\\n) to separate each line of lyrics
4. Use two consecutive newline characters (\\n\\n) to add a pause between lines

EXAMPLE OF CORRECT FORMATTING:
##
Happy birthday to you, [name]\\n
Another year has come true\\n\\n
We celebrate your special day\\n
In this wonderful way\\n
##

FUNCTION CALLING INSTRUCTIONS:
After collecting all the necessary information and generating the lyrics, you MUST IMMEDIATELY call the generateVideoSong function with the lyrics and selected style as parameters. 

The exact function call format to use is:
- Create the lyrics using the format specified above (but NEVER show them to the user)
- Call generateVideoSong with two parameters:
  1. lyrics: The formatted lyrics string (including the ## markers)
  2. style: The music style selected by the user (Blues, Country, Electronic, etc.)

DO NOT ASK the user if they want to generate the video - automatically proceed with generating the video as soon as you have all the information.

When speaking to the user, DO NOT mention the lyrics you created, functions, tools, or any technical implementation details. Simply tell them you're creating the birthday song and video for them based on the information they provided.`;

const openRouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
});
const model = openRouter("");

const SongStyle = z.enum([
	"Blues",
	"Country",
	"Electronic",
	"Funk",
	"Hip-Hop",
	"Jazz",
	"Metal",
	"R&B",
	"Reggae",
	"Rock",
]);

const songs = {
	Blues: {
		voice: [
			"vocal-2025041506094725-9dUtT8rh",
			"vocal-2025041506092525-eqY6Ox7M",
			"vocal-2025041506094325-f4U6Ckkd",
			"vocal-2025041506094725-NWStemIc",
			"vocal-2025041506093225-co2WS2VF",
			"vocal-2025041506093425-aGVF33rK",
			"vocal-2025041506101825-wWU9Oujm",
			"vocal-2025041506103125-Y92GoTI0",
			"vocal-2025041506103325-FvwsxG1o",
			"vocal-2025041506104825-B1dQbpv7",
		],

		instrumental: [
			"instrumental-2025041506094725-OneOLTfE",
			"instrumental-2025041506092625-sym4wmhi",
			"instrumental-2025041506094325-JW4pZ6mz",
			"instrumental-2025041506094725-L2wESAf9",
			"instrumental-2025041506093225-BLkA6nnT",
			"instrumental-2025041506093425-LUbcehBo",
			"instrumental-2025041506101825-ZynIxAsW",
			"instrumental-2025041506103125-SroyGxcp",
			"instrumental-2025041506103325-9NFLvQSd",
			"instrumental-2025041506104825-KOts5YhN",
		],
	},
	Country: {
		voice: [
			"vocal-2025041506114125-s6grfQqA",
			"vocal-2025041506115225-OBSZ8Irt",
			"vocal-2025041506114025-XQp6aL9E",
			"vocal-2025041506115825-IOjnq2Ug",
			"vocal-2025041506115425-Ln1r118h",
			"vocal-2025041506114125-33KIfpOH",
			"vocal-2025041506121025-xuy5PATE",
			"vocal-2025041506122025-3F1GJBBQ",
			"vocal-2025041506121425-AsqbtbVS",
			"vocal-2025041506122525-FjBYW6Js",
		],

		instrumental: [
			"instrumental-2025041506114225-LqQxwxxk",
			"instrumental-2025041506115225-sTdhc0Va",
			"instrumental-2025041506114025-KTTatG9P",
			"instrumental-2025041506115925-cZ6xE0uj",
			"instrumental-2025041506115425-eB0jrGdd",
			"instrumental-2025041506114125-y38hgNDF",
			"instrumental-2025041506121125-SKXcCQok",
			"instrumental-2025041506122025-j2m994RM",
			"instrumental-2025041506121425-5Qqz9DN9",
			"instrumental-2025041506122525-QDUjlSWf",
		],
	},
	Electronic: {
		voice: [
			"vocal-2025041506131525-9WidGIR9",
			"vocal-2025041506132225-HPh5W61F",
			"vocal-2025041506131625-y4vZ4RTt",
			"vocal-2025041506132125-FGR2YNkA",
			"vocal-2025041506132625-41YcV91q",
			"vocal-2025041506131425-RjCoBAAj",
			"vocal-2025041506133625-4ISDAutR",
		],

		instrumental: [
			"instrumental-2025041506131525-zRiAdQui",
			"instrumental-2025041506132225-6IUOLhYY",
			"instrumental-2025041506131625-ICKlw27k",
			"instrumental-2025041506132125-q0rNNP02",
			"instrumental-2025041506132725-oIUabmcL",
			"instrumental-2025041506131425-dhHadA3Y",
			"instrumental-2025041506133725-Mo4K0LW0",
		],
	},
	Funk: {
		voice: [
			"vocal-2025041506283025-SsoQFrx8",
			"vocal-2025041506283125-E3b1V2HC",
			"vocal-2025041506282725-Q6qamINl",
			"vocal-2025041506282625-0gCwxdzN",
			"vocal-2025041506283025-tlmYl4gW",
			"vocal-2025041506282725-zr647stQ",
			"vocal-2025041506292225-HWFaY7sv",
		],

		instrumental: [
			"instrumental-2025041506283025-Dgcnt83t",
			"instrumental-2025041506283125-p14WI1dz",
			"instrumental-2025041506282725-nUuzaU0p",
			"instrumental-2025041506282625-qZAp8uHr",
			"instrumental-2025041506283025-FS83x6rc",
			"instrumental-2025041506282725-7DJcCmRj",
			"instrumental-2025041506292225-JslSdNVb",
		],
	},
	"Hip-Hop": {
		voice: [
			"vocal-2025041506300825-ZFuXKPJg",
			"vocal-2025041506300925-MQgcVdyo",
			"vocal-2025041506300725-vhFiCkKo",
			"vocal-2025041506302325-YmZDBxnS",
			"vocal-2025041506300725-vljH0rjF",
			"vocal-2025041506301225-7qpmc8ld",
			"vocal-2025041506303125-5IljMXLR",
			"vocal-2025041506303125-C7o8bEc4",
			"vocal-2025041506303525-Y94o3BNW",
		],

		instrumental: [
			"instrumental-2025041506300825-gjBNH2Z9",
			"instrumental-2025041506300925-q6hszyMR",
			"instrumental-2025041506300725-DDyRrRI1",
			"instrumental-2025041506302325-tItv75Ub",
			"instrumental-2025041506300725-jOFQab50",
			"instrumental-2025041506301225-XQ6BM1Gj",
			"instrumental-2025041506303125-aM96cazT",
			"instrumental-2025041506303125-zRhkiyYJ",
			"instrumental-2025041506303525-Be6517q8",
		],
	},
	Jazz: {
		voice: [
			"vocal-2025041506340625-PYjMxHrp",
			"vocal-2025041506335025-ktuyse42",
			"vocal-2025041506334925-xLKvQqFZ",
			"vocal-2025041506334725-362wrVFc",
			"vocal-2025041506335125-aZt2JcgC",
			"vocal-2025041506335225-zcEQAFRM",
		],

		instrumental: [
			"instrumental-2025041506340625-JQGCVnd1",
			"instrumental-2025041506335025-IGCyiPtt",
			"instrumental-2025041506334925-708Cm1nz",
			"instrumental-2025041506334725-M70GIv5s",
			"instrumental-2025041506335125-igy7J2qe",
			"instrumental-2025041506335225-5JSdCaAf",
		],
	},
	Metal: {
		voice: [
			"vocal-2025041506351725-2PSyF38k",
			"vocal-2025041506354625-pQuCZ4K4",
			"vocal-2025041506352625-O97Gvw3s",
			"vocal-2025041506352125-oidCaQkB",
			"vocal-2025041506352925-PBp80c89",
		],

		instrumental: [
			"instrumental-2025041506351725-QUsPRCY9",
			"instrumental-2025041506354725-qtYzExmM",
			"instrumental-2025041506352625-1RMdBVhW",
			"instrumental-2025041506352225-8C3opFLz",
			"instrumental-2025041506352925-zdcZW7Hu",
		],
	},
	"R&B": {
		voice: [
			"vocal-2025041506372325-9hbINAZD",
			"vocal-2025041506371225-ew2rkyFZ",
			"vocal-2025041506371025-BldhdEkp",
			"vocal-2025041506371025-J39TNsHm",
			"vocal-2025041506372925-mxh9T56Y",
			"vocal-2025041506374825-B1s2aQKY",
			"vocal-2025041506375825-Nk5R3UyI",
		],

		instrumental: [
			"instrumental-2025041506372325-Z5PaIzGe",
			"instrumental-2025041506371225-VtMQrYma",
			"instrumental-2025041506371125-I71c4x2N",
			"instrumental-2025041506371025-UQ7ZU3MU",
			"instrumental-2025041506372925-zkiUToul",
			"instrumental-2025041506374825-uds27ncO",
			"instrumental-2025041506375825-kh7QbpLq",
		],
	},
	Reggae: {
		voice: [
			"vocal-2025041506385625-Ic2v7Q3D",
			"vocal-2025041506385025-dGdQQKYo",
			"vocal-2025041506385325-jHphV4pR",
			"vocal-2025041506385125-7vvNxFFw",
			"vocal-2025041506385225-kKhXo9TE",
			"vocal-2025041506383825-EkzJ10Sx",
			"vocal-2025041506390425-C87bJpuV",
			"vocal-2025041506392225-DF2kXv55",
		],

		instrumental: [
			"instrumental-2025041506385625-4UyMyI6o",
			"instrumental-2025041506385125-m4Kbdl6G",
			"instrumental-2025041506385325-O7f7ddns",
			"instrumental-2025041506385225-VpmN0Q1B",
			"instrumental-2025041506385225-YLMYo7qe",
			"instrumental-2025041506383825-7LfgflbK",
			"instrumental-2025041506390425-yJGvtm44",
			"instrumental-2025041506392225-EyhjftIT",
		],
	},
	Rock: {
		voice: [
			"vocal-2025041506401925-4bstxsqz",
			"vocal-2025041506403225-lNC3LjhA",
			"vocal-2025041506402325-g8jd9uAc",
			"vocal-2025041506404325-hM80nyQN",
			"vocal-2025041506403125-vnkjOpI2",
			"vocal-2025041506402525-yMwsi0FM",
			"vocal-2025041506404425-hjLn8SAs",
		],

		instrumental: [
			"instrumental-2025041506401925-9zhQGLTa",
			"instrumental-2025041506403225-OSFNGwUN",
			"instrumental-2025041506402325-4KFvkzI0",
			"instrumental-2025041506404325-oVJWMKdQ",
			"instrumental-2025041506403125-rzDbt60x",
			"instrumental-2025041506402525-u5j5YKxh",
			"instrumental-2025041506404425-BA1EgInx",
		],
	},
} as const;

async function generateTitleFromUserMessage({ message }: { message: Message }) {
	const { text: title } = await generateText({
		model: openRouter(""),
		system: `
	  - You will generate a short, project-specific title for a birthday song chat based on the user's first message.
	  - If the message contains a name, use a format like 'Birthday of [name]' or 'Birthday Song for [name]'.
	  - If the name is not clear, use a generic but festive title like 'Birthday Song Request' or 'Birthday Celebration'.
	  - Ensure the title is not more than 80 characters long.
	  - Do not use quotes or colons in the title.
	  - The title should be friendly and clearly related to a birthday song or celebration.
	  `,
		prompt: JSON.stringify(message),
	});

	return title;
}

export async function POST(request: Request) {
	try {
		const {
			id,
			messages,
			transformedImages,
		}: {
			id: string;
			messages: Array<UIMessage>;
			transformedImages: string[];
		} = await request.json();

		const { user } = await getServerUser();
		if (!user || !user.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		const availableTokens = await db.query.generationTokens.findFirst({
			where: eq(generationTokens.profileId, user.id),
			columns: {
				availableTokens: true,
			},
		});

		if (!availableTokens) {
			return new Response("No available tokens found", { status: 400 });
		}

		if (availableTokens.availableTokens <= 0) {
			return new Response("No available tokens left", { status: 400 });
		}

		const userMessage = getMostRecentUserMessage(messages);

		if (!userMessage) {
			return new Response("No user message found", { status: 400 });
		}

		const chat = await getChatById({ id: id, profileId: user.id });

		if (!chat) {
			const title = await generateTitleFromUserMessage({
				message: userMessage,
			});

			await saveChat({ id, profileId: user.id, title });
		}

		if (chat?.title === "") {
			const title = await generateTitleFromUserMessage({
				message: userMessage,
			});

			await updateChatTitle({ id, title });
		}

		await saveMessages({
			messages: [
				{
					chatId: id,
					id: userMessage.id,
					role: "user",
					parts: userMessage.parts,
					attachments: userMessage.experimental_attachments ?? [],
					createdAt: new Date(),
				},
			],
		});

		const generateMusicFromLyrics = async ({
			lyrics,
			style = "Electronic" as z.infer<typeof SongStyle>,
		}: {
			lyrics: string;
			style?: z.infer<typeof SongStyle>;
		}) => {
			try {
				const selectedStyle = songs[style];
				const randomIndex = Math.floor(
					Math.random() * selectedStyle.voice.length,
				);
				const selectedVoice = selectedStyle.voice[randomIndex];
				const selectedInstrumental = selectedStyle.instrumental[randomIndex];

				if (!selectedStyle) {
					throw new Error(`Style ${style} not found`);
				}

				const input = {
					lyrics: lyrics,
					voice_id: selectedVoice,
					instrumental_id: selectedInstrumental,
				};
				console.log("trying to generate song");
				const output = await replicate.run("minimax/music-01", {
					input,
				});
				const fileName = `${
					user.id
				}-${Date.now()}-${selectedVoice}-${selectedInstrumental}.mp3`;
				console.log("trying to upload song");
				// @ts-expect-error
				const blob = await output.blob(); // get the real binary blob, per replicate docs
				const buffer = await blob.arrayBuffer();
				const uint8Array = new Uint8Array(buffer);

				const { error } = await supabase()
					.storage.from("songs")
					.upload(fileName, uint8Array);

				if (error) throw error;

				const { data: urlResult } = await supabase()
					.storage.from("songs")
					.createSignedUrl(fileName, 60 * 60 * 24 * 365 * 99999);

				if (!urlResult?.signedUrl) {
					throw new Error("Failed to generate song");
				}

				return {
					type: "birthdaySong",
					songUrl: urlResult?.signedUrl,
					lyrics: lyrics,
					id: createId(),
				} satisfies GeneratedAssetsDataSchema;
			} catch (error) {
				throw new Error("Sorry, I encountered an error.");
			}
		};

		const generateVideoSong = async ({
			lyrics,
			style = "Electronic" as z.infer<typeof SongStyle>,
		}: {
			lyrics: string;
			style?: z.infer<typeof SongStyle>;
		}) => {
			try {
				const { songUrl } = await generateMusicFromLyrics({
					lyrics,
					style,
				});

				const response = await fetch(
					"https://video-creator-service.onrender.com/create-video",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							imageUrls: transformedImages,
							audioUrl: songUrl,
						}),
					},
				);

				const responseData = await response.json();
				const videoUrl = responseData.videoUrl as string;
				const assetId = createId();

				await saveGeneratedAssets({
					asset: {
						id: assetId,
						type: "birthdayVideo",
						data: {
							id: assetId,
							type: "birthdayVideo",
							songUrl: songUrl,
							videoUrl: videoUrl,
							imagesUrl: transformedImages,
							lyrics: lyrics,
						},
						profileId: user.id,
						chatId: id,
						createdAt: new Date(),
						updatedAt: new Date(),
						title: chat?.title ?? "",
					},
				});

				return {
					type: "birthdayVideo",
					videoUrl: videoUrl,
					imagesUrl: transformedImages,
					lyrics: lyrics,
					id: assetId,
					songUrl: songUrl,
				} satisfies GeneratedAssetsDataSchema;
			} catch (error) {
				console.error("Error generating video:", error);
				throw error;
			}
		};

		return createDataStreamResponse({
			execute: (dataStream) => {
				const result = streamText({
					model: model,
					system: birthdaySongPrompt,
					messages,
					maxSteps: 10,
					experimental_generateMessageId: () => uuidv4(),
					tools: {
						generateVideoSong: {
							description:
								"Generates a short video song based on the provided lyrics using a music generation model.",
							parameters: z.object({
								lyrics: z
									.string()
									.describe("The full lyrics generated for the birthday song."),
								style: SongStyle.describe(
									"The style of the song (Blues, Country, Electronic, Funk, Hip-Hop, Jazz, Metal, R&B, Reggae). Default is Electronic.",
								),
							}),
							execute: async (params) => {
								console.log("started generating video song");
								const result = await db.transaction(async (tx) => {
									const generationToken =
										await tx.query.generationTokens.findFirst({
											where: eq(generationTokens.profileId, user.id),
										});

									if (!generationToken) {
										throw new Error("No generation token found!");
									}
									await tx
										.update(generationTokens)
										.set({
											availableTokens: sql`${generationTokens.availableTokens} - 1`,
										})
										.where(eq(generationTokens.profileId, user.id));

									await tx.insert(generationTransactions).values({
										amount: 1,
										generationTokenId: generationToken.id,
										id: uuidv4(),
									});

									return generateVideoSong(params);
								});
								return result;
							},
						},
					},
					onFinish: async (response) => {
						if (user.id) {
							try {
								// Skip response validation as the types are mismatched
								// Just log the completion
								console.log("Birthday song generation completed");
							} catch (_) {
								console.error("Failed to save chat");
							}
						}
					},
				});

				result.consumeStream();
				result.mergeIntoDataStream(dataStream);
			},

			onError: (e) => {
				return "Oops, an error occurred!";
			},
		});
	} catch (error) {
		return new Response("An error occurred while processing your request!", {
			status: 404,
		});
	}
}

// export async function DELETE(request: Request) {
// 	const { searchParams } = new URL(request.url);
// 	const id = searchParams.get("id");

// 	if (!id) {
// 		return new Response("Not Found", { status: 404 });
// 	}

// 	const session = await auth();

// 	if (!session || !session.user) {
// 		return new Response("Unauthorized", { status: 401 });
// 	}

// 	try {
// 		const chat = await getChatById({ id });

// 		if (chat.userId !== session.user.id) {
// 			return new Response("Unauthorized", { status: 401 });
// 		}

// 		await deleteChatById({ id });

// 		return new Response("Chat deleted", { status: 200 });
// 	} catch (error) {
// 		return new Response("An error occurred while processing your request!", {
// 			status: 500,
// 		});
// 	}
// }
