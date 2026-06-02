import type { Meta, StoryObj } from "@storybook/react";

import { AIThinkingState } from "./AIThinkingState";

const meta = {
  title: "App/AI/AIThinkingState",
  component: AIThinkingState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    message: { control: "text" },
  },
} satisfies Meta<typeof AIThinkingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: { message: "Buscando transações relevantes..." },
};
