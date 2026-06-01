import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState, emptyStatePresets } from "./EmptyState";

describe("EmptyState", () => {
  it("renders icon, title, description, and actions", () => {
    const onClick = vi.fn();

    render(
      <EmptyState
        title="Sem dados"
        description="Adicione informações para começar."
        primaryAction={{ label: "Adicionar", onClick }}
        secondaryAction={{ label: "Importar", href: "/imports" }}
      />,
    );

    expect(screen.getByText("Sem dados")).toBeInTheDocument();
    expect(
      screen.getByText("Adicione informações para começar."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Importar" })).toHaveAttribute(
      "href",
      "/imports",
    );
  });

  it("renders the dashboard preset", () => {
    render(<EmptyState variant="dashboard" />);

    expect(screen.getByText(emptyStatePresets.dashboard.title)).toBeVisible();
  });

  it("renders a custom action slot", () => {
    render(
      <EmptyState actionSlot={<button type="button">Ação livre</button>} />,
    );

    expect(screen.getByRole("button", { name: "Ação livre" })).toBeVisible();
  });
});
