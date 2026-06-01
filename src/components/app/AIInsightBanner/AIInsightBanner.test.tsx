import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AIInsightBanner } from "./AIInsightBanner";

describe("AIInsightBanner", () => {
  it("renders title and description", () => {
    render(
      <AIInsightBanner
        title="5 observações para você esta semana"
        description="2 oportunidades, 2 pontos de atenção e 1 risco."
      />,
    );
    expect(
      screen.getByText("5 observações para você esta semana"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2 oportunidades, 2 pontos de atenção e 1 risco."),
    ).toBeInTheDocument();
  });

  it("renders default label", () => {
    render(<AIInsightBanner title="Título" description="Descrição" />);
    expect(screen.getByText("ANÁLISE DA IA")).toBeInTheDocument();
  });

  it("renders custom label", () => {
    render(
      <AIInsightBanner
        label="RESUMO DA IA"
        title="Título"
        description="Descrição"
      />,
    );
    expect(screen.getByText("RESUMO DA IA")).toBeInTheDocument();
  });

  it("renders metric when provided", () => {
    render(
      <AIInsightBanner
        title="Título"
        description="Descrição"
        metric={{ label: "ECONOMIA POTENCIAL", value: "R$ 1.352/ano" }}
      />,
    );
    expect(screen.getByText("ECONOMIA POTENCIAL")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.352/ano")).toBeInTheDocument();
  });

  it("renders source reference when provided", () => {
    render(
      <AIInsightBanner
        title="Título"
        description="Descrição"
        source="Estratégia avalanche · baseada nas taxas de juros"
      />,
    );
    expect(
      screen.getByText("Estratégia avalanche · baseada nas taxas de juros"),
    ).toBeInTheDocument();
  });

  it("renders action slot when provided", () => {
    render(
      <AIInsightBanner
        title="Título"
        description="Descrição"
        actionSlot={<button type="button">Simular quitação</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Simular quitação" }),
    ).toBeInTheDocument();
  });
});
