import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ChartCardSkeleton,
  MetricCardSkeleton,
  NotificationSkeleton,
  SidebarSkeleton,
  TransactionListSkeleton,
} from ".";

describe("contextual skeletons", () => {
  it("renders metric and chart skeletons as decorative shapes", () => {
    const { container } = render(
      <>
        <MetricCardSkeleton />
        <ChartCardSkeleton />
      </>,
    );

    expect(
      container.querySelectorAll("[data-slot='skeleton']").length,
    ).toBeGreaterThan(0);
  });

  it("renders transaction list skeleton with loading label", () => {
    render(<TransactionListSkeleton count={2} />);

    expect(
      screen.getByRole("list", { name: "Carregando transações" }),
    ).toHaveAttribute("aria-busy", "true");
  });

  it("renders notification skeleton with loading label", () => {
    render(<NotificationSkeleton count={2} />);

    expect(
      screen.getByRole("list", { name: "Carregando notificações" }),
    ).toHaveAttribute("aria-busy", "true");
  });

  it("renders sidebar skeleton", () => {
    const { container } = render(<SidebarSkeleton />);

    expect(container.querySelector("aside")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
