import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

describe("Select", () => {
  it("renders trigger with default size and styles", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Categoria">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Categoria" });

    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
    expect(trigger).toHaveClass("data-[size=default]:h-10");
    expect(trigger).toHaveClass("border-input");
    expect(trigger).toHaveClass("focus-visible:ring-2");
  });

  it("renders small trigger size classes", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Categoria" size="sm">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Categoria" });

    expect(trigger).toHaveAttribute("data-size", "sm");
    expect(trigger).toHaveClass("data-[size=sm]:h-9");
  });

  it("supports custom className on trigger", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Categoria" className="custom-trigger">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveClass("custom-trigger");
  });

  it("exports composition pieces with slot attributes", () => {
    render(
      <Select open>
        <SelectTrigger aria-label="Categoria">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tipo</SelectLabel>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectSeparator />
            <SelectItem value="income">Receita</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Tipo")).toHaveAttribute(
      "data-slot",
      "select-label",
    );
    expect(screen.getByRole("option", { name: "Despesa" })).toHaveAttribute(
      "data-slot",
      "select-item",
    );
    expect(document.querySelector("[data-slot='select-content']")).toBeTruthy();
    expect(
      document.querySelector("[data-slot='select-separator']"),
    ).toBeTruthy();
  });
});
