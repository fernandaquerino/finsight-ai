import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AIInput } from "./AIInput";

function renderInput(overrides = {}) {
  const props = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  return { ...render(<AIInput {...props} />), ...props };
}

describe("AIInput", () => {
  it("renders textarea with placeholder", () => {
    renderInput();
    expect(
      screen.getByRole("textbox", { name: "Digite sua pergunta" }),
    ).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const onChange = vi.fn();
    renderInput({ onChange });
    await userEvent.type(
      screen.getByRole("textbox", { name: "Digite sua pergunta" }),
      "Olá",
    );
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onSubmit when clicking send with non-empty value", async () => {
    const onSubmit = vi.fn();
    renderInput({ value: "Onde gastei mais?", onSubmit });
    await userEvent.click(
      screen.getByRole("button", { name: "Enviar pergunta" }),
    );
    expect(onSubmit).toHaveBeenCalledWith("Onde gastei mais?");
  });

  it("does not call onSubmit when value is empty", async () => {
    const onSubmit = vi.fn();
    renderInput({ value: "", onSubmit });
    const sendButton = screen.getByRole("button", { name: "Enviar pergunta" });
    expect(sendButton).toBeDisabled();
  });

  it("disables textarea and send button when disabled prop is true", () => {
    renderInput({ value: "Texto", disabled: true });
    expect(
      screen.getByRole("textbox", { name: "Digite sua pergunta" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Enviar pergunta" }),
    ).toBeDisabled();
  });

  it("disables send button when loading", () => {
    renderInput({ value: "Texto", loading: true });
    expect(
      screen.getByRole("button", { name: "Enviar pergunta" }),
    ).toBeDisabled();
  });

  it("submits on Enter key", async () => {
    const onSubmit = vi.fn();
    renderInput({ value: "Pergunta", onSubmit });
    await userEvent.click(
      screen.getByRole("textbox", { name: "Digite sua pergunta" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Pergunta");
  });

  it("does not submit on Shift+Enter", async () => {
    const onSubmit = vi.fn();
    renderInput({ value: "Pergunta", onSubmit });
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders disclaimer by default", () => {
    renderInput();
    expect(screen.getByText(/a ia pode cometer erros/i)).toBeInTheDocument();
  });

  it("hides disclaimer when showDisclaimer is false", () => {
    renderInput({ showDisclaimer: false });
    expect(
      screen.queryByText(/a ia pode cometer erros/i),
    ).not.toBeInTheDocument();
  });
});
