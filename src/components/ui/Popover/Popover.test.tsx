import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./Popover";

describe("Popover", () => {
  it("renders trigger and content when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Filtros</PopoverTrigger>
        <PopoverContent>Conteúdo do popover</PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Filtros")).toHaveAttribute(
      "data-slot",
      "popover-trigger",
    );
    expect(screen.getByText("Conteúdo do popover")).toHaveAttribute(
      "data-slot",
      "popover-content",
    );
  });

  it("uses default popover surface classes", () => {
    render(
      <Popover open>
        <PopoverTrigger>Filtros</PopoverTrigger>
        <PopoverContent>Conteúdo do popover</PopoverContent>
      </Popover>,
    );

    const content = screen.getByText("Conteúdo do popover");

    expect(content).toHaveClass("w-72");
    expect(content).toHaveClass("rounded-xl");
    expect(content).toHaveClass("border");
    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("shadow-md");
  });

  it("supports custom content className", () => {
    render(
      <Popover open>
        <PopoverTrigger>Filtros</PopoverTrigger>
        <PopoverContent className="custom-popover">
          Conteúdo do popover
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Conteúdo do popover")).toHaveClass(
      "custom-popover",
    );
  });

  it("exports anchor composition piece", () => {
    render(
      <Popover open>
        <PopoverAnchor>Âncora</PopoverAnchor>
        <PopoverContent>Conteúdo do popover</PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Âncora")).toHaveAttribute(
      "data-slot",
      "popover-anchor",
    );
  });
});
