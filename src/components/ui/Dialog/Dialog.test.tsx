import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

describe("Dialog", () => {
  it("renders trigger and open dialog content", () => {
    render(
      <Dialog open>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova transação</DialogTitle>
            <DialogDescription>Preencha os dados.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Abrir")).toHaveAttribute(
      "data-slot",
      "dialog-trigger",
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "data-slot",
      "dialog-content",
    );
    expect(screen.getByText("Nova transação")).toHaveAttribute(
      "data-slot",
      "dialog-title",
    );
    expect(screen.getByText("Preencha os dados.")).toHaveAttribute(
      "data-slot",
      "dialog-description",
    );
    expect(document.querySelector("[data-slot='dialog-overlay']")).toBeTruthy();
  });

  it("uses default content styles and supports custom className", () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog">
          <DialogTitle>Nova transação</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("max-w-lg");
    expect(dialog).toHaveClass("rounded-xl");
    expect(dialog).toHaveClass("bg-card");
    expect(dialog).toHaveClass("custom-dialog");
  });

  it("renders header and footer composition slots", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>Cabeçalho</DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
          <DialogFooter>Rodapé</DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Cabeçalho")).toHaveAttribute(
      "data-slot",
      "dialog-header",
    );
    expect(screen.getByText("Rodapé")).toHaveAttribute(
      "data-slot",
      "dialog-footer",
    );
  });

  it("renders default close button and calls onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("can hide default close button and use custom close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Nova transação</DialogTitle>
          <DialogClose>Cancelar</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
