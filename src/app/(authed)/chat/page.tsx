import { v4 as uuidv4 } from "uuid";
import PrivatePage from "@/components/AuthProvider/PrivatePage";
import { Chat } from "@/components/Chat";

export default async function Page() {
	const chatId = uuidv4();

	return (
		<PrivatePage>
			<div className="w-full min-h-screen bg-black">
				<div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-pink-600/10 pointer-events-none" />
				<Chat
					key={chatId}
					id={chatId}
					initialMessages={[]}
					initialTransformedImages={[]}
				/>
			</div>
		</PrivatePage>
	);
}
