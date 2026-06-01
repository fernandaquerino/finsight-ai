import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIThinkingState } from "./AIThinkingState";

describe("AIThinkingState", () => {
  it("renders default message", () => {
    render(<AIThinkingState />);
    expect(screen.getByText("Analisando seus dados...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<AIThinkingState message="Processando..." />);
    expect(screen.getByText("Processando...")).toBeInTheDocument();
  });

  it("has a live region for screen readers", () => {
    render(<AIThinkingState />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
