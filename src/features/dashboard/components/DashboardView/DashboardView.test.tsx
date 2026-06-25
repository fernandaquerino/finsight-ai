import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "./DashboardView";

// Recharts (ResponsiveContainer) precisa de ResizeObserver em jsdom.
beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("DashboardView", () => {
  // Regressão: o mês exibido deve vir do snapshot do servidor (initialDate),
  // nunca de new Date() no render — senão volta o hydration mismatch.
  it("derives the month from the server-provided initialDate, not from the clock", () => {
    render(<DashboardView initialDate="2026-01-15" />);

    expect(
      screen.getByText("Aqui está como Janeiro está indo até agora"),
    ).toBeInTheDocument();
  });
});
