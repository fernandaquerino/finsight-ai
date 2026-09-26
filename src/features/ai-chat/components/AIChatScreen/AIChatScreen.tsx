"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { AIInput } from "@/components/app/AIInput";
import { AIThinkingState } from "@/components/app/AIThinkingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ChatEmptyState } from "@/features/ai-chat/components/ChatEmptyState";
import { ChatMessage } from "@/features/ai-chat/components/ChatMessage";

function AIChatScreen() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, status]);

  function send(text: string) {
    if (isBusy) return;

    clearError();
    setInput("");
    void sendMessage({ text });
  }

  // O último assistant ainda está sendo escrito? Enquanto isso não mostramos
  // fonte nem avaliação nele.
  const lastMessage = messages.at(-1);
  const streamingMessageId =
    status === "streaming" && lastMessage?.role === "assistant"
      ? lastMessage.id
      : null;

  // "submitted" = já enviamos e ainda não veio o primeiro token (o modelo pode
  // estar rodando tools). É o momento do AIThinkingState.
  const showThinking =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "user");

  return (
    // h-full resolve porque o container do AppShell é um flex item com altura
    // definida. O composer fica fixo no rodapé e só a lista rola.
    <main className="mx-auto flex h-full w-full max-w-3xl flex-col p-5 sm:p-6">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
        {isEmpty ? (
          <ChatEmptyState onSelect={send} />
        ) : (
          <div className="flex flex-col gap-5 pb-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.id === streamingMessageId}
              />
            ))}

            {showThinking && <AIThinkingState />}

            {error && (
              <ErrorState
                title="A IA não conseguiu responder"
                description="Pode ter sido uma instabilidade momentânea ou o limite de perguntas da hora. Tente de novo em instantes."
                onRetry={clearError}
                retryLabel="Entendi"
              />
            )}
          </div>
        )}
      </div>

      <div className="pt-4">
        <AIInput
          value={input}
          onChange={setInput}
          onSubmit={send}
          loading={isBusy}
        />
      </div>
    </main>
  );
}

export { AIChatScreen };
