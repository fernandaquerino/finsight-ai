import type { Meta, StoryObj } from "@storybook/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Selecionar categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alimentacao">Alimentação</SelectItem>
        <SelectItem value="moradia">Moradia</SelectItem>
        <SelectItem value="transporte">Transporte</SelectItem>
        <SelectItem value="saude">Saúde</SelectItem>
        <SelectItem value="lazer">Lazer</SelectItem>
        <SelectItem value="outros">Outros</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Selecionar período" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>2025</SelectLabel>
          <SelectItem value="2025-06">Junho 2025</SelectItem>
          <SelectItem value="2025-05">Maio 2025</SelectItem>
          <SelectItem value="2025-04">Abril 2025</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>2024</SelectLabel>
          <SelectItem value="2024-12">Dezembro 2024</SelectItem>
          <SelectItem value="2024-11">Novembro 2024</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="moradia">
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alimentacao">Alimentação</SelectItem>
        <SelectItem value="moradia">Moradia</SelectItem>
        <SelectItem value="transporte">Transporte</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-44">
        <SelectValue placeholder="Categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alimentacao">Alimentação</SelectItem>
        <SelectItem value="moradia">Moradia</SelectItem>
        <SelectItem value="transporte">Transporte</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Desabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option">Opção</SelectItem>
      </SelectContent>
    </Select>
  ),
};
