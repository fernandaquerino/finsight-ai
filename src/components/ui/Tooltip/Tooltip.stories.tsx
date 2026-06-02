import type { Meta, StoryObj } from "@storybook/react";
import { InfoIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>Dica de contexto</TooltipContent>
    </Tooltip>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton aria-label="Configurações" variant="ghost">
          <SettingsIcon />
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>Configurações</TooltipContent>
    </Tooltip>
  ),
};

export const OnInfoIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground">Taxa de juros</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="size-3.5 cursor-help text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          Taxa mensal aplicada na estratégia de quitação avalanche.
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Sides: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex items-center justify-center gap-8 py-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};
