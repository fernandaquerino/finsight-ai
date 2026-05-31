import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrimitiveShowcase } from "@/components/app/PrimitiveShowcase";

describe("PrimitiveShowcase", () => {
  it("renders the shadcn primitives smoke test", () => {
    render(<PrimitiveShowcase />);

    expect(
      screen.getByRole("heading", { name: "Primitivos FinSight" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Conta" })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Categoria" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Recorrente" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Alertas" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Dialog" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drawer" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Resumo" })).toBeInTheDocument();
  });
});
