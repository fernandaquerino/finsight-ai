import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with default loading surface styles", () => {
    render(<Skeleton aria-label="Carregando saldo" />);

    const skeleton = document.querySelector("[data-slot='skeleton']");

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-label", "Carregando saldo");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
    expect(skeleton).toHaveClass("bg-muted");
  });

  it("supports custom className", () => {
    render(<Skeleton className="h-8 w-full" />);

    expect(document.querySelector("[data-slot='skeleton']")).toHaveClass(
      "h-8",
      "w-full",
    );
  });
});
