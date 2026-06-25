import { createElement, type ComponentPropsWithoutRef } from "react";
import {
  Banknote,
  Car,
  ChefHat,
  CircleEllipsis,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  PawPrint,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import type { CategoryKey } from "./categories";

export const categoryIconMap = {
  educacao: GraduationCap,
  lazer: Gamepad2,
  transporte: Car,
  moradia: Home,
  compras: ShoppingBag,
  assinaturas: ReceiptText,
  alimentacao: Utensils,
  restaurantes: ChefHat,
  salario: Banknote,
  outros: CircleEllipsis,
  pets: PawPrint,
  mercado: ShoppingCart,
  saude: HeartPulse,
} as const satisfies Record<CategoryKey, LucideIcon>;

export function getCategoryIcon(categoryKey: CategoryKey): LucideIcon {
  return categoryIconMap[categoryKey] ?? CircleEllipsis;
}

type CategoryIconProps = ComponentPropsWithoutRef<LucideIcon> & {
  categoryKey: CategoryKey;
};

export function CategoryIcon({ categoryKey, ...props }: CategoryIconProps) {
  const Icon = categoryIconMap[categoryKey] ?? CircleEllipsis;

  return createElement(Icon, props);
}
