import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createDataStreamResponse, streamText, type UIMessage } from "ai";
import Replicate from "replicate";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getServerUser } from "@/components/AuthProvider/getServerUser";
import { env } from "@/env";
import { supabase } from "@/server/supabase/supabaseClient";
import { getMostRecentUserMessage } from "./utilts";

// Configure for Vercel serverless
export const runtime = "edge";
export const maxDuration = 300; // 5 minutes

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

First, ask the user the following questions one by one, or in small groups, until you have all the information:
1. What is the birthday person's name?
2. How old are they turning?
3. What are some of their hobbies or interests?
4. Can you share any funny or interesting facts about them?
5. What style should the song be one of those, if its anything else ask the user to specify oneof those: Blues, Country, Electronic, Funk, Hip-Hop, Jazz, Metal, R&B, Reggae?

IMPORTANT: Stick to the task. If the user tries to change the subject or doesn't answer the questions, gently guide them back to providing the necessary details for the song. Do not answer unrelated questions.

Once you have all the details, generate the birthday song lyrics in the requested style. Present the lyrics clearly to the user.

After presenting the lyrics, you MUST call the 'generateMusicFromLyrics' tool with the generated lyrics to create the actual song audio.`;

const openRouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
});
const model = openRouter("");

// Define the song styles enum based on the songs map
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

// Type for our songs map
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
			"vocal-2025041506370525-T00IdPms",
			"vocal-2025041506374825-B1s2aQKY",
			"vocal-2025041506375825-Nk5R3UyI",
		],

		instrumental: [
			"instrumental-2025041506372325-Z5PaIzGe",
			"instrumental-2025041506371225-VtMQrYma",
			"instrumental-2025041506371125-I71c4x2N",
			"instrumental-2025041506371025-UQ7ZU3MU",
			"instrumental-2025041506372925-zkiUToul",
			"instrumental-2025041506370625-CHagzsVY",
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

export async function POST(request: Request) {
	try {
		const {
			id,
			messages,
		}: {
			id: string;
			messages: Array<UIMessage>;
		} = await request.json();

		const { user } = await getServerUser();
		if (!user || !user.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		const userMessage = getMostRecentUserMessage(messages);

		if (!userMessage) {
			return new Response("No user message found", { status: 400 });
		}

		const generateMusicFromLyrics = async ({
			lyrics,
			style = "Electronic" as z.infer<typeof SongStyle>,
			provider = "miniMax",
		}: {
			lyrics: string;
			style?: z.infer<typeof SongStyle>;
			provider?: string;
		}) => {
			try {
				// Get the selected style from the songs map
				const selectedStyle = songs[style];
				const randomIndex = Math.floor(
					Math.random() * selectedStyle.voice.length,
				);
				const selectedVoice = selectedStyle.voice[randomIndex];
				const selectedInstrumental = selectedStyle.instrumental[randomIndex];
				if (!selectedStyle) {
					throw new Error(`Style ${style} for provider ${provider} not found`);
				}

				const input = {
					lyrics: lyrics,
					voice_id: selectedVoice,
					instrumental_id: selectedInstrumental,
				};

				const output = await replicate.run("minimax/music-01", {
					input,
				});
				const fileName = `${user.id}-${Date.now()}-${selectedVoice}-${selectedInstrumental}.mp3`;

				await supabase().storage.from("songs").upload(fileName, output);
				const { data: urlResult } = await supabase()
					.storage.from("songs")
					.createSignedUrl(fileName, 60 * 60 * 24 * 365 * 99999);

				return {
					type: "song",
					songUrl: urlResult?.signedUrl,
				};
			} catch (error) {
				console.error("Error:", error);
				return "Sorry, I encountered an error.";
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
						generateMusicFromLyrics: {
							description:
								"Generates a short audio song based on the provided lyrics using a music generation model.",
							parameters: z.object({
								lyrics: z
									.string()
									.describe("The full lyrics generated for the birthday song."),
								style: SongStyle.describe(
									"The style of the song (Blues, Country, Electronic, Funk, Hip-Hop, Jazz, Metal, R&B, Reggae). Default is Electronic.",
								),
							}),
							execute: (params) => generateMusicFromLyrics(params),
						},
					},
				});

				result.consumeStream();

				result.mergeIntoDataStream(dataStream);
			},
			onError: () => {
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
