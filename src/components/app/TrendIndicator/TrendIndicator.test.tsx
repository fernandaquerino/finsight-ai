import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrendIndicator, formatTrendPercentage } from "./TrendIndicator";

describe("formatTrendPercentage", () => {
  it("formats positive, negative, and neutral percentages", () => {
    expect(formatTrendPercentage(4.2)).toBe("+4,2%");
    expect(formatTrendPercentage(-3.4)).toBe("-3,4%");
    expect(formatTrendPercentage(0)).toBe("0%");
  });
});

describe("TrendIndicator", () => {
  it("renders positive trend", () => {
    render(<TrendIndicator value={4.2} />);

    expect(screen.getByText("+4,2%").parentElement).toHaveClass("text-success");
  });

  it("renders negative trend", () => {
    render(<TrendIndicator value={-3.4} />);

    expect(screen.getByText("-3,4%").parentElement).toHaveClass("text-danger");
  });

  it("renders neutral trend with suffix", () => {
    render(<TrendIndicator value={0} suffix="pela IA" />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("pela IA")).toBeInTheDocument();
  });
});
