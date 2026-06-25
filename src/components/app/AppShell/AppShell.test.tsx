import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app/AppShell";
import { appRoutes, getRouteTitle, isActiveRoute } from "@/lib/app-routes";

const pathnameMock = vi.fn(() => appRoutes.dashboard);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

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

function mockDesktopViewport() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(min-width: 768px)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("AppShell routes", () => {
  it("matches only the root path for the dashboard route", () => {
    expect(isActiveRoute("/", appRoutes.dashboard)).toBe(true);
    expect(isActiveRoute(appRoutes.transactions, appRoutes.dashboard)).toBe(
      false,
    );
  });

  it("matches nested paths for non-root routes", () => {
    expect(isActiveRoute(appRoutes.manualEntry, appRoutes.transactions)).toBe(
      true,
    );
  });

  it("returns the current route title", () => {
    expect(getRouteTitle(appRoutes.insights)).toBe("Insights");
  });
});

describe("AppShell", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue(appRoutes.dashboard);
    mockDesktopViewport();
  });

  it("renders the expanded sidebar, topbar, and content", () => {
    render(
      <AppShell user={mockUser}>
        <section>Conteudo do dashboard</section>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByText("VISÃO GERAL")).toBeVisible();
    expect(screen.getByText("INTELIGÊNCIA")).toBeVisible();
    expect(screen.getByText("Conteudo do dashboard")).toBeVisible();
  });

  it("marks the current route as active", () => {
    render(
      <AppShell user={mockUser}>
        <section>Conteudo</section>
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders the Insights visual indicator as decorative", () => {
    render(
      <AppShell user={mockUser}>
        <section>Conteudo</section>
      </AppShell>,
    );

    expect(screen.getByTestId("sidebar-route-indicator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("toggles from expanded to compact sidebar on desktop", async () => {
    const user = userEvent.setup();

    render(
      <AppShell user={mockUser}>
        <section>Conteudo</section>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Alternar menu" }));

    expect(screen.queryByText("VISÃO GERAL")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toBeVisible();
  });

  it("renders accessible topbar actions", () => {
    render(
      <AppShell user={mockUser}>
        <section>Conteudo</section>
      </AppShell>,
    );

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
});
