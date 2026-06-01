"use client";

import type { ElementType } from "react";
import { MessageCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AISuggestionItem = Readonly<{
  prompt: string;
  icon?: ElementType;
}>;

type AISuggestionPromptProps = Readonly<{
  suggestions: AISuggestionItem[];
  onSelect: (prompt: string) => void;
  className?: string;
}>;

function AISuggestionPrompt({
  suggestions,
  onSelect,
  className,
}: AISuggestionPromptProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {suggestions.map((item) => {
        const Icon = item.icon ?? MessageCircleIcon;

        return (
          <button
            key={item.prompt}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="flex items-start gap-2 rounded-lg border bg-background p-3 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <Icon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{item.prompt}</span>
          </button>
        );
      })}
    </div>
  );
}

export { AISuggestionPrompt };
export type { AISuggestionItem, AISuggestionPromptProps };
