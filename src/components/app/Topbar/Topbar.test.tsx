import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Topbar } from "./Topbar";
import { appRoutes } from "@/lib/app-routes";

vi.mock("@/components/app/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

const mockUser = {
  name: "Marina Rocha",
  email: "marina.rocha@email.com",
};

describe("Topbar", () => {
  it("renders title, search, actions, and avatar", () => {
    render(<Topbar title="Dashboard" onMenuClick={vi.fn()} user={mockUser} />);

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
      screen.getByRole("button", { name: /Notificações/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Marina Rocha" })).toBeVisible();
  });

  it("calls onMenuClick from the menu button", async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();

    render(
      <Topbar title="Dashboard" onMenuClick={onMenuClick} user={mockUser} />,
    );

    await user.click(screen.getByRole("button", { name: "Alternar menu" }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("opens command search from the search input", async () => {
    const user = userEvent.setup();

    render(<Topbar title="Dashboard" onMenuClick={vi.fn()} user={mockUser} />);

    await user.click(
      screen.getByRole("searchbox", { name: "Buscar transações..." }),
    );

    expect(
      screen.getByRole("dialog", { name: "Busca de comandos" }),
    ).toBeInTheDocument();
  });
});
