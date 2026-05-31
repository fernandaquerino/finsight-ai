"use client";

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
  const selectedTheme: ThemeOption = isThemeOption(theme) ? theme : "system";

  return (
    <fieldset
      className="bg-card inline-flex rounded-lg border p-1 shadow-sm"
      aria-label="Theme"
    >
      {themeOptions.map((option) => {
        const isSelected = selectedTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => setTheme(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
