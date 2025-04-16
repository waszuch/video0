import { Chat } from "@/components/Chat";

export default async function Page() {
	const chatId = crypto.randomUUID();

	return (
		<>
			<Chat id={chatId} initialMessages={[]} />
		</>
	);
}
