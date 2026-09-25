import { createElement, type ComponentPropsWithoutRef } from "react";
import {
  CarIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HeartIcon,
  HouseIcon,
  LaptopIcon,
  PiggyBankIcon,
  PlaneIcon,
  ShieldIcon,
  type LucideIcon,
} from "lucide-react";

// Allowlist de ícones de meta. O validador do servidor usa as mesmas chaves —
// o cliente nunca consegue gravar um nome de ícone arbitrário.
export const goalIconMap = {
  "piggy-bank": PiggyBankIcon,
  shield: ShieldIcon,
  plane: PlaneIcon,
  laptop: LaptopIcon,
  house: HouseIcon,
  car: CarIcon,
  heart: HeartIcon,
  "graduation-cap": GraduationCapIcon,
  "credit-card": CreditCardIcon,
} as const satisfies Record<string, LucideIcon>;

export type GoalIconKey = keyof typeof goalIconMap;

export const goalIconKeys = Object.keys(goalIconMap) as GoalIconKey[];

export const goalIconLabels = {
  "piggy-bank": "Poupança",
  shield: "Reserva",
  plane: "Viagem",
  laptop: "Equipamento",
  house: "Moradia",
  car: "Veículo",
  heart: "Saúde",
  "graduation-cap": "Educação",
  "credit-card": "Quitar dívida",
} as const satisfies Record<GoalIconKey, string>;

export function isGoalIconKey(value: unknown): value is GoalIconKey {
  return typeof value === "string" && value in goalIconMap;
}

// Ícone desconhecido (vindo de uma linha antiga) cai no padrão em vez de quebrar
// a renderização.
export function resolveGoalIconKey(icon: string | null): GoalIconKey {
  return isGoalIconKey(icon) ? icon : "piggy-bank";
}

type GoalIconProps = ComponentPropsWithoutRef<LucideIcon> & {
  iconKey: GoalIconKey;
};

export function GoalIcon({ iconKey, ...props }: GoalIconProps) {
  return createElement(goalIconMap[iconKey] ?? PiggyBankIcon, props);
}
