import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/Button";
import { EmptyList } from "./EmptyList";

describe("EmptyList", () => {
  it("renders title, description, and optional action", () => {
    render(
      <EmptyList
        title="Nenhum item"
        description="Adicione o primeiro item."
        action={<Button>Adicionar</Button>}
      />,
    );

    expect(screen.getByText("Nenhum item")).toBeInTheDocument();
    expect(screen.getByText("Adicione o primeiro item.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeVisible();
  });
});
