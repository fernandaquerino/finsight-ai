import type { Meta, StoryObj } from "@storybook/react";

import { UserMenu } from "./UserMenu";

const meta = {
  title: "App/AppShell/UserMenu",
  component: UserMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
