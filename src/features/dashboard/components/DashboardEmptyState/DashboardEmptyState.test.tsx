import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { appRoutes } from "@/lib/app-routes";
import { DashboardEmptyState } from "./DashboardEmptyState";

describe("DashboardEmptyState", () => {
  it("renders the two CTAs pointing to the correct screens", () => {
    render(<DashboardEmptyState />);

    expect(
      screen.getByRole("link", { name: "Importar extrato" }),
    ).toHaveAttribute("href", "/imports");
    expect(
      screen.getByRole("link", { name: "Lançar manualmente" }),
    ).toHaveAttribute("href", appRoutes.manualEntry);
  });

  it("renders the 3-step quick guide", () => {
    render(<DashboardEmptyState />);

    expect(
      screen.getByRole("region", { name: "Guia rápido para começar" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1\. Traga seus dados/)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. Veja para onde vai o dinheiro/),
    ).toBeInTheDocument();
    expect(screen.getByText(/3\. Converse com a IA/)).toBeInTheDocument();
  });
});
