import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MonthYearPicker } from "./MonthYearPicker";

// June 2025 — month index 5
const JUNE_2025 = new Date(2025, 5, 1);

function setup(value = JUNE_2025, onChange = vi.fn()) {
  const user = userEvent.setup();
  render(<MonthYearPicker value={value} onChange={onChange} />);

  const trigger = screen.getByRole("button", { name: "Junho de 2025" });

  return { user, trigger, onChange };
}

async function openPicker(value = JUNE_2025, onChange = vi.fn()) {
  const result = setup(value, onChange);
  await result.user.click(result.trigger);
  return result;
}

describe("MonthYearPicker — trigger", () => {
  it("renders the formatted month and year on the trigger button", () => {
    const { trigger } = setup();
    expect(trigger).toBeInTheDocument();
  });

  it("sets aria-expanded to true when the popover opens", async () => {
    const { user, trigger } = setup();

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});

describe("MonthYearPicker — popover content", () => {
  it("shows all 12 months and the view year after opening", async () => {
    await openPicker();

    expect(
      screen.getByRole("grid", { name: "Selecionar mês" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();

    for (const month of [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ]) {
      expect(screen.getByRole("gridcell", { name: month })).toBeInTheDocument();
    }
  });

  it("marks the currently selected month as aria-selected", async () => {
    await openPicker();

    expect(screen.getByRole("gridcell", { name: "Jun" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("gridcell", { name: "Jan" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("does not mark any month as selected when the view year differs from the selected year", async () => {
    const { user } = await openPicker();

    await user.click(screen.getByRole("button", { name: "Próximo ano" }));

    for (const month of ["Jan", "Jun", "Dez"]) {
      expect(screen.getByRole("gridcell", { name: month })).toHaveAttribute(
        "aria-selected",
        "false",
      );
    }
  });
});

describe("MonthYearPicker — selection", () => {
  it("calls onChange with the correct date when a month is clicked", async () => {
    const { user, onChange } = await openPicker();

    await user.click(screen.getByRole("gridcell", { name: "Mar" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2025, 2, 1));
  });

  it("closes the popover after a month is selected", async () => {
    const { user, trigger } = await openPicker();

    await user.click(screen.getByRole("gridcell", { name: "Mar" }));

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("MonthYearPicker — year navigation", () => {
  it("increments the view year when 'Próximo ano' is clicked", async () => {
    const { user } = await openPicker();

    await user.click(screen.getByRole("button", { name: "Próximo ano" }));

    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("decrements the view year when 'Ano anterior' is clicked", async () => {
    const { user } = await openPicker();

    await user.click(screen.getByRole("button", { name: "Ano anterior" }));

    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("resets the view year to the selected year when the popover reopens", async () => {
    const { user, trigger } = await openPicker();

    await user.click(screen.getByRole("button", { name: "Próximo ano" }));
    expect(screen.getByText("2026")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(trigger);

    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  it("calls onChange with the navigated year, not the original one", async () => {
    const { user, onChange } = await openPicker();

    await user.click(screen.getByRole("button", { name: "Próximo ano" }));
    await user.click(screen.getByRole("gridcell", { name: "Jan" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 0, 1));
  });
});
