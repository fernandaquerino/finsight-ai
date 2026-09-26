"use client";

import type { UIMessage } from "ai";

import { AIMessage } from "@/components/app/AIMessage";
import { AIResponseFeedback } from "@/components/app/AIResponseFeedback";
import { SourceReference } from "@/components/app/SourceReference";
import { collectSources, collectText } from "@/features/ai-chat/sources";
import { renderInlineMarkdown } from "@/features/ai-chat/markdown";

type ChatMessageProps = Readonly<{
  message: UIMessage;
  // Enquanto a resposta ainda chega, escondemos fonte e feedback: avaliar ou
  // conferir uma frase pela metade não faz sentido.
  isStreaming?: boolean;
}>;

function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const text = collectText(message);

  if (message.role === "user") {
    return <AIMessage variant="user">{text}</AIMessage>;
  }

  const sources = collectSources(message);

  return (
    <AIMessage variant="assistant">
      <div className="flex flex-col gap-3">
        <p className="leading-relaxed whitespace-pre-wrap">
          {renderInlineMarkdown(text)}
        </p>

        {!isStreaming && sources.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t pt-3">
            {sources.map((source, index) => (
              <SourceReference key={`${source.toolName}-${index}`}>
                {source.description}
              </SourceReference>
            ))}
          </div>
        )}

        {!isStreaming && text.length > 0 && <AIResponseFeedback />}
      </div>
    </AIMessage>
  );
}

export { ChatMessage };
export type { ChatMessageProps };
