import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarCollapsed } from "./SidebarCollapsed";
import { appRoutes } from "@/routes/app-routes";

describe("SidebarCollapsed", () => {
  it("renders only icon-accessible navigation without group labels", () => {
    render(<SidebarCollapsed pathname={appRoutes.dashboard} />);

    expect(screen.getByRole("img", { name: "FinSight AI" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toBeVisible();
    expect(screen.queryByText("VISÃO GERAL")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders the Insights indicator in compact mode", () => {
    render(<SidebarCollapsed pathname={appRoutes.dashboard} />);

    expect(screen.getByTestId("sidebar-route-indicator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
