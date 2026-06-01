import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, getInitials, getAvatarColor } from "./Avatar";

describe("getInitials", () => {
  it("returns first letter for a single word", () => {
    expect(getInitials("Marina")).toBe("M");
  });

  it("returns first and last initials for two words", () => {
    expect(getInitials("Marina Rocha")).toBe("MR");
  });

  it("returns first and last initials for multiple words", () => {
    expect(getInitials("Ana Paula de Souza")).toBe("AS");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  Marina  Rocha  ")).toBe("MR");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns uppercase initials", () => {
    expect(getInitials("marina rocha")).toBe("MR");
  });
});

describe("getAvatarColor", () => {
  it("returns a valid color class for any name", () => {
    const color = getAvatarColor("Marina Rocha");

    expect(color).toMatch(/^bg-\[hsl/);
  });

  it("returns the same color for the same name", () => {
    expect(getAvatarColor("Marina Rocha")).toBe(getAvatarColor("Marina Rocha"));
  });

  it("returns a fallback for empty string", () => {
    expect(getAvatarColor("")).toBeDefined();
  });
});

describe("Avatar", () => {
  it("renders with accessible role and label from name", () => {
    render(<Avatar name="Marina Rocha" />);

    expect(
      screen.getByRole("img", { name: "Marina Rocha" }),
    ).toBeInTheDocument();
  });

  it("renders initials derived from name", () => {
    render(<Avatar name="Marina Rocha" />);

    expect(screen.getByText("MR")).toBeInTheDocument();
  });

  it("renders single initial for one-word name", () => {
    render(<Avatar name="Marina" />);

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders ? for empty name", () => {
    render(<Avatar name="" />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("supports custom alt text", () => {
    render(<Avatar name="Marina Rocha" alt="Foto de perfil" />);

    expect(
      screen.getByRole("img", { name: "Foto de perfil" }),
    ).toBeInTheDocument();
  });

  it("renders image when src is provided", () => {
    render(<Avatar name="Marina Rocha" src="/avatar.jpg" />);

    const img = screen
      .getByRole("img", { name: "Marina Rocha" })
      .querySelector("img");

    expect(img).toBeInTheDocument();
    // next/image transforms the URL — verify the original path is present
    expect(img?.getAttribute("src")).toContain("avatar.jpg");
    expect(img).toHaveAttribute("aria-hidden", "true");
  });

  it("has correct data-slot attribute", () => {
    render(<Avatar name="Marina Rocha" />);

    expect(screen.getByRole("img")).toHaveAttribute("data-slot", "avatar");
  });

  it.each([
    ["sm", "size-7"],
    ["md", "size-9"],
    ["lg", "size-11"],
  ] as const)("renders %s size classes", (size, expectedClass) => {
    render(<Avatar name="Marina" size={size} />);

    expect(screen.getByRole("img")).toHaveClass(expectedClass);
  });

  it("supports custom className", () => {
    render(<Avatar name="Marina" className="custom-avatar" />);

    expect(screen.getByRole("img")).toHaveClass("custom-avatar");
  });
});
