import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

describe("Card", () => {
  it("renders children with default ui kit styles", () => {
    render(
      <Card>
        <CardTitle>Card base</CardTitle>
      </Card>,
    );

    const card = screen.getByText("Card base").closest("[data-slot='card']");

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-lg");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-border");
    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("text-card-foreground");
    expect(card).toHaveClass("shadow-card");
    expect(card).toHaveClass("p-5");
  });

  it.each([
    ["metric", "border-foreground"],
    ["ai", "bg-primary-soft"],
  ] as const)("renders %s variant classes", (variant, expectedClass) => {
    render(<Card variant={variant}>Conteúdo</Card>);

    expect(screen.getByText("Conteúdo")).toHaveClass(expectedClass);
  });

  it.each([
    ["sm", "p-4"],
    ["none", "p-0"],
  ] as const)("renders %s padding classes", (padding, expectedClass) => {
    render(<Card padding={padding}>Conteúdo</Card>);

    expect(screen.getByText("Conteúdo")).toHaveClass(expectedClass);
  });

  it("supports interactive hover and focus styles", () => {
    render(<Card interactive>Conteúdo</Card>);

    const card = screen.getByText("Conteúdo");

    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("hover:border-border-strong");
    expect(card).toHaveClass("hover:shadow-pop");
    expect(card).toHaveClass("focus-visible:border-primary");
    expect(card).toHaveClass(
      "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)]",
    );
    expect(card).toHaveClass("focus-visible:outline-none");
  });

  it("does not override an explicit tabIndex", () => {
    render(
      <Card interactive tabIndex={-1}>
        Conteúdo
      </Card>,
    );

    expect(screen.getByText("Conteúdo")).toHaveAttribute("tabindex", "-1");
  });

  it("supports custom className", () => {
    render(<Card className="custom-card">Conteúdo</Card>);

    expect(screen.getByText("Conteúdo")).toHaveClass("custom-card");
  });

  it("renders card composition slots", () => {
    render(
      <Card>
        <CardHeader>
          <CardEyebrow>Análise da IA</CardEyebrow>
        </CardHeader>
        <CardContent>
          <CardTitle>Saldo total</CardTitle>
          <CardDescription>Superfície com borda sutil.</CardDescription>
        </CardContent>
        <CardFooter>Baseado em 28 transações</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Análise da IA")).toHaveAttribute(
      "data-slot",
      "card-eyebrow",
    );
    expect(screen.getByText("Saldo total")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
    expect(screen.getByText("Superfície com borda sutil.")).toHaveAttribute(
      "data-slot",
      "card-description",
    );
    expect(screen.getByText("Baseado em 28 transações")).toHaveAttribute(
      "data-slot",
      "card-footer",
    );
  });
});
