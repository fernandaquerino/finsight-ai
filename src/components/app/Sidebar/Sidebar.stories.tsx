import type { Meta, StoryObj } from "@storybook/react";

import { Sidebar } from "./Sidebar";

const meta = {
  title: "App/AppShell/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    isCollapsed: { control: "boolean" },
    pathname: { control: "text" },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    pathname: "/",
    isCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    pathname: "/",
    isCollapsed: true,
  },
};

export const ActiveTransactions: Story = {
  args: {
    pathname: "/transactions",
    isCollapsed: false,
  },
};

export const ActiveInsights: Story = {
  args: {
    pathname: "/insights",
    isCollapsed: false,
  },
};

export const CollapsedWithActive: Story = {
  args: {
    pathname: "/ai-chat",
    isCollapsed: true,
  },
};
