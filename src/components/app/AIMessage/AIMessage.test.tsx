import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIMessage } from "./AIMessage";

describe("AIMessage", () => {
  it("renders user message content", () => {
    render(<AIMessage variant="user">Qual foi meu maior gasto?</AIMessage>);
    expect(screen.getByText("Qual foi meu maior gasto?")).toBeInTheDocument();
  });

  it("renders assistant message with aria-live region", () => {
    render(
      <AIMessage variant="assistant">
        Seu maior gasto foi alimentação.
      </AIMessage>,
    );
    const content = screen.getByText("Seu maior gasto foi alimentação.");
    expect(content).toHaveAttribute("aria-live", "polite");
  });

  it("renders system message", () => {
    render(<AIMessage variant="system">Conversa iniciada.</AIMessage>);
    expect(screen.getByText("Conversa iniciada.")).toBeInTheDocument();
  });
});
