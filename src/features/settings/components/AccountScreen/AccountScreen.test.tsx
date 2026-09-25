import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Settings } from "@/features/settings/types";

import { AccountScreen } from "./AccountScreen";

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AccountScreen />
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
    proactiveInsights: true,
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

const oauthOnly: Settings = {
  ...settings,
  profile: {
    ...settings.profile,
    signInProvider: "google",
    hasPassword: false,
    phone: null,
    cpfMasked: null,
    hasCpf: false,
  },
  accounts: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AccountScreen", () => {
  it("shows the profile and the masked CPF, never the full number", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    expect(screen.getByLabelText("Carregando sua conta")).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: "Marina Teste" }),
    ).toBeVisible();
    expect(screen.getByText("***.***.247-**")).toBeVisible();
    expect(screen.queryByText(/\d{11}/)).not.toBeInTheDocument();
  });

  it("lists the registered accounts with a way to remove each one", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    expect(await screen.findByText("Nubank")).toBeVisible();
    expect(screen.getByText("Conta corrente")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Remover conta Nubank" }),
    ).toBeVisible();
  });

  it("asks for confirmation before removing an account", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "Remover conta Nubank" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Remover “Nubank”?")).toBeVisible();
  });

  it("empties the account list with a clear explanation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(oauthOnly)));

    renderScreen();

    expect(await screen.findByText("Nenhuma conta cadastrada")).toBeVisible();
  });

  it("disables the password change for an OAuth-only account", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(oauthOnly)));

    renderScreen();

    expect(
      await screen.findByRole("button", { name: "Alterar" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/Você entra por google — esta conta não usa senha/),
    ).toBeVisible();
  });

  it("opens the profile dialog with the CPF field empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "Editar perfil" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("CPF")).toHaveValue("");
    expect(within(dialog).getByLabelText("CPF")).toHaveAttribute(
      "placeholder",
      "Salvo: ***.***.247-**",
    );
    // O e-mail é a identidade da conta: visível, mas não editável aqui.
    expect(within(dialog).getByLabelText("E-mail")).toBeDisabled();
  });

  it("requires typing ENCERRAR before the destructive action is enabled", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(settings)));

    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "Encerrar conta" }),
    );

    const dialog = await screen.findByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: "Encerrar conta",
    });
    expect(confirmButton).toBeDisabled();

    await userEvent.type(
      within(dialog).getByLabelText(/digite ENCERRAR/),
      "encerrar",
    );
    expect(confirmButton).toBeDisabled();

    await userEvent.clear(within(dialog).getByLabelText(/digite ENCERRAR/));
    await userEvent.type(
      within(dialog).getByLabelText(/digite ENCERRAR/),
      "ENCERRAR",
    );
    expect(confirmButton).toBeEnabled();
  });

  it("shows a retry action when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 })),
    );

    renderScreen();

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText("Não foi possível carregar sua conta"),
    ).toBeVisible();
    expect(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    ).toBeVisible();
  });
});
