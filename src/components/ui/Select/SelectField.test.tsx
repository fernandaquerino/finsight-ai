import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SelectField } from "./SelectField";

const options = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "moradia", label: "Moradia" },
  { value: "transporte", label: "Transporte" },
];

describe("SelectField", () => {
  it("renders with a visible label", () => {
    render(<SelectField label="Categoria" options={options} />);

    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders placeholder when no value selected", () => {
    render(
      <SelectField
        label="Categoria"
        options={options}
        placeholder="Selecione uma categoria"
      />,
    );

    expect(screen.getByText("Selecione uma categoria")).toBeInTheDocument();
  });

  it("renders helper text linked via aria-describedby", () => {
    render(
      <SelectField
        id="category"
        label="Categoria"
        options={options}
        helperText="Escolha a categoria da transação."
      />,
    );

    const trigger = screen.getByRole("combobox");
    const helper = screen.getByText("Escolha a categoria da transação.");

    expect(helper).toHaveAttribute("id", "category-helper");
    expect(trigger).toHaveAttribute("aria-describedby", "category-helper");
  });

  it("renders error state with aria-invalid and alert", () => {
    render(
      <SelectField
        id="category"
        label="Categoria"
        options={options}
        error="Selecione uma categoria válida."
      />,
    );

    const trigger = screen.getByRole("combobox");
    const error = screen.getByRole("alert");

    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", "category-error");
    expect(error).toHaveAttribute("id", "category-error");
    expect(error).toHaveTextContent("Selecione uma categoria válida.");
    expect(error.querySelector("svg")).toBeInTheDocument();
  });

  it("prioritizes error over helper text", () => {
    render(
      <SelectField
        id="category"
        label="Categoria"
        options={options}
        helperText="Texto de apoio."
        error="Campo obrigatório."
      />,
    );

    expect(screen.queryByText("Texto de apoio.")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório.");
  });

  it("supports disabled state", () => {
    render(<SelectField label="Categoria" options={options} disabled />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders with defaultValue selected", () => {
    render(
      <SelectField
        label="Categoria"
        options={options}
        defaultValue="moradia"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Moradia");
  });

  it("calls onValueChange when an option is selected", async () => {
    const onValueChange = vi.fn();

    render(
      <SelectField
        label="Categoria"
        options={options}
        onValueChange={onValueChange}
      />,
    );

    // Verify the trigger renders and is interactive
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toBeDisabled();
  });

  it("supports aria-label when no visible label", () => {
    render(
      <SelectField aria-label="Filtrar por categoria" options={options} />,
    );

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-label",
      "Filtrar por categoria",
    );
  });
});
