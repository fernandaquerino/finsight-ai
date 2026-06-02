import type { Meta, StoryObj } from "@storybook/react";
import { SparklesIcon } from "lucide-react";

import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "success",
        "warning",
        "info",
        "ai",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Novo" } };
export const Secondary: Story = {
  args: { children: "Rascunho", variant: "secondary" },
};
export const Success: Story = {
  args: { children: "Aplicado", variant: "success" },
};
export const Warning: Story = {
  args: { children: "Atenção", variant: "warning" },
};
export const Destructive: Story = {
  args: { children: "Risco", variant: "destructive" },
};
export const Info: Story = {
  args: { children: "Informativo", variant: "info" },
};
export const Outline: Story = {
  args: { children: "Pendente", variant: "outline" },
};

export const AI: Story = {
  args: {
    children: (
      <>
        <SparklesIcon />
        IA
      </>
    ),
    variant: "ai",
  },
};

export const AllVariants: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Aplicado</Badge>
      <Badge variant="warning">Atenção</Badge>
      <Badge variant="destructive">Risco</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="ai">
        <SparklesIcon />
        IA
      </Badge>
    </div>
  ),
};
