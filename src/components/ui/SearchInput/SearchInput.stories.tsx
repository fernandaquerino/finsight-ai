import type { Meta, StoryObj } from "@storybook/react";

import { SearchInput } from "./SearchInput";

const meta = {
  title: "UI/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    placeholder: { control: "text" },
    showShortcut: { control: "boolean" },
    shortcutLabel: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: "w-72" },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Buscar por descrição ou categoria...",
    className: "w-80",
  },
};

export const WithoutShortcut: Story = {
  args: { showShortcut: false, className: "w-72" },
};

export const Disabled: Story = {
  args: { disabled: true, className: "w-72" },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    className: "w-72 cursor-pointer",
    placeholder: "Buscar ou usar ⌘K",
  },
};
