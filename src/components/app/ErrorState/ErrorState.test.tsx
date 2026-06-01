import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders calm message and retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState description="A conexão oscilou." onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("A conexão oscilou.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders secondary action", () => {
    render(
      <ErrorState
        secondaryAction={<Button variant="secondary">Ver status</Button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Ver status" })).toBeVisible();
  });
});
