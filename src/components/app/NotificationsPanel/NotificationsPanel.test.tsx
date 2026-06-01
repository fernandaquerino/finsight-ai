import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NotificationsPanel } from "./NotificationsPanel";

describe("NotificationsPanel", () => {
  it("opens the panel with title, unread badge, action, and notifications", async () => {
    const user = userEvent.setup();

    render(<NotificationsPanel />);

    await user.click(
      screen.getByRole("button", { name: "Notificações, 3 novas" }),
    );

    expect(screen.getByRole("heading", { name: "Notificações" })).toBeVisible();
    expect(screen.getByText("3 novas")).toBeVisible();
    expect(screen.getByRole("button", { name: "Marcar lidas" })).toBeEnabled();
    expect(screen.getByText("Novo insight disponível")).toBeVisible();
    expect(screen.getByText("Orçamento de Lazer estourado")).toBeVisible();
    expect(screen.getByText("Parcela do cartão em 3 dias")).toBeVisible();
    expect(screen.getByText("Meta de reserva avançou")).toBeVisible();
    expect(screen.getByText("Extrato importado")).toBeVisible();
    expect(screen.getAllByLabelText("Não lida")).toHaveLength(3);
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();

    render(<NotificationsPanel />);

    await user.click(
      screen.getByRole("button", { name: "Notificações, 3 novas" }),
    );
    await user.click(screen.getByRole("button", { name: "Marcar lidas" }));

    expect(screen.getByText("0 novas")).toBeVisible();
    expect(screen.queryByLabelText("Não lida")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar lidas" })).toBeDisabled();
  });
});
