import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BellIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders with required aria-label", () => {
    render(
      <IconButton aria-label="Notificações">
        <BellIcon />
      </IconButton>,
    );

    expect(
      screen.getByRole("button", { name: "Notificações" }),
    ).toBeInTheDocument();
  });

  it("defaults to ghost variant", () => {
    render(
      <IconButton aria-label="Notificações">
        <BellIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button")).toHaveClass("hover:bg-muted");
  });

  it.each([
    ["default", "bg-primary"],
    ["secondary", "border"],
    ["ghost", "hover:bg-muted"],
    ["outline", "border-primary"],
  ] as const)("renders %s variant classes", (variant, expectedClass) => {
    render(
      <IconButton aria-label="Ação" variant={variant}>
        <BellIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Ação" })).toHaveClass(
      expectedClass,
    );
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-9"],
    ["lg", "size-10"],
  ] as const)("renders %s size classes", (size, expectedClass) => {
    render(
      <IconButton aria-label="Ação" size={size}>
        <BellIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Ação" })).toHaveClass(
      expectedClass,
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Notificações" onClick={onClick}>
        <BellIcon />
      </IconButton>,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton aria-label="Notificações" disabled onClick={onClick}>
        <BellIcon />
      </IconButton>,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("receives focus via keyboard", async () => {
    const user = userEvent.setup();

    render(
      <IconButton aria-label="Notificações">
        <BellIcon />
      </IconButton>,
    );

    await user.tab();

    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("has focus-visible classes", () => {
    render(
      <IconButton aria-label="Notificações">
        <BellIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button")).toHaveClass("focus-visible:ring-2");
    expect(screen.getByRole("button")).toHaveClass("focus-visible:ring-ring");
    expect(screen.getByRole("button")).toHaveClass(
      "focus-visible:ring-offset-2",
    );
  });

  it("renders as child element when asChild is true", () => {
    render(
      <IconButton aria-label="Início" asChild>
        <a href="/dashboard">
          <BellIcon />
        </a>
      </IconButton>,
    );

    const link = screen.getByRole("link", { name: "Início" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("has correct data-slot attribute", () => {
    render(
      <IconButton aria-label="Notificações">
        <BellIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button")).toHaveAttribute(
      "data-slot",
      "icon-button",
    );
  });
});
