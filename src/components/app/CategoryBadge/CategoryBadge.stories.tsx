import type { Meta, StoryObj } from "@storybook/react";

import { CategoryBadge } from "./CategoryBadge";

const meta = {
  title: "App/CategoryBadge",
  component: CategoryBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { category: "outros" },
  argTypes: {
    category: { control: "text" },
  },
} satisfies Meta<typeof CategoryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alimentacao: Story = { args: { category: "alimentacao" } };
export const Moradia: Story = { args: { category: "moradia" } };
export const Transporte: Story = { args: { category: "transporte" } };
export const Saude: Story = { args: { category: "saude" } };
export const Lazer: Story = { args: { category: "lazer" } };
export const Assinaturas: Story = { args: { category: "assinaturas" } };
export const Outros: Story = { args: { category: "outros" } };

export const AllCategories: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        "alimentacao",
        "moradia",
        "transporte",
        "saude",
        "lazer",
        "assinaturas",
        "outros",
      ].map((cat) => (
        <CategoryBadge key={cat} category={cat} />
      ))}
    </div>
  ),
};
