import type { Meta, StoryObj } from "@storybook/react";

import { AIButton } from "./AIButton";

const meta = {
  title: "App/AI/AIButton",
  component: AIButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    href: { control: "text" },
    label: { control: "text" },
  },
} satisfies Meta<typeof AIButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "/ai-chat" },
};

export const CustomLabel: Story = {
  args: { href: "/ai-chat", label: "Chat IA" },
};
