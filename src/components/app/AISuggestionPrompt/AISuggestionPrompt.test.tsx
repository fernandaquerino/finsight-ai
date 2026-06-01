import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AISuggestionPrompt } from "./AISuggestionPrompt";

const suggestions = [
  { prompt: "Onde gastei mais este mês?" },
  { prompt: "Quais assinaturas posso revisar?" },
];

describe("AISuggestionPrompt", () => {
  it("renders all suggestions", () => {
    render(<AISuggestionPrompt suggestions={suggestions} onSelect={vi.fn()} />);
    expect(screen.getByText("Onde gastei mais este mês?")).toBeInTheDocument();
    expect(
      screen.getByText("Quais assinaturas posso revisar?"),
    ).toBeInTheDocument();
  });

  it("calls onSelect with the prompt text when clicked", async () => {
    const onSelect = vi.fn();
    render(
      <AISuggestionPrompt suggestions={suggestions} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /onde gastei/i }));
    expect(onSelect).toHaveBeenCalledWith("Onde gastei mais este mês?");
  });

  it("renders all items as buttons", () => {
    render(<AISuggestionPrompt suggestions={suggestions} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(suggestions.length);
  });
});
