import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
  });

  it("renders default variant and default size classes", () => {
    render(<Button>Salvar</Button>);

    const button = screen.getByRole("button", { name: /salvar/i });

    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-primary-foreground");
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("px-4");
    expect(button).toHaveClass("py-2");
  });

  it.each([
    ["destructive", "border-destructive"],
    ["soft", "bg-soft"],
    ["secondary", "border"],
    ["ghost", "hover:bg-muted"],
    ["link", "text-primary"],
  ] as const)("renders %s variant classes", (variant, expectedClass) => {
    render(<Button variant={variant}>Button</Button>);

    expect(screen.getByRole("button", { name: /button/i })).toHaveClass(
      expectedClass,
    );
  });

  it.each([
    ["sm", "h-9"],
    ["lg", "h-11"],
    ["icon", "size-10"],
  ] as const)("renders %s size classes", (size, expectedClass) => {
    render(<Button size={size}>Button</Button>);

    expect(screen.getByRole("button", { name: /button/i })).toHaveClass(
      expectedClass,
    );
  });

  it("supports custom className", () => {
    render(<Button className="custom-class">Salvar</Button>);

    expect(screen.getByRole("button", { name: /salvar/i })).toHaveClass(
      "custom-class",
    );
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Salvar</Button>);

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    );

    const button = screen.getByRole("button", { name: /salvar/i });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders loading state", () => {
    render(<Button loading>Salvar</Button>);

    const button = screen.getByRole("button", { name: /salvar/i });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading");
    expect(button.querySelector("svg")).toBeInTheDocument();
    expect(button.querySelector("svg")).toHaveClass("animate-spin");
  });

  it("does not call onClick while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );

    const button = screen.getByRole("button", { name: /salvar/i });

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("has focus-visible classes", () => {
    render(<Button>Salvar</Button>);

    const button = screen.getByRole("button", { name: /salvar/i });

    expect(button).toHaveClass("focus-visible:ring-2");
    expect(button).toHaveClass("focus-visible:ring-ring");
    expect(button).toHaveClass("focus-visible:ring-offset-2");
    expect(button).toHaveClass("focus-visible:outline-none");
  });

  it("receives focus via keyboard", async () => {
    const user = userEvent.setup();

    render(<Button>Salvar</Button>);

    await user.tab();

    expect(screen.getByRole("button", { name: /salvar/i })).toHaveFocus();
  });

  it("has hover classes for default variant", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: /salvar/i })).toHaveClass(
      "hover:bg-primary/90",
    );
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/dashboard">Ir para dashboard</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: /ir para dashboard/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveClass("bg-primary");
  });

  it("sets aria-disabled when asChild and loading", () => {
    render(
      <Button asChild loading>
        <a href="/dashboard">Ir para dashboard</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: /ir para dashboard/i });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("data-loading");
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  it("does not call onClick when asChild and loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button asChild loading onClick={onClick}>
        <a href="/dashboard">Ir para dashboard</a>
      </Button>,
    );

    await user.click(screen.getByRole("link", { name: /ir para dashboard/i }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
