import type { Meta, StoryObj } from "@storybook/react";

import { NotificationsPanel } from "./NotificationsPanel";

const meta = {
  title: "App/AppShell/NotificationsPanel",
  component: NotificationsPanel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof NotificationsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
