import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip";

describe("Tooltip", () => {
  it("renders trigger and content when open", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Ajuda</TooltipTrigger>
        <TooltipContent>Detalhes do campo</TooltipContent>
      </Tooltip>,
    );

    expect(screen.getByText("Ajuda")).toHaveAttribute(
      "data-slot",
      "tooltip-trigger",
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Detalhes do campo");
    expect(
      document.querySelector("[data-slot='tooltip-content']"),
    ).toHaveAttribute("data-slot", "tooltip-content");
  });

  it("supports custom content className", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Ajuda</TooltipTrigger>
        <TooltipContent className="custom-tooltip">
          Detalhes do campo
        </TooltipContent>
      </Tooltip>,
    );

    const content = document.querySelector("[data-slot='tooltip-content']");

    expect(content).toHaveClass("custom-tooltip");
    expect(content).toHaveClass("bg-popover");
  });

  it("allows using TooltipProvider directly", () => {
    render(
      <TooltipProvider delayDuration={100}>
        <Tooltip open>
          <TooltipTrigger>Ajuda</TooltipTrigger>
          <TooltipContent>Detalhes do campo</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
