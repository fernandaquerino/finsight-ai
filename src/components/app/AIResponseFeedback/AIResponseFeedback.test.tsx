import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AIResponseFeedback } from "./AIResponseFeedback";

describe("AIResponseFeedback", () => {
  it("renders both feedback buttons", () => {
    render(<AIResponseFeedback />);
    expect(screen.getByRole("button", { name: "Útil" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Não útil" }),
    ).toBeInTheDocument();
  });

  it("calls onFeedback with 'helpful' when clicking útil", async () => {
    const onFeedback = vi.fn();
    render(<AIResponseFeedback onFeedback={onFeedback} />);
    await userEvent.click(screen.getByRole("button", { name: "Útil" }));
    expect(onFeedback).toHaveBeenCalledWith("helpful");
  });

  it("toggles off when clicking the same button twice", async () => {
    const onFeedback = vi.fn();
    render(<AIResponseFeedback onFeedback={onFeedback} />);
    const button = screen.getByRole("button", { name: "Útil" });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(onFeedback).toHaveBeenLastCalledWith(null);
  });

  it("has a group role for accessibility", () => {
    render(<AIResponseFeedback />);
    expect(
      screen.getByRole("group", { name: "Avaliação da resposta" }),
    ).toBeInTheDocument();
  });
});
