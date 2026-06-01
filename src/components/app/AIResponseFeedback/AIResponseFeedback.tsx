"use client";

import { useState } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type FeedbackValue = "helpful" | "not_helpful";

type AIResponseFeedbackProps = Readonly<{
  onFeedback?: (value: FeedbackValue | null) => void;
  className?: string;
}>;

function AIResponseFeedback({
  onFeedback,
  className,
}: AIResponseFeedbackProps) {
  const [selected, setSelected] = useState<FeedbackValue | null>(null);

  function handleSelect(value: FeedbackValue) {
    const next = selected === value ? null : value;
    setSelected(next);
    onFeedback?.(next);
  }

  return (
    <div
      role="group"
      aria-label="Avaliação da resposta"
      className={cn("flex items-center gap-0.5", className)}
    >
      <IconButton
        aria-label="Útil"
        variant="ghost"
        size="sm"
        onClick={() => handleSelect("helpful")}
        className={cn(
          "text-muted-foreground",
          selected === "helpful" && "text-success hover:text-success",
        )}
      >
        <ThumbsUpIcon />
      </IconButton>
      <IconButton
        aria-label="Não útil"
        variant="ghost"
        size="sm"
        onClick={() => handleSelect("not_helpful")}
        className={cn(
          "text-muted-foreground",
          selected === "not_helpful" && "text-danger hover:text-danger",
        )}
      >
        <ThumbsDownIcon />
      </IconButton>
    </div>
  );
}

export { AIResponseFeedback };
export type { AIResponseFeedbackProps, FeedbackValue };
