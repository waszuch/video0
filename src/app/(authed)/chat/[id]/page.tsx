import type { UIMessage } from "ai";
import type { Attachment } from "ai";
import { notFound } from "next/navigation";
import PrivatePage from "@/components/AuthProvider/PrivatePage";
import { Chat } from "@/components/Chat";
import type { DBMessage } from "@/server/db/schema";
import { createApi } from "@/trpc/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;

	const api = await createApi();

	const foundChat = await api.chats.getChatMessagesByChatId({
		chatId: id,
	});

	if (!foundChat) {
		notFound();
	}

	console.log(foundChat);

	return (
		<PrivatePage>
			<div className="w-full min-h-screen bg-black">
				<div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-pink-600/10 pointer-events-none" />
				<Chat
					id={id}
					initialMessages={convertToUIMessages(foundChat.messages)}
					initialTransformedImages={foundChat.transformedImages}
					initialGeneratedAssets={foundChat.generatedAssets}
				/>
			</div>
		</PrivatePage>
	);
}

function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
	return messages.map((message) => ({
		id: message.id,
		parts: message.parts as UIMessage["parts"],
		role: message.role as UIMessage["role"],
		// Note: content will soon be deprecated in @ai-sdk/react
		content: "",
		createdAt: message.createdAt,
		experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
	}));
}
