import type { Meta, StoryObj } from "@storybook/react";
import { PlusIcon, SearchIcon, SettingsIcon, TrashIcon } from "lucide-react";

import { IconButton } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    "aria-label": "Ação",
    children: <SettingsIcon />,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Adicionar", children: <PlusIcon /> },
};

export const Ghost: Story = {
  args: {
    "aria-label": "Configurações",
    variant: "ghost",
    children: <SettingsIcon />,
  },
};

export const Secondary: Story = {
  args: {
    "aria-label": "Buscar",
    variant: "secondary",
    children: <SearchIcon />,
  },
};

export const Destructive: Story = {
  args: {
    "aria-label": "Excluir",
    variant: "outline",
    children: <TrashIcon />,
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Desabilitado",
    disabled: true,
    children: <PlusIcon />,
  },
};

export const AllSizes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton aria-label="Pequeno" size="sm">
        <SettingsIcon />
      </IconButton>
      <IconButton aria-label="Médio" size="md">
        <SettingsIcon />
      </IconButton>
      <IconButton aria-label="Grande" size="lg">
        <SettingsIcon />
      </IconButton>
    </div>
  ),
};
