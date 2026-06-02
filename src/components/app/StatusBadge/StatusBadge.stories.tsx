import type { Meta, StoryObj } from "@storybook/react";

import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "App/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Badge" },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "danger", "info", "neutral", "ai"],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { children: "Aplicado", variant: "success" },
};
export const Warning: Story = {
  args: { children: "Atenção", variant: "warning" },
};
export const Danger: Story = { args: { children: "Risco", variant: "danger" } };
export const Info: Story = {
  args: { children: "Informativo", variant: "info" },
};
export const Neutral: Story = {
  args: { children: "Novo", variant: "neutral" },
};
export const AI: Story = { args: { children: "Análise IA", variant: "ai" } };

export const AllVariants: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge variant="success">Aplicado</StatusBadge>
      <StatusBadge variant="warning">Atenção</StatusBadge>
      <StatusBadge variant="danger">Risco</StatusBadge>
      <StatusBadge variant="info">Informativo</StatusBadge>
      <StatusBadge variant="neutral">Novo</StatusBadge>
      <StatusBadge variant="ai">Análise IA</StatusBadge>
    </div>
  ),
};
