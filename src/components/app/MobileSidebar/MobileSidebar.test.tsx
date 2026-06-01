import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobileSidebar } from "./MobileSidebar";
import { appRoutes } from "@/lib/app-routes";

describe("MobileSidebar", () => {
  it("renders an accessible drawer with navigation when open", () => {
    render(
      <MobileSidebar
        open
        pathname={appRoutes.dashboard}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-slot",
      "drawer-content",
    );
    expect(screen.getByText("Menu principal")).toHaveClass("sr-only");
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("closes when a route is selected", () => {
    const onOpenChange = vi.fn();

    render(
      <MobileSidebar
        open
        pathname={appRoutes.dashboard}
        onOpenChange={onOpenChange}
      />,
    );

    const link = screen.getByRole("link", { name: "Transações" });
    link.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(link);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
