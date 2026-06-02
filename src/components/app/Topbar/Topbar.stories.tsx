import type { Meta, StoryObj } from "@storybook/react";

import { Topbar } from "./Topbar";

const meta = {
  title: "App/AppShell/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    title: { control: "text" },
  },
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  args: {
    title: "Dashboard",
    onMenuClick: () => {},
  },
};

export const Transactions: Story = {
  args: {
    title: "Transações",
    onMenuClick: () => {},
  },
};

export const AIChat: Story = {
  args: {
    title: "Chat IA",
    onMenuClick: () => {},
  },
};
