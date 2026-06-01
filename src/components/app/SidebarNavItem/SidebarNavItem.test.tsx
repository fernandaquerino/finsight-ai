import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LayoutGridIcon } from "lucide-react";

import { SidebarNavItem } from "./SidebarNavItem";

const dashboardRoute = {
  label: "Dashboard",
  href: "/",
  icon: LayoutGridIcon,
} as const;

describe("SidebarNavItem", () => {
  it("renders a labeled expanded link", () => {
    render(<SidebarNavItem route={dashboardRoute} isActive={false} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("marks active route with aria-current", () => {
    render(<SidebarNavItem route={dashboardRoute} isActive />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("uses aria-label in collapsed mode", () => {
    render(
      <SidebarNavItem route={dashboardRoute} isActive={false} isCollapsed />,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeVisible();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders the optional indicator as decorative", () => {
    render(
      <SidebarNavItem
        route={{ ...dashboardRoute, hasIndicator: true }}
        isActive={false}
      />,
    );

    expect(screen.getByTestId("sidebar-route-indicator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("calls onNavigate when clicked", () => {
    const onNavigate = vi.fn();

    render(
      <SidebarNavItem
        route={dashboardRoute}
        isActive={false}
        onNavigate={onNavigate}
      />,
    );

    const link = screen.getByRole("link", { name: "Dashboard" });
    link.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(link);

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
