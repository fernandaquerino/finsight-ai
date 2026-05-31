"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

type ThemeOption = (typeof themeOptions)[number]["value"];

function isThemeOption(value: string | undefined): value is ThemeOption {
  return themeOptions.some((option) => option.value === value);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const selectedTheme: ThemeOption | undefined =
    isMounted && isThemeOption(theme) ? theme : undefined;

  return (
    <fieldset
      className="inline-flex rounded-lg border bg-card p-1 shadow-sm"
      aria-label="Theme"
    >
      {themeOptions.map((option) => {
        const isSelected = selectedTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
            data-selected={isSelected}
            aria-pressed={isSelected}
            suppressHydrationWarning
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
