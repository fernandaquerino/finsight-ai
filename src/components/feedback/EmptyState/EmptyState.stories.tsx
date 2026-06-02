import type { Meta, StoryObj } from "@storybook/react";

import { EmptyState, emptyStatePresets } from "./EmptyState";

const meta = {
  title: "Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: Object.keys(emptyStatePresets),
    },
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Generic: Story = { args: { variant: "generic" } };
export const Dashboard: Story = { args: { variant: "dashboard" } };
export const Transactions: Story = { args: { variant: "transactions" } };
export const Chart: Story = { args: { variant: "chart" } };
export const Notifications: Story = { args: { variant: "notifications" } };
export const Insights: Story = { args: { variant: "insights" } };

export const WithPrimaryAction: Story = {
  args: {
    variant: "transactions",
    primaryAction: { label: "Adicionar transação", href: "/transactions/new" },
  },
};

export const WithBothActions: Story = {
  args: {
    variant: "dashboard",
    primaryAction: { label: "Importar extrato", href: "/imports" },
    secondaryAction: { label: "Lançamento manual", href: "/transactions/new" },
  },
};
