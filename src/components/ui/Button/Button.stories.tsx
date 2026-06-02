import type { Meta, StoryObj } from "@storybook/react";
import { PlusIcon } from "lucide-react";

import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "secondary",
        "soft",
        "ghost",
        "link",
        "outline",
        "ai",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Continuar" },
};

export const Secondary: Story = {
  args: { children: "Cancelar", variant: "secondary" },
};

export const Soft: Story = {
  args: { children: "Saiba mais", variant: "soft" },
};

export const Ghost: Story = {
  args: { children: "Descartar", variant: "ghost" },
};

export const Outline: Story = {
  args: { children: "Ver detalhes", variant: "outline" },
};

export const Destructive: Story = {
  args: { children: "Excluir transação", variant: "destructive" },
};

export const AI: Story = {
  args: { children: "Perguntar à IA", variant: "ai" },
};

export const Loading: Story = {
  args: { children: "Salvando", loading: true },
};

export const Disabled: Story = {
  args: { children: "Indisponível", disabled: true },
};

export const SmallSize: Story = {
  args: { children: "Adicionar", size: "sm" },
};

export const LargeSize: Story = {
  args: { children: "Criar conta", size: "lg" },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon />
        Nova transação
      </>
    ),
  },
};

export const AllVariants: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button variant="ai">AI</Button>
    </div>
  ),
};
