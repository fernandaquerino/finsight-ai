import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("renders an accessible text input with label", () => {
    render(<Input label="Descrição" placeholder="Digite algo..." />);

    const input = screen.getByRole("textbox", { name: "Descrição" });

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Digite algo...");
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("supports helper text through aria-describedby", () => {
    render(
      <Input
        id="description"
        label="Descrição"
        helperText="Texto de apoio opcional."
      />,
    );

    const input = screen.getByRole("textbox", { name: "Descrição" });
    const helper = screen.getByText("Texto de apoio opcional.");

    expect(helper).toHaveAttribute("id", "description-helper");
    expect(input).toHaveAttribute("aria-describedby", "description-helper");
  });

  it("renders required state with native required attribute", () => {
    render(<Input label="Obrigatório" required />);

    const input = screen.getByRole("textbox", { name: "Obrigatório" });

    expect(input).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders error state and links the error message", () => {
    render(
      <Input id="amount" label="Valor" error="Informe um valor válido." />,
    );

    const input = screen.getByRole("textbox", { name: "Valor" });
    const error = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "amount-error");
    expect(error).toHaveAttribute("id", "amount-error");
    expect(error).toHaveTextContent("Informe um valor válido.");
    expect(error.querySelector("svg")).toBeInTheDocument();
  });

  it("prioritizes error text over helper text", () => {
    render(
      <Input
        id="amount"
        label="Valor"
        helperText="Texto de apoio."
        error="Informe um valor válido."
      />,
    );

    expect(screen.queryByText("Texto de apoio.")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Valor" })).toHaveAttribute(
      "aria-describedby",
      "amount-error",
    );
  });

  it("renders prefix for monetary inputs", () => {
    render(<Input label="Valor monetário" prefix="R$" />);

    const input = screen.getByRole("textbox", { name: "Valor monetário" });

    expect(screen.getByText("R$")).toBeInTheDocument();
    expect(input).toHaveClass("pl-10");
  });

  it("supports disabled state", () => {
    render(<Input label="Descrição" disabled />);

    expect(screen.getByRole("textbox", { name: "Descrição" })).toBeDisabled();
  });

  it("supports custom className", () => {
    render(<Input label="Descrição" className="custom-class" />);

    expect(screen.getByRole("textbox", { name: "Descrição" })).toHaveClass(
      "custom-class",
    );
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();

    render(<Input label="Descrição" />);

    const input = screen.getByRole("textbox", { name: "Descrição" });

    await user.type(input, "Mercado");

    expect(input).toHaveValue("Mercado");
  });

  it("has focus-visible classes", () => {
    render(<Input label="Descrição" />);

    const input = screen.getByRole("textbox", { name: "Descrição" });

    expect(input).toHaveClass("focus-visible:border-ring");
    expect(input).toHaveClass("focus-visible:ring-2");
    expect(input).toHaveClass("focus-visible:ring-ring/25");
    expect(input).toHaveClass("focus-visible:outline-none");
  });
});
