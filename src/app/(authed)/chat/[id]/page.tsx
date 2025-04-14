import { Chat } from "@/components/Chat";

export default async function Page(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;
	// const chat = await getChatById({ id });

	// if (!chat) {
	// 	notFound();
	// }

	// const messagesFromDb = await getMessagesByChatId({
	// 	id,
	// });

	// function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
	// 	return messages.map((message) => ({
	// 		id: message.id,
	// 		parts: message.parts as UIMessage["parts"],
	// 		role: message.role as UIMessage["role"],
	// 		// Note: content will soon be deprecated in @ai-sdk/react
	// 		content: "",
	// 		createdAt: message.createdAt,
	// 		experimental_attachments:
	// 			(message.attachments as Array<Attachment>) ?? [],
	// 	}));
	// }

	// const cookieStore = await cookies();
	// const chatModelFromCookie = cookieStore.get("chat-model");

	// if (!chatModelFromCookie) {
	// 	return (
	// 		<>
	// 			<Chat
	// 				id={chat.id}
	// 				initialMessages={convertToUIMessages(messagesFromDb)}
	// 				selectedChatModel={DEFAULT_CHAT_MODEL}
	// 				selectedVisibilityType={chat.visibility}
	// 				isReadonly={session?.user?.id !== chat.userId}
	// 			/>
	// 			<DataStreamHandler id={id} />
	// 		</>
	// 	);
	// }

	return (
		<>
			<Chat id={id} initialMessages={[]} />
		</>
	);
}
