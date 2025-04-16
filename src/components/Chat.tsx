"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { ChatMessages } from "./ChatMessages";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useUser } from "./AuthProvider/AuthProvider";
import { useEffect } from "react";
export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const { user } = useUser();
  const { data: availableTokens } = api.tokens.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { mutateAsync: checkout } = api.tokens.checkout.useMutation();

  const trpcUtils = api.useUtils();
  const { messages, handleSubmit, input, setInput, isLoading, status } =
    useChat({
      id,
      body: { id },
      initialMessages,
      experimental_throttle: 100,
      sendExtraMessageFields: true,
      generateId: () => crypto.randomUUID(),
      onFinish: () => {
        trpcUtils.chats.getChatMessagesByChatId.invalidate({
          chatId: id,
        });
        trpcUtils.chats.getChats.invalidate();
      },
      onError: () => {
        toast.error("An error occurred, please try again!");
      },
    });
  const submitInput = () => {
    if (availableTokens && availableTokens <= 0) {
      toast.error("You have no tokens left!");
      checkout({ chatId: id }).then((checkout) => {
        PolarEmbedCheckout.create(checkout.url, "dark");
      });

      return;
    }
    window.history.replaceState({}, "", `/chat/${id}`);
    handleSubmit();
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background relative">
        <ChatMessages status={status} messages={messages} />
        <form className="sticky bottom-0 left-0 right-0 flex items-center gap-2 border-t bg-background p-4">
          <Input
            placeholder="Type your message..."
            className="flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();

                if (status !== "ready") {
                  toast.error(
                    "Please wait for the model to finish its response!"
                  );
                } else {
                  submitInput();
                }
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <SendHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </>
  );
}
