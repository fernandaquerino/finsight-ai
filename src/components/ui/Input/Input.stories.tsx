import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Campo", className: "w-64" },
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "date"],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Valor", placeholder: "R$ 0,00" },
};

export const WithHelperText: Story = {
  args: {
    label: "E-mail",
    placeholder: "voce@email.com",
    helperText: "Será usado apenas para notificações.",
  },
};

export const WithPrefix: Story = {
  args: { label: "Valor", placeholder: "0,00", prefix: "R$" },
};

export const Disabled: Story = {
  args: { label: "Campo", placeholder: "Campo desabilitado", disabled: true },
};

export const Password: Story = {
  args: { label: "Senha", type: "password", placeholder: "••••••••" },
};

export const WithError: Story = {
  args: {
    label: "E-mail",
    type: "email",
    defaultValue: "invalido",
    error: "Informe um e-mail válido.",
  },
};
