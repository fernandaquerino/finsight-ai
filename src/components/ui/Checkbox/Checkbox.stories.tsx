import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./Checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Aceito os termos de uso" },
};

export const Checked: Story = {
  args: { label: "Notificações ativas", defaultChecked: true },
};

export const WithHelperText: Story = {
  args: {
    label: "Incluir transações recorrentes",
    helperText: "Assinaturas e pagamentos automáticos serão considerados.",
  },
};

export const WithError: Story = {
  args: {
    label: "Confirmo que os dados estão corretos",
    error: "Você precisa confirmar antes de continuar.",
  },
};

export const Disabled: Story = {
  args: { label: "Opção indisponível", disabled: true },
};

export const DisabledChecked: Story = {
  args: {
    label: "Configuração do sistema",
    disabled: true,
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  args: { "aria-label": "Selecionar item" },
};

export const CheckboxGroup: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">
        Categorias para importar
      </legend>
      <Checkbox label="Alimentação" defaultChecked />
      <Checkbox label="Moradia" defaultChecked />
      <Checkbox label="Transporte" />
      <Checkbox label="Lazer" />
      <Checkbox label="Saúde" defaultChecked />
    </fieldset>
  ),
};
