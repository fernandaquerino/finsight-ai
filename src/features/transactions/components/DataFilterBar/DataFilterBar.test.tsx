import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataFilterBar } from "./DataFilterBar";

describe("DataFilterBar", () => {
  it("applies the kind chips", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(<DataFilterBar filters={{}} onFiltersChange={onFiltersChange} />);

    await user.click(screen.getByRole("button", { name: "Despesas" }));

    expect(onFiltersChange).toHaveBeenCalledWith({ kind: "expense" });
  });

  it("toggles category chips while preserving current filters", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <DataFilterBar
        filters={{ kind: "expense" }}
        categoryOptions={[
          { value: "cat-1", label: "Alimentação", color: "#20a077" },
        ]}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Alimentação/ }));

    expect(onFiltersChange).toHaveBeenCalledWith({
      kind: "expense",
      categoryId: "cat-1",
    });
  });

  it("clears active filters from the all chip", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <DataFilterBar
        filters={{ kind: "expense", categoryId: "cat-1" }}
        categoryOptions={[
          { value: "cat-1", label: "Alimentação", color: "#20a077" },
        ]}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Todas" }));

    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it("filters by origin via the Extrato and Manual chips", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(<DataFilterBar filters={{}} onFiltersChange={onFiltersChange} />);

    await user.click(screen.getByRole("button", { name: "Extrato" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ origin: "import" });

    await user.click(screen.getByRole("button", { name: "Manual" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ origin: "manual" });
  });

  it("toggles the origin chip off when already active", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    render(
      <DataFilterBar
        filters={{ origin: "manual" }}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Manual" }));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });
});
