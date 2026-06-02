import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "./Avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    name: "Maria Rodrigues",
  },
  argTypes: {
    name: { control: "text" },
    src: { control: "text" },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitials: Story = {};

export const SmallSize: Story = {
  args: { name: "João Silva", size: "sm" },
};

export const LargeSize: Story = {
  args: { name: "Ana Lima", size: "lg" },
};

export const WithImage: Story = {
  args: {
    src: "https://github.com/shadcn.png",
    alt: "Maria Rodrigues",
  },
};

export const AllSizes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Ana Lima" size="sm" />
      <Avatar name="Ana Lima" size="md" />
      <Avatar name="Ana Lima" size="lg" />
    </div>
  ),
};

export const ColorVariety: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex items-center gap-3">
      {[
        "Ana Lima",
        "Bruno Costa",
        "Carla Dias",
        "Diego Faria",
        "Elena Mota",
      ].map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
};
