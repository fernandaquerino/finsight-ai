import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the starter heading and documentation link", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "To get started, edit the page.tsx file.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/docs"),
    );
  });
});
