import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineFeedback } from "./InlineFeedback";

describe("InlineFeedback", () => {
  it("renders error feedback as alert", () => {
    render(
      <InlineFeedback variant="error" message="Informe um valor válido." />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Informe um valor válido.",
    );
  });

  it("renders non-error feedback with polite live region", () => {
    render(<InlineFeedback variant="success" message="Salvo com sucesso." />);

    expect(
      screen.getByText("Salvo com sucesso.").parentElement,
    ).toHaveAttribute("aria-live", "polite");
  });
});
