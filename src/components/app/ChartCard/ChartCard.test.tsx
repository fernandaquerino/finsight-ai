import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChartCard } from "./ChartCard";

describe("ChartCard", () => {
  it("renders title and subtitle", () => {
    render(
      <ChartCard title="Saldo ao longo do mês" subtitle="Atualizado hoje">
        <div>conteúdo</div>
      </ChartCard>,
    );

    expect(
      screen.getByText("Saldo ao longo do mês"),
    ).toBeInTheDocument();
    expect(screen.getByText("Atualizado hoje")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(
      <ChartCard title="Título" action={<button>+4,2%</button>}>
        <div>conteúdo</div>
      </ChartCard>,
    );

    expect(screen.getByRole("button", { name: "+4,2%" })).toBeInTheDocument();
  });

  it("renders children when not loading and not empty", () => {
    render(
      <ChartCard title="Título">
        <p>gráfico aqui</p>
      </ChartCard>,
    );

    expect(screen.getByText("gráfico aqui")).toBeInTheDocument();
  });

  it("renders a skeleton and hides children when isLoading", () => {
    render(
      <ChartCard title="Título" isLoading>
        <p>gráfico aqui</p>
      </ChartCard>,
    );

    expect(screen.queryByText("gráfico aqui")).not.toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("renders the empty state message when isEmpty", () => {
    render(
      <ChartCard title="Título" isEmpty emptyMessage="Sem dados no período">
        <p>gráfico aqui</p>
      </ChartCard>,
    );

    expect(screen.queryByText("gráfico aqui")).not.toBeInTheDocument();
    expect(screen.getByText("Sem dados no período")).toBeInTheDocument();
  });

  it("renders the default empty message when isEmpty and no emptyMessage", () => {
    render(
      <ChartCard title="Título" isEmpty>
        <div />
      </ChartCard>,
    );

    expect(
      screen.getByText("Nenhum dado disponível para o período"),
    ).toBeInTheDocument();
  });
});
