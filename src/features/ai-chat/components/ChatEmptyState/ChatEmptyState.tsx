"use client";

import { SparklesIcon } from "lucide-react";

import { AISuggestionPrompt } from "@/components/app/AISuggestionPrompt";
import { CHAT_SUGGESTIONS } from "@/features/ai-chat/constants";

type ChatEmptyStateProps = Readonly<{
  onSelect: (prompt: string) => void;
}>;

function ChatEmptyState({ onSelect }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-7 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          <SparklesIcon className="size-6" />
        </span>

        <h2 className="text-xl font-medium tracking-tight">
          Pergunte sobre suas finanças
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Respondo com base nos seus dados reais — transações, categorias, metas
          e dívidas. Sempre mostro de onde tirei a resposta.
        </p>
      </div>

      <AISuggestionPrompt
        suggestions={[...CHAT_SUGGESTIONS]}
        onSelect={onSelect}
        className="mx-auto w-full max-w-lg grid-cols-1 sm:grid-cols-2"
      />
    </div>
  );
}

export { ChatEmptyState };
export type { ChatEmptyStateProps };
