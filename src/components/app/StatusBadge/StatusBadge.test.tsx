import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge, type StatusBadgeVariant } from "./StatusBadge";

const variants: StatusBadgeVariant[] = [
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
  "ai",
];

describe("StatusBadge", () => {
  it.each(variants)("renders %s variant", (variant) => {
    render(<StatusBadge variant={variant}>{variant}</StatusBadge>);

    expect(screen.getByText(variant)).toHaveAttribute("data-slot", "badge");
  });
});
