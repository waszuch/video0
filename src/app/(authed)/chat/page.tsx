import PrivatePage from "@/components/AuthProvider/PrivatePage";
import { Chat } from "@/components/Chat";

export default async function Page() {
	const chatId = crypto.randomUUID();

	return (
		<>
			<PrivatePage>
				<Chat id={chatId} initialMessages={[]} />
			</PrivatePage>
		</>
	);
}
