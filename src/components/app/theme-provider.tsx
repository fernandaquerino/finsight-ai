"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

type ThemeProviderProps = Readonly<{
  children: React.ReactNode;
  attribute?: "class";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
}>;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";
const themes = ["light", "dark", "system"] as const;
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return themes.some((theme) => theme === value);
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ResolvedTheme, enableColorScheme: boolean): void {
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(theme);

  if (enableColorScheme) {
    root.style.colorScheme = theme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);

    return isTheme(storedTheme) ? storedTheme : defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>(getSystemTheme);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function syncTheme(): void {
      const nextResolvedTheme =
        theme === "system" && enableSystem ? getSystemTheme() : theme;

      if (nextResolvedTheme === "system") {
        return;
      }

      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme, enableColorScheme);
    }

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, [enableColorScheme, enableSystem, theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
