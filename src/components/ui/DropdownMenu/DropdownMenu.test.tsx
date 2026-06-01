import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("renders trigger and content when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Ações")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-trigger",
    );
    expect(screen.getByRole("menu")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-content",
    );
    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item",
    );
  });

  it("uses default content styles and supports custom className", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-menu">
          <DropdownMenuItem>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const content = screen.getByRole("menu");

    expect(content).toHaveClass("min-w-40");
    expect(content).toHaveClass("rounded-lg");
    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("shadow-md");
    expect(content).toHaveClass("custom-menu");
  });

  it("renders item variants, inset and shortcut", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset variant="destructive">
            Excluir
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByRole("menuitem", { name: "Excluir ⌘D" });

    expect(item).toHaveAttribute("data-inset", "true");
    expect(item).toHaveAttribute("data-variant", "destructive");
    expect(item).toHaveClass("data-[variant=destructive]:text-destructive");
    expect(screen.getByText("⌘D")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-shortcut",
    );
  });

  it("calls onSelect when an item is selected", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Editar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("renders checkbox and radio items with checked state", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Preferências</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Mostrar arquivadas
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="month">
            <DropdownMenuRadioItem value="month">Mensal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="year">Anual</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const checkbox = screen.getByRole("menuitemcheckbox", {
      name: "Mostrar arquivadas",
    });
    const radio = screen.getByRole("menuitemradio", { name: "Mensal" });

    expect(checkbox).toHaveAttribute(
      "data-slot",
      "dropdown-menu-checkbox-item",
    );
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(radio).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("renders group, label, separator and submenu composition pieces", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Organização</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger inset>Mais opções</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Duplicar</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Organização")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label",
    );
    expect(screen.getByText("Organização")).toHaveAttribute(
      "data-inset",
      "true",
    );
    expect(screen.getByText("Mais opções")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-sub-trigger",
    );
    expect(
      document.querySelector("[data-slot='dropdown-menu-group']"),
    ).toBeTruthy();
    expect(
      document.querySelector("[data-slot='dropdown-menu-separator']"),
    ).toBeTruthy();
    expect(
      document.querySelector("[data-slot='dropdown-menu-sub-content']"),
    ).toBeTruthy();
  });
});
