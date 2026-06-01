import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIButton } from "./AIButton";

describe("AIButton", () => {
  it("renders a link with default label", () => {
    render(<AIButton href="/ai-chat" />);
    const link = screen.getByRole("link", { name: /perguntar à ia/i });
    expect(link).toHaveAttribute("href", "/ai-chat");
  });

  it("renders with custom label", () => {
    render(<AIButton href="/ai-chat" label="Chat IA" />);
    expect(screen.getByRole("link", { name: "Chat IA" })).toBeVisible();
  });

  it("applies custom className", () => {
    render(<AIButton href="/ai-chat" className="hidden sm:inline-flex" />);
    expect(screen.getByRole("link")).toHaveClass("hidden");
  });
});
