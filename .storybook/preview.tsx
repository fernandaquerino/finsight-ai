import type { Preview } from "@storybook/react";
import { useEffect } from "react";
import "../src/app/globals.css";

function ThemeDecorator({
  Story,
  theme,
}: {
  Story: React.ComponentType;
  theme: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    return () => {
      root.classList.remove("dark");
    };
  }, [theme]);

  return (
    <div className="bg-background text-foreground antialiased">
      <Story />
    </div>
  );
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Tema da interface",
      defaultValue: "light",
      toolbar: {
        title: "Tema",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const theme = (globals.theme as string) ?? "light";
      return <ThemeDecorator Story={Story} theme={theme} />;
    },
  ],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
};

export default preview;
