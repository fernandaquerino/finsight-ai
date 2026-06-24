import type { Meta, StoryObj } from "@storybook/react";

import { UserMenuClient } from "./UserMenuClient";

const meta = {
  title: "App/AppShell/UserMenu",
  component: UserMenuClient,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof UserMenuClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: "Marina Rocha",
      email: "marina.rocha@email.com",
    },
  },
};
