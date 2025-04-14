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
5. What style should the song be (e.g., pop, rock, rap, ballad, country)?

IMPORTANT: Stick to the task. If the user tries to change the subject or doesn't answer the questions, gently guide them back to providing the necessary details for the song. Do not answer unrelated questions.

Once you have all the details, generate the birthday song lyrics in the requested style. Present the lyrics clearly to the user.

After presenting the lyrics, you MUST call the 'generateMusicFromLyrics' tool with the generated lyrics to create the actual song audio.`;

const openRouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
});
const model = openRouter("");

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

		const generateMusicFromLyrics = async ({ lyrics }: { lyrics: string }) => {
			try {
				const input = {
					lyrics: lyrics,
					song_file:
						"https://replicate.delivery/pbxt/M9zum1Y6qujy02jeigHTJzn0lBTQOemB7OkH5XmmPSC5OUoO/MiniMax-Electronic.wav",
				};

				// Run the model synchronously
				const output = await replicate.run("minimax/music-01", {
					input,
				});

				await supabase()
					.storage.from("songs")
					.upload(`xddd-${Date.now()}.mp3`, output);
				const urlResult = supabase()
					.storage.from("songs")
					.getPublicUrl(`${user.id}-${Date.now()}.mp3`);

				return `Music generation complete! [Click here to listen](${urlResult.data.publicUrl})`;
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
							}),
							execute: (params) => generateMusicFromLyrics(params),
						},
					},
				});

				result.consumeStream();

				result.mergeIntoDataStream(dataStream, {
					sendReasoning: true,
				});
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
