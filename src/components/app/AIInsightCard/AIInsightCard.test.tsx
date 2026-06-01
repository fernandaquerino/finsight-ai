import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIInsightCard, insightCardConfig } from "./AIInsightCard";

describe("AIInsightCard", () => {
  it("renders title and description", () => {
    render(
      <AIInsightCard
        type="opportunity"
        title="Assinaturas que você pode revisar"
        description="Identifiquei 3 assinaturas com baixo uso."
      />,
    );
    expect(
      screen.getByText("Assinaturas que você pode revisar"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Identifiquei 3 assinaturas com baixo uso."),
    ).toBeInTheDocument();
  });

  it.each(
    Object.entries(insightCardConfig) as [
      keyof typeof insightCardConfig,
      (typeof insightCardConfig)[keyof typeof insightCardConfig],
    ][],
  )("renders type label for '%s'", (type, config) => {
    render(
      <AIInsightCard type={type} title="Título" description="Descrição" />,
    );
    expect(screen.getByText(config.typeLabel)).toBeInTheDocument();
  });

  it("renders 'Novo' badge by default", () => {
    render(
      <AIInsightCard type="info" title="Título" description="Descrição" />,
    );
    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("renders 'Aplicado' badge when status is applied", () => {
    render(
      <AIInsightCard
        type="info"
        status="applied"
        title="Título"
        description="Descrição"
      />,
    );
    expect(screen.getByText("Aplicado")).toBeInTheDocument();
  });

  it("renders highlight when provided", () => {
    render(
      <AIInsightCard
        type="attention"
        title="Título"
        description="Descrição"
        highlight={{ value: "R$ 268 a mais", variant: "warning" }}
      />,
    );
    expect(screen.getByText("R$ 268 a mais")).toBeInTheDocument();
  });

  it("renders source reference when provided", () => {
    render(
      <AIInsightCard
        type="risk"
        title="Título"
        description="Descrição"
        source="Baseado em 28 transações de maio"
      />,
    );
    expect(
      screen.getByText("Baseado em 28 transações de maio"),
    ).toBeInTheDocument();
  });

  it("renders action link when actionLabel and actionHref are provided", () => {
    render(
      <AIInsightCard
        type="opportunity"
        title="Título"
        description="Descrição"
        actionLabel="Ver como economizar"
        actionHref="/insights/1"
      />,
    );
    const link = screen.getByRole("link", { name: /ver como economizar/i });
    expect(link).toHaveAttribute("href", "/insights/1");
  });

  it("renders feedback buttons", () => {
    render(
      <AIInsightCard type="info" title="Título" description="Descrição" />,
    );
    expect(screen.getByRole("button", { name: "Útil" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Não útil" }),
    ).toBeInTheDocument();
  });
});
