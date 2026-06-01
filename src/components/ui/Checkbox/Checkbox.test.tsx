import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders an accessible checkbox", () => {
    render(<Checkbox aria-label="Recorrente" />);

    const checkbox = screen.getByRole("checkbox", { name: "Recorrente" });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
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
