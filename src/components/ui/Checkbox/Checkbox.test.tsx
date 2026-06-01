import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders an accessible checkbox with aria-label", () => {
    render(<Checkbox aria-label="Recorrente" />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("renders with a visible label linked via htmlFor", () => {
    render(<Checkbox label="Recorrente" />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });
    const label = screen.getByText("Recorrente");

    expect(checkbox).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", checkbox.id);
  });

  it("renders checked state", () => {
    render(<Checkbox aria-label="Recorrente" defaultChecked />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(
      checkbox.querySelector("[data-slot='checkbox-indicator']"),
    ).toBeInTheDocument();
    expect(checkbox.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onCheckedChange when clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox aria-label="Recorrente" onCheckedChange={onCheckedChange} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Recorrente" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("can be clicked via the label", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox label="Recorrente" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByText("Recorrente"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("toggles with keyboard interaction", async () => {
    const user = userEvent.setup();

    render(<Checkbox aria-label="Recorrente" />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    await user.tab();
    expect(checkbox).toHaveFocus();

    await user.keyboard("[Space]");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("supports disabled state", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        aria-label="Recorrente"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("renders helper text linked via aria-describedby", () => {
    render(
      <Checkbox
        id="recurring"
        label="Recorrente"
        helperText="Repete todo mês."
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });
    const helper = screen.getByText("Repete todo mês.");

    expect(helper).toHaveAttribute("id", "recurring-helper");
    expect(checkbox).toHaveAttribute("aria-describedby", "recurring-helper");
  });

  it("renders error state with aria-invalid and alert", () => {
    render(
      <Checkbox
        id="terms"
        label="Aceitar termos"
        error="Você precisa aceitar os termos."
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Aceitar termos" });
    const error = screen.getByRole("alert");

    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", "terms-error");
    expect(error).toHaveAttribute("id", "terms-error");
    expect(error).toHaveTextContent("Você precisa aceitar os termos.");
  });

  it("prioritizes error over helper text", () => {
    render(
      <Checkbox
        id="terms"
        label="Aceitar termos"
        helperText="Leia os termos."
        error="Campo obrigatório."
      />,
    );

    expect(screen.queryByText("Leia os termos.")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório.");
  });

  it("supports custom className", () => {
    render(<Checkbox aria-label="Recorrente" className="custom-checkbox" />);

    expect(screen.getByRole("checkbox", { name: "Recorrente" })).toHaveClass(
      "custom-checkbox",
    );
  });

  it("has focus-visible classes", () => {
    render(<Checkbox aria-label="Recorrente" />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    expect(checkbox).toHaveClass("focus-visible:ring-2");
    expect(checkbox).toHaveClass("focus-visible:ring-ring");
    expect(checkbox).toHaveClass("focus-visible:ring-offset-2");
    expect(checkbox).toHaveClass("focus-visible:outline-none");
  });
});
