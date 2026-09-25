import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Settings } from "@/features/settings/types";

import { SettingsScreen } from "./SettingsScreen";

vi.mock("@/components/app/theme-provider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsScreen />
    </QueryClientProvider>,
  );
}

function jsonResponse(settings: Settings) {
  return new Response(JSON.stringify({ data: settings }), { status: 200 });
}

// Dados fictícios — nunca usar dados reais em fixtures.
const settings: Settings = {
  profile: {
    name: "Marina Teste",
    email: "marina@exemplo.test",
    image: null,
    phone: "+55 11 90000-0000",
    cpfMasked: "***.***.247-**",
    hasCpf: true,
    signInProvider: "credentials",
    hasPassword: true,
    memberSince: "2026-01-15T12:00:00.000Z",
  },
  ai: {
    consentGivenAt: "2026-01-15T12:00:00.000Z",
    autoCategorize: true,
    proactiveInsights: false,
  },
  notifications: {
    spendAlerts: true,
    weeklySummary: true,
    installmentReminders: false,
  },
  accounts: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Nubank",
      type: "checking",
      institution: null,
      createdAt: "2026-01-15T12:00:00.000Z",
    },
  ],
};

const withoutConsent: Settings = {
  ...settings,
  ai: { ...settings.ai, consentGivenAt: null },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SettingsScreen", () => {
  it("shows a skeleton and then the persisted preferences", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    expect(
      screen.getByLabelText("Carregando configurações"),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("switch", { name: "Categorização automática" }),
    ).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Insights proativos" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Vencimento de dívidas" }),
    ).not.toBeChecked();
  });

  it("describes each toggle for screen readers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    const toggle = await screen.findByRole("switch", {
      name: "Alertas de gasto",
    });
    expect(toggle).toHaveAccessibleDescription(
      "Quando uma categoria estourar o orçamento",
    );
  });

  it("patches only the toggled preference", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(settings));
    vi.stubGlobal("fetch", fetchMock);

    renderScreen();

    await userEvent.click(
      await screen.findByRole("switch", { name: "Alertas de gasto" }),
    );

    const patchCall = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "PATCH",
    );
    expect(patchCall?.[0]).toBe("/api/settings");
    expect(JSON.parse((patchCall?.[1] as RequestInit).body as string)).toEqual({
      notifications: { spendAlerts: false },
    });
  });

  it("shows the account count and links to Minha conta", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    expect(await screen.findByText("1 conta")).toBeVisible();
    expect(screen.getByRole("link", { name: "Gerenciar" })).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("disables the AI toggles when there is no AI consent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(withoutConsent)),
    );

    renderScreen();

    expect(
      await screen.findByRole("switch", { name: "Categorização automática" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/não deu consentimento para o processamento por IA/),
    ).toBeVisible();
  });

  it("always offers a way out of the account", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    const logout = await screen.findByRole("button", { name: "Sair da conta" });
    expect(logout).toBeVisible();
    expect(logout.closest("form")).toHaveAttribute("action", "/logout");
  });

  it("shows a retry action when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("Não foi possível carregar as configurações"),
    ).toBeVisible();
    expect(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
