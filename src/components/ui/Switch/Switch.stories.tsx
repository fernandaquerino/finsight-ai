import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "./Switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Ativar notificações" },
};

export const Checked: Story = {
  args: { "aria-label": "Notificações ativas", defaultChecked: true },
};

export const Disabled: Story = {
  args: { "aria-label": "Opção indisponível", disabled: true },
};

export const DisabledChecked: Story = {
  args: {
    "aria-label": "Configuração ativa",
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-72 items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          Notificações de IA
        </p>
        <p className="text-xs text-muted-foreground">
          Receber insights automáticos semanais.
        </p>
      </div>
      <Switch aria-label="Notificações de IA" defaultChecked />
    </div>
  ),
};

export const SettingsList: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="w-80 divide-y divide-border rounded-lg border">
      {[
        {
          label: "Insights de IA",
          description: "Análises automáticas",
          on: true,
        },
        {
          label: "Alertas de orçamento",
          description: "Ao estourar limite",
          on: true,
        },
        { label: "Vencimentos", description: "3 dias antes", on: false },
        {
          label: "Resumo semanal",
          description: "Toda segunda-feira",
          on: false,
        },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
          <Switch aria-label={item.label} defaultChecked={item.on} />
        </div>
      ))}
    </div>
  ),
};
