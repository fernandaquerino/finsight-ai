"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  showShortcut?: boolean;
  shortcutLabel?: string;
}

function SearchInput({
  className,
  placeholder = "Buscar transações...",
  showShortcut = true,
  shortcutLabel = "⌘K",
  "aria-label": ariaLabel,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <SearchIcon
        className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        type="search"
        data-slot="search-input"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "flex h-9 w-full rounded-md border border-border bg-background py-0 pr-3 pl-9 text-sm text-foreground transition-[border-color,box-shadow] duration-[140ms] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)] disabled:cursor-not-allowed disabled:opacity-50",
          showShortcut && "pr-14",
          className,
        )}
        {...props}
      />

      {showShortcut && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground select-none sm:flex"
        >
          {shortcutLabel}
        </kbd>
      )}
    </div>
  );
}

export { SearchInput };
