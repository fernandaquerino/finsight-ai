import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ManualTransactionScreen, parseMoney } from "./ManualTransactionScreen";

describe("ManualTransactionScreen", () => {
  it("renders the manual transaction form and preview", () => {
    render(<ManualTransactionScreen />);

    expect(
      screen.getByRole("heading", { name: "Nova transação" }),
    ).toBeVisible();
    expect(screen.getByText("Pré-visualização")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Salvar transação" }),
    ).toBeDisabled();
  });

  it("updates the preview while typing", async () => {
    const user = userEvent.setup();

    render(<ManualTransactionScreen />);

    await user.type(
      screen.getByPlaceholderText("Ex.: Almoço com a equipe"),
      "Padaria São Jorge",
    );
    await user.type(screen.getByPlaceholderText("0,00"), "28,50");

    expect(screen.getByText("Padaria São Jorge")).toBeVisible();
    expect(screen.getByText("-R$ 28,50")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Salvar transação" }),
    ).toBeEnabled();
  });

  it("parses Brazilian money input", () => {
    expect(parseMoney("1.234,56")).toBe(1234.56);
  });
});
