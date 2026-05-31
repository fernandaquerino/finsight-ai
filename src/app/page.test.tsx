import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the project foundation page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "FinSight AI",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Converse com seus dados financeiros com clareza e controle.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
