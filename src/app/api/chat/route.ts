import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createId } from "@paralleldrive/cuid2";
import {
	appendResponseMessages,
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
import { getMostRecentUserMessage, getTrailingMessageId } from "./utilts";

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

CRITICAL: FIRST PARSE THE USER'S INITIAL MESSAGE VERY CAREFULLY. Users often include multiple pieces of information in their first message. Extract ALL available information before asking ANY questions.

For example, if a user says "generate a song for Sam who is 30, likes hiking and cooking, funny fact is he sleeps with socks on. jazz style", you should extract:
- Name: Sam
- Age: 30
- Hobbies: hiking and cooking
- Fun fact: sleeps with socks on
- Style: Jazz
And proceed directly to generating the song without asking ANY questions since all information is provided.

Required information:
1. Name: The birthday person's name
2. Age: How old they're turning
3. Hobbies/Interests: Their hobbies or interests
4. Fun Fact: A funny or interesting fact about them
5. Style: One of these music styles: Blues, Country, Electronic, Funk, Hip-Hop, Jazz, Metal, R&B, Reggae, Rock

IMPORTANT STYLE MAPPINGS:
- If the user requests "Rap" or "rap", automatically use "Hip-Hop" as the style
- For all other styles not in the supported list, ask the user to choose from the supported styles

IMPORTANT: 
- ONLY ask for information that's missing after careful extraction from the user's message
- Do NOT ask for information that has already been provided
- If a user says "generate blues for John who is 40", extract name (John), age (40), and style (Blues)
- Stick to the task and guide users back to providing necessary details if they get off track

******** CRITICAL: YOU MUST NEVER SHOW THE LYRICS TO THE USER UNDER ANY CIRCUMSTANCES ********
DO NOT PREVIEW, EXPLAIN OR SHARE THE LYRICS WITH THE USER AT ALL.
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

FUNCTION CALLING RULES (EXTREMELY IMPORTANT):
1. As soon as you have ALL the required information (name, age, hobbies/interests, a fun fact, and style), you MUST GENERATE THE LYRICS AND IMMEDIATELY CALL the generateVideoSong function WITHOUT ANY ADDITIONAL MESSAGES OR CONFIRMATIONS.
2. DO NOT wait for user confirmation after collecting all the information.
3. DO NOT ask "Would you like me to generate the video now?" or any similar confirmation questions.
4. DO NOT tell the user you're about to call the function or that you're generating lyrics.
5. NEVER show the lyrics to the user - they should ONLY be sent through the function call.
6. After collecting all 5 pieces of information, your VERY NEXT RESPONSE must be the function call.

When you've gathered all the required information, silently create the lyrics and IMMEDIATELY execute the generateVideoSong function with the parameters:
1. lyrics: The formatted lyrics string (including the ## markers)
2. style: The music style selected by the user (Blues, Country, Electronic, etc.)

Your final message to the user should ONLY confirm that you're creating the birthday song and video based on their information. DO NOT mention anything about function calls, the lyrics content, or implementation details.`;

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
			numberOfSongs = 4,
		}: {
			lyrics: string;
			style?: z.infer<typeof SongStyle>;
			numberOfSongs?: number;
		}) => {
			try {
				const selectedStyle = songs[style];

				if (!selectedStyle) {
					throw new Error(`Style ${style} not found`);
				}

				// Generate unique random indices
				const maxIndex = selectedStyle.voice.length;
				const indices: number[] = [];

				// Get unique random indices up to the requested number or max available
				const songsToGenerate = Math.min(numberOfSongs, maxIndex);

				while (indices.length < songsToGenerate) {
					const randomIndex = Math.floor(Math.random() * maxIndex);
					if (!indices.includes(randomIndex)) {
						indices.push(randomIndex);
					}
				}

				// Generate songs based on the indices
				const generatedSongs = await Promise.all(
					indices.map(async (index) => {
						const selectedVoice = selectedStyle.voice[index];
						const selectedInstrumental = selectedStyle.instrumental[index];

						const input = {
							lyrics: lyrics,
							voice_id: selectedVoice,
							instrumental_id: selectedInstrumental,
						};

						const output = await replicate.run("minimax/music-01", {
							input,
						});

						const fileName = `${
							user.id
						}-${Date.now()}-${selectedVoice}-${selectedInstrumental}.mp3`;

						// @ts-expect-error replicate doesnt have types for the output, but its correct per their docs
						const blob = await output.blob();
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

						return urlResult.signedUrl;
					}),
				);

				return generatedSongs.map((song) => ({
					type: "birthdaySong",
					songUrl: song,
					lyrics: lyrics,
					id: createId(),
					additionalSongs: generatedSongs.slice(1),
				}));
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
				const generatedSongs = await generateMusicFromLyrics({
					lyrics,
					style,
				});

				// Process songs and videos in parallel
				const videoPromises = generatedSongs.map((song) =>
					fetch("https://video-creator-service.onrender.com/create-video", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							imageUrls: transformedImages,
							audioUrl: song.songUrl,
						}),
					})
						.then(
							(response) => response.json() as Promise<{ videoUrl: string }>,
						)
						.then((data) => ({
							videoUrl: data.videoUrl,
							songUrl: song.songUrl,
						})),
				);

				const videoResponses = await Promise.all(videoPromises);
				const videoAssets = videoResponses.map((videoResponse) => {
					const assetId = createId();
					return {
						id: assetId,
						type: "birthdayVideo",
						data: {
							id: assetId,
							type: "birthdayVideo",
							songUrl: videoResponse.songUrl,
							videoUrl: videoResponse.videoUrl,
							imagesUrl: transformedImages,
							lyrics: lyrics,
						},
						profileId: user.id,
						chatId: id,
						createdAt: new Date(),
						updatedAt: new Date(),
						title: chat?.title ?? "",
					} as const;
				});

				await saveGeneratedAssets({
					assets: videoAssets,
				});

				return videoAssets.map((videoAsset) => ({
					type: "birthdayVideo",
					videoUrl: videoAsset.data.videoUrl,
					imagesUrl: transformedImages,
					lyrics: lyrics,
					id: videoAsset.id,
					songUrl: videoAsset.data.songUrl,
				})) satisfies GeneratedAssetsDataSchema[];
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
								await db.transaction(async (tx) => {
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
								});
								console.log("Generating video song");
								return generateVideoSong(params);
							},
						},
					},
					onFinish: async ({ response }) => {
						if (user.id) {
							try {
								const assistantId = getTrailingMessageId({
									messages: response.messages.filter(
										(message) => message.role === "assistant",
									),
								});

								if (!assistantId) {
									throw new Error("No assistant message found!");
								}

								const [, assistantMessage] = appendResponseMessages({
									messages: [userMessage],
									responseMessages: response.messages,
								});

								await saveMessages({
									messages: [
										{
											id: assistantId,
											chatId: id,
											role: assistantMessage?.role ?? "",
											parts: assistantMessage?.parts,
											attachments:
												assistantMessage?.experimental_attachments ?? [],
											createdAt: new Date(),
										},
									],
								});
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
