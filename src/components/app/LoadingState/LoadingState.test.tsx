import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders default skeleton content with aria-busy", () => {
    const { container } = render(<LoadingState label="Carregando dashboard" />);

    expect(screen.getByLabelText("Carregando dashboard")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      container.querySelectorAll("[data-slot='skeleton']").length,
    ).toBeGreaterThan(0);
  });

  it("renders contextual skeleton children", () => {
    render(
      <LoadingState>
        <Skeleton className="h-10 w-full" aria-label="Skeleton customizado" />
      </LoadingState>,
    );

    expect(screen.getByLabelText("Skeleton customizado")).toBeInTheDocument();
  });
});
