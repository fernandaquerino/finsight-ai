import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./ThemeToggle";

const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock("@/components/app/theme-provider", () => ({
  useTheme: () => mockUseTheme(),
}));

// Make requestAnimationFrame fire synchronously so isMounted is true after render.
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.clearAllMocks();
  mockUseTheme.mockReturnValue({ theme: "light", setTheme: mockSetTheme });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ThemeToggle — segmented variant (default)", () => {
  it("renders the three theme option buttons inside a fieldset", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
  });

  it("marks the active theme button as pressed", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls setTheme with the correct value when a button is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    await user.click(screen.getByRole("button", { name: "System" }));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});

describe("ThemeToggle — icon variant", () => {
  it("renders an icon button with the correct accessible label", () => {
    render(<ThemeToggle variant="icon" />);

    expect(
      screen.getByRole("button", { name: "Alternar tema" }),
    ).toBeInTheDocument();
  });

  it("calls setTheme('dark') when the current theme is light", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle variant="icon" />);

    await user.click(screen.getByRole("button", { name: "Alternar tema" }));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme('light') when the current theme is dark", async () => {
    mockUseTheme.mockReturnValue({ theme: "dark", setTheme: mockSetTheme });

    const user = userEvent.setup();
    render(<ThemeToggle variant="icon" />);

    await user.click(screen.getByRole("button", { name: "Alternar tema" }));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
