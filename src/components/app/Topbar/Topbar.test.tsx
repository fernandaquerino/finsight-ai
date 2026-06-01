import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Topbar } from "./Topbar";
import { appRoutes } from "@/routes/app-routes";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("Topbar", () => {
  it("renders title, search, actions, and avatar", () => {
    render(<Topbar title="Dashboard" onMenuClick={vi.fn()} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(
      screen.getByRole("searchbox", { name: "Buscar transações..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Perguntar à IA" }),
    ).toHaveAttribute("href", appRoutes.aiChat);
    expect(
      screen.getByRole("button", { name: "Alternar tema" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notificações" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Marina Rocha" })).toBeVisible();
  });

  it("calls onMenuClick from the menu button", async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();

    render(<Topbar title="Dashboard" onMenuClick={onMenuClick} />);

    await user.click(screen.getByRole("button", { name: "Alternar menu" }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
