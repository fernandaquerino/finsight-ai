import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "./Sidebar";
import { appRoutes } from "@/lib/app-routes";

describe("Sidebar — expanded (default)", () => {
  it("renders the navigation groups and routes", () => {
    render(<Sidebar pathname={appRoutes.dashboard} className="flex" />);

    expect(screen.getByRole("img", { name: "FinSight AI" })).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("VISÃO GERAL")).toBeVisible();
    expect(screen.getByText("INTELIGÊNCIA")).toBeVisible();
    expect(screen.getByText("PLANEJAMENTO")).toBeVisible();
    expect(screen.getByText("ENTRADAS")).toBeVisible();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      appRoutes.settings,
    );
  });

  it("marks nested transaction routes as active", () => {
    render(<Sidebar pathname={appRoutes.manualEntry} className="flex" />);

    expect(screen.getByRole("link", { name: "Transações" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Lançamento manual" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("calls onNavigate when a route is clicked", () => {
    const onNavigate = vi.fn();

    render(
      <Sidebar
        pathname={appRoutes.dashboard}
        className="flex"
        onNavigate={onNavigate}
      />,
    );

    const link = screen.getByRole("link", { name: "Relatórios" });
    link.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(link);

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("Sidebar — collapsed", () => {
  it("hides group labels and route text, keeps icon-accessible navigation", () => {
    render(
      <Sidebar pathname={appRoutes.dashboard} className="flex" isCollapsed />,
    );

    expect(screen.getByRole("img", { name: "FinSight AI" })).toBeVisible();
    expect(screen.queryByText("VISÃO GERAL")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toBeVisible();
  });

  it("renders the Insights indicator in compact position", () => {
    render(
      <Sidebar pathname={appRoutes.dashboard} className="flex" isCollapsed />,
    );

    expect(screen.getByTestId("sidebar-route-indicator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
