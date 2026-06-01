import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders with default placeholder as accessible name", () => {
    render(<SearchInput />);

    expect(
      screen.getByRole("searchbox", { name: "Buscar transações..." }),
    ).toBeInTheDocument();
  });

  it("renders custom placeholder", () => {
    render(<SearchInput placeholder="Buscar categorias..." />);

    expect(
      screen.getByRole("searchbox", { name: "Buscar categorias..." }),
    ).toHaveAttribute("placeholder", "Buscar categorias...");
  });

  it("renders search icon", () => {
    render(<SearchInput />);

    const input = screen.getByRole("searchbox");
    const icon = input.parentElement?.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("renders shortcut badge by default", () => {
    render(<SearchInput />);

    const kbd = screen.getByText("⌘K");

    expect(kbd.tagName).toBe("KBD");
    expect(kbd).toHaveAttribute("aria-hidden", "true");
  });

  it("renders custom shortcut label", () => {
    render(<SearchInput shortcutLabel="Ctrl+K" />);

    expect(screen.getByText("Ctrl+K")).toBeInTheDocument();
  });

  it("hides shortcut when showShortcut is false", () => {
    render(<SearchInput showShortcut={false} />);

    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });

  it("supports aria-label override", () => {
    render(<SearchInput aria-label="Pesquisar" />);

    expect(
      screen.getByRole("searchbox", { name: "Pesquisar" }),
    ).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();

    render(<SearchInput />);

    const input = screen.getByRole("searchbox");

    await user.type(input, "Uber");

    expect(input).toHaveValue("Uber");
  });

  it("supports disabled state", () => {
    render(<SearchInput disabled />);

    expect(screen.getByRole("searchbox")).toBeDisabled();
  });

  it("has focus-visible classes", () => {
    render(<SearchInput />);

    const input = screen.getByRole("searchbox");

    expect(input).toHaveClass("focus-visible:border-primary");
    expect(input).toHaveClass(
      "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)]",
    );
  });

  it("has correct data-slot attribute", () => {
    render(<SearchInput />);

    expect(screen.getByRole("searchbox")).toHaveAttribute(
      "data-slot",
      "search-input",
    );
  });
});
