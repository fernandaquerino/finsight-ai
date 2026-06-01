import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders as decorative (role=none) by default", () => {
    render(<Divider />);

    const divider = document.querySelector("[data-slot='divider']");

    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("role", "none");
  });

  it("renders horizontal orientation by default", () => {
    render(<Divider />);

    const divider = document.querySelector("[data-slot='divider']");

    expect(divider).toHaveAttribute("data-orientation", "horizontal");
    expect(divider).toHaveClass("h-px");
    expect(divider).toHaveClass("w-full");
  });

  it("renders vertical orientation", () => {
    render(<Divider orientation="vertical" />);

    const divider = document.querySelector("[data-slot='divider']");

    expect(divider).toHaveAttribute("data-orientation", "vertical");
    expect(divider).toHaveClass("h-full");
    expect(divider).toHaveClass("w-px");
  });

  it("renders as semantic separator when decorative is false", () => {
    render(<Divider decorative={false} />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("sets aria-orientation on semantic separator", () => {
    render(<Divider orientation="vertical" decorative={false} />);

    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("supports custom className", () => {
    render(<Divider className="my-4" />);

    expect(document.querySelector("[data-slot='divider']")).toHaveClass("my-4");
  });
});
