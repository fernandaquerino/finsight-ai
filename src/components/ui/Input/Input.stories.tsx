import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./Input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
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
  args: { placeholder: "R$ 0,00", className: "w-64" },
};

export const WithLabel: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-64 flex-col gap-1.5">
      <label htmlFor="amount" className="text-sm font-medium text-foreground">
        Valor
      </label>
      <Input id="amount" placeholder="R$ 0,00" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
    className: "w-64",
  },
};

export const Password: Story = {
  args: { type: "password", placeholder: "••••••••", className: "w-64" },
};

export const WithError: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-64 flex-col gap-1.5">
      <label htmlFor="email" className="text-sm font-medium text-foreground">
        E-mail
      </label>
      <Input
        id="email"
        type="email"
        defaultValue="invalido"
        aria-invalid="true"
        aria-describedby="email-error"
        className="border-danger focus-visible:ring-danger/20"
      />
      <p id="email-error" className="text-xs text-danger">
        Informe um e-mail válido.
      </p>
    </div>
  ),
};
