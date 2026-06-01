import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "./Sonner";

vi.mock("sonner", () => ({
  Toaster: ({
    toastOptions,
    ...props
  }: {
    "data-slot"?: string;
    position?: string;
    visibleToasts?: number;
    toastOptions?: {
      classNames?: Record<string, string>;
    };
  }) => (
    <div
      data-testid="sonner"
      data-slot={props["data-slot"]}
      data-position={props.position}
      data-visible-toasts={props.visibleToasts}
    >
      <span data-testid="toast-class">{toastOptions?.classNames?.toast}</span>
      <span data-testid="description-class">
        {toastOptions?.classNames?.description}
      </span>
      <span data-testid="action-class">
        {toastOptions?.classNames?.actionButton}
      </span>
      <span data-testid="cancel-class">
        {toastOptions?.classNames?.cancelButton}
      </span>
    </div>
  ),
}));

describe("Toaster", () => {
  it("renders sonner toaster with data slot", () => {
    render(<Toaster />);

    expect(screen.getByTestId("sonner")).toHaveAttribute("data-slot", "sonner");
  });

  it("forwards toaster props", () => {
    render(<Toaster position="bottom-right" visibleToasts={3} />);

    const toaster = screen.getByTestId("sonner");

    expect(toaster).toHaveAttribute("data-position", "bottom-right");
    expect(toaster).toHaveAttribute("data-visible-toasts", "3");
  });

  it("sets FinSight toast class names", () => {
    render(<Toaster />);

    expect(screen.getByTestId("toast-class")).toHaveTextContent(
      "border border-border bg-card text-card-foreground shadow-lg",
    );
    expect(screen.getByTestId("description-class")).toHaveTextContent(
      "text-muted-foreground",
    );
    expect(screen.getByTestId("action-class")).toHaveTextContent(
      "bg-primary text-primary-foreground",
    );
    expect(screen.getByTestId("cancel-class")).toHaveTextContent(
      "bg-muted text-muted-foreground",
    );
  });
});
