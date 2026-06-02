import type { Meta, StoryObj } from "@storybook/react";

import { ErrorState } from "./ErrorState";

const meta = {
  title: "Feedback/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    retryLabel: { control: "text" },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRetry: Story = {
  args: { onRetry: () => alert("Tentando novamente...") },
};

export const CustomMessage: Story = {
  args: {
    title: "Falha ao carregar transações",
    description: "Verifique sua conexão e tente novamente.",
    onRetry: () => {},
    retryLabel: "Recarregar",
  },
};
