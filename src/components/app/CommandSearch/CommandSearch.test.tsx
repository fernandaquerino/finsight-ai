import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CommandSearch } from "./CommandSearch";
import { appRoutes } from "@/routes/app-routes";

describe("CommandSearch", () => {
  it("requests opening from the keyboard shortcut", () => {
    const onOpenChange = vi.fn();

    render(<CommandSearch open={false} onOpenChange={onOpenChange} />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("renders command groups for transactions, pages, and AI", () => {
    render(<CommandSearch open onOpenChange={vi.fn()} />);

    expect(
      screen.getByRole("dialog", { name: "Busca de comandos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Busca de comandos" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Transações")[0]).toBeVisible();
    expect(screen.getByText("Páginas")).toBeVisible();
    expect(screen.getByText("IA")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Buscar transações/ }),
    ).toHaveAttribute("href", appRoutes.transactions);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      appRoutes.dashboard,
    );
    expect(
      screen.getByRole("link", { name: /Perguntar à IA/ }),
    ).toHaveAttribute("href", appRoutes.aiChat);
  });

  it("uses the query for transaction and AI actions", async () => {
    const user = userEvent.setup();

    render(<CommandSearch open onOpenChange={vi.fn()} />);

    await user.type(
      screen.getByRole("textbox", { name: "Busca de comandos" }),
      "mercado",
    );

    expect(
      screen.getByRole("link", { name: /Buscar "mercado" em transações/ }),
    ).toHaveAttribute("href", `${appRoutes.transactions}?q=mercado`);
    expect(
      screen.getByRole("link", { name: /Perguntar à IA sobre "mercado"/ }),
    ).toHaveAttribute("href", `${appRoutes.aiChat}?q=mercado`);
  });
});
