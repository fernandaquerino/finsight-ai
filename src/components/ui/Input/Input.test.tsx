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

  it("supports aria-label when a visible label is not rendered", () => {
    render(<Input aria-label="Pesquisar transações" />);

    expect(
      screen.getByRole("textbox", { name: "Pesquisar transações" }),
    ).toBeInTheDocument();
  });

  it("supports aria-labelledby when the label is external", () => {
    render(
      <>
        <span id="external-label">Categoria</span>
        <Input aria-labelledby="external-label" />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Categoria" })).toHaveAttribute(
      "aria-labelledby",
      "external-label",
    );
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

  it("uses the ui kit input sizing and surface styles", () => {
    render(<Input label="Descrição" />);

    const input = screen.getByRole("textbox", { name: "Descrição" });

    expect(input).toHaveClass("h-[38px]");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("px-3");
    expect(input).toHaveClass("py-0");
    expect(input).toHaveClass("text-[13.5px]");
    expect(input).toHaveClass("bg-card");
    expect(input).toHaveClass("text-foreground");
    expect(input).toHaveClass("border-border");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("outline-none");
    expect(input).toHaveClass("transition-[border-color,box-shadow]");
    expect(input).toHaveClass("duration-[140ms]");
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

    expect(input).toHaveClass("focus-visible:border-primary");
    expect(input).toHaveClass(
      "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)_/_0.12)]",
    );
  });
});
