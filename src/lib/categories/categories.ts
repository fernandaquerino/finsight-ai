export type CategoryKey =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "saude"
  | "outros";

export type CategoryMeta = Readonly<{
  key: CategoryKey;
  label: string;
  color: string;
  dotClassName: string;
  badgeClassName: string;
}>;

export const categoryMap = {
  moradia: {
    key: "moradia",
    label: "Moradia",
    color: "#4845C8",
    dotClassName: "bg-[hsl(242,55%,53%)]",
    badgeClassName: "border-transparent bg-primary-soft text-primary",
  },
  alimentacao: {
    key: "alimentacao",
    label: "Alimentação",
    color: "#20A077",
    dotClassName: "bg-[hsl(161,67%,38%)]",
    badgeClassName: "border-transparent bg-success-soft text-success",
  },
  transporte: {
    key: "transporte",
    label: "Transporte",
    color: "#D95B4A",
    dotClassName: "bg-[hsl(7,65%,57%)]",
    badgeClassName: "border-transparent bg-danger-soft text-danger",
  },
  lazer: {
    key: "lazer",
    label: "Lazer",
    color: "#E88080",
    dotClassName: "bg-[hsl(0,69%,71%)]",
    badgeClassName: "border-transparent bg-danger-soft text-danger",
  },
  saude: {
    key: "saude",
    label: "Saúde",
    color: "#4592D0",
    dotClassName: "bg-[hsl(207,60%,54%)]",
    badgeClassName: "border-transparent bg-info-soft text-info",
  },
  outros: {
    key: "outros",
    label: "Outros",
    color: "#94A3B8",
    dotClassName: "bg-[hsl(215,16%,65%)]",
    badgeClassName: "border-transparent bg-muted text-muted-foreground",
  },
} as const satisfies Record<CategoryKey, CategoryMeta>;

const categoryAliases: Record<string, CategoryKey> = {
  alimentacao: "alimentacao",
  alimentação: "alimentacao",
  assinatura: "outros",
  assinaturas: "outros",
  moradia: "moradia",
  outro: "outros",
  outros: "outros",
  salario: "outros",
  salário: "outros",
  lazer: "lazer",
  saude: "saude",
  saúde: "saude",
  transporte: "transporte",
};

export function resolveCategoryKey(category: string): CategoryKey {
  return categoryAliases[category.trim().toLowerCase()] ?? "outros";
}

export function getCategoryMeta(category: string): CategoryMeta {
  return categoryMap[resolveCategoryKey(category)];
}
