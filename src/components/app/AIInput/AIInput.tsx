"use client";

import { useRef } from "react";
import { PaperclipIcon, SendHorizontalIcon } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

type AIInputProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  showDisclaimer?: boolean;
  className?: string;
}>;

function AIInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Pergunte sobre seus gastos, metas, dívidas…",
  disabled = false,
  loading = false,
  showDisclaimer = true,
  className,
}: AIInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = disabled || loading;
  const canSubmit = value.trim().length > 0 && !isDisabled;

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    adjustHeight();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-end gap-2 rounded-2xl border bg-background px-3 py-2.5 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
        <IconButton
          aria-label="Anexar arquivo"
          variant="ghost"
          size="sm"
          disabled
          className="mb-0.5 shrink-0 text-muted-foreground"
        >
          <PaperclipIcon />
        </IconButton>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          aria-label="Digite sua pergunta"
          aria-multiline="true"
          rows={1}
          className="min-h-6 flex-1 resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />

        <IconButton
          aria-label="Enviar pergunta"
          variant="default"
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mb-0.5 shrink-0 rounded-lg"
        >
          <SendHorizontalIcon />
        </IconButton>
      </div>

      {showDisclaimer && (
        <p className="text-center text-xs text-muted-foreground">
          A IA pode cometer erros. Sempre mostro a fonte para você conferir.
        </p>
      )}
    </div>
  );
}

export { AIInput };
export type { AIInputProps };
