import type { Meta, StoryObj } from "@storybook/react";

import { AIResponseFeedback } from "./AIResponseFeedback";

const meta = {
  title: "App/AI/AIResponseFeedback",
  component: AIResponseFeedback,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AIResponseFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCallback: Story = {
  args: {
    onFeedback: (value) => console.warn("Feedback:", value),
  },
};
