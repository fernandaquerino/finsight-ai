import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children with default variant classes", () => {
    render(<Badge>Status</Badge>);

    const badge = screen.getByText("Status");

    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("rounded-md");
    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
  });

  it.each([
    ["secondary", "bg-secondary"],
    ["destructive", "bg-destructive"],
    ["outline", "text-foreground"],
    ["success", "bg-success"],
    ["warning", "bg-warning"],
    ["info", "bg-info"],
    ["ai", "gap-1"],
  ] as const)("renders %s variant classes", (variant, expectedClass) => {
    render(<Badge variant={variant}>Status</Badge>);

    expect(screen.getByText("Status")).toHaveClass(expectedClass);
  });

  it("supports custom className", () => {
    render(<Badge className="custom-badge">Status</Badge>);

    expect(screen.getByText("Status")).toHaveClass("custom-badge");
  });

  it("forwards native span props", () => {
    render(
      <Badge aria-label="Status da transação" title="Processado">
        Pago
      </Badge>,
    );

    const badge = screen.getByLabelText("Status da transação");

    expect(badge).toHaveAttribute("title", "Processado");
    expect(badge).toHaveTextContent("Pago");
  });

  it("has focus-visible classes", () => {
    render(<Badge>Status</Badge>);

    const badge = screen.getByText("Status");

    expect(badge).toHaveClass("focus-visible:ring-2");
    expect(badge).toHaveClass("focus-visible:ring-ring");
    expect(badge).toHaveClass("focus-visible:ring-offset-2");
    expect(badge).toHaveClass("focus-visible:outline-none");
  });
});
