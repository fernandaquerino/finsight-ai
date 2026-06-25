export type CategoryKind = "expense" | "income";

export type CategoryKey =
  | "educacao"
  | "lazer"
  | "transporte"
  | "moradia"
  | "compras"
  | "assinaturas"
  | "alimentacao"
  | "restaurantes"
  | "salario"
  | "outros"
  | "pets"
  | "mercado"
  | "saude";

export type CategoryMeta = Readonly<{
  key: CategoryKey;
  label: string;
  color: string;
  kind: CategoryKind;
  dotClassName: string;
  badgeClassName: string;
}>;

export const categoryMap = {
  educacao: {
    key: "educacao",
    label: "Educação",
    color: "#14B8A6",
    kind: "expense",
    dotClassName: "bg-[hsl(173,80%,40%)]",
    badgeClassName: "border-transparent bg-teal-500/10 text-teal-500",
  },
  lazer: {
    key: "lazer",
    label: "Lazer",
    color: "#22C55E",
    kind: "expense",
    dotClassName: "bg-[hsl(142,71%,45%)]",
    badgeClassName: "border-transparent bg-green-500/10 text-green-500",
  },
  transporte: {
    key: "transporte",
    label: "Transporte",
    color: "#8B5CF6",
    kind: "expense",
    dotClassName: "bg-[hsl(258,90%,66%)]",
    badgeClassName: "border-transparent bg-violet-500/10 text-violet-500",
  },
  moradia: {
    key: "moradia",
    label: "Moradia",
    color: "#3B82F6",
    kind: "expense",
    dotClassName: "bg-[hsl(217,91%,60%)]",
    badgeClassName: "border-transparent bg-blue-500/10 text-blue-500",
  },
  compras: {
    key: "compras",
    label: "Compras",
    color: "#EF4444",
    kind: "expense",
    dotClassName: "bg-[hsl(0,84%,60%)]",
    badgeClassName: "border-transparent bg-red-500/10 text-red-500",
  },
  assinaturas: {
    key: "assinaturas",
    label: "Assinaturas",
    color: "#EC4899",
    kind: "expense",
    dotClassName: "bg-[hsl(328,85%,60%)]",
    badgeClassName: "border-transparent bg-pink-500/10 text-pink-500",
  },
  alimentacao: {
    key: "alimentacao",
    label: "Alimentação",
    color: "#F59E0B",
    kind: "expense",
    dotClassName: "bg-[hsl(38,92%,50%)]",
    badgeClassName: "border-transparent bg-amber-500/10 text-amber-500",
  },
  restaurantes: {
    key: "restaurantes",
    label: "Restaurantes",
    color: "#EF4444",
    kind: "expense",
    dotClassName: "bg-[hsl(0,84%,60%)]",
    badgeClassName: "border-transparent bg-red-500/10 text-red-500",
  },
  salario: {
    key: "salario",
    label: "Salário",
    color: "#16A34A",
    kind: "income",
    dotClassName: "bg-[hsl(142,72%,35%)]",
    badgeClassName: "border-transparent bg-emerald-500/10 text-emerald-500",
  },
  outros: {
    key: "outros",
    label: "Outros",
    color: "#94A3B8",
    kind: "expense",
    dotClassName: "bg-[hsl(215,16%,65%)]",
    badgeClassName: "border-transparent bg-muted text-muted-foreground",
  },
  pets: {
    key: "pets",
    label: "Pets",
    color: "#F97316",
    kind: "expense",
    dotClassName: "bg-[hsl(25,95%,53%)]",
    badgeClassName: "border-transparent bg-orange-500/10 text-orange-500",
  },
  mercado: {
    key: "mercado",
    label: "Mercado",
    color: "#F59E0B",
    kind: "expense",
    dotClassName: "bg-[hsl(38,92%,50%)]",
    badgeClassName: "border-transparent bg-amber-500/10 text-amber-500",
  },
  saude: {
    key: "saude",
    label: "Saúde",
    color: "#06B6D4",
    kind: "expense",
    dotClassName: "bg-[hsl(188,94%,43%)]",
    badgeClassName: "border-transparent bg-cyan-500/10 text-cyan-500",
  },
} as const satisfies Record<CategoryKey, CategoryMeta>;

export const categoryKeys = Object.keys(categoryMap) as CategoryKey[];

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isCategoryKey(value: string): value is CategoryKey {
  return value in categoryMap;
}

const categoryAliases: Readonly<Record<string, CategoryKey>> = {
  educacao: "educacao",
  curso: "educacao",
  cursos: "educacao",
  estudo: "educacao",
  estudos: "educacao",
  faculdade: "educacao",

  lazer: "lazer",
  entretenimento: "lazer",
  cinema: "lazer",
  passeio: "lazer",
  passeios: "lazer",

  transporte: "transporte",
  uber: "transporte",
  taxi: "transporte",
  combustivel: "transporte",
  gasolina: "transporte",
  estacionamento: "transporte",

  moradia: "moradia",
  casa: "moradia",
  aluguel: "moradia",
  condominio: "moradia",
  luz: "moradia",
  agua: "moradia",
  internet: "moradia",

  compras: "compras",
  compra: "compras",
  shopping: "compras",
  roupas: "compras",
  roupa: "compras",

  assinaturas: "assinaturas",
  assinatura: "assinaturas",
  recorrencia: "assinaturas",
  recorrencias: "assinaturas",
  netflix: "assinaturas",
  spotify: "assinaturas",
  streaming: "assinaturas",

  alimentacao: "alimentacao",
  comida: "alimentacao",
  refeicao: "alimentacao",
  refeicoes: "alimentacao",
  delivery: "alimentacao",
  ifood: "alimentacao",

  restaurantes: "restaurantes",
  restaurante: "restaurantes",
  bar: "restaurantes",
  bares: "restaurantes",
  lanche: "restaurantes",
  lanches: "restaurantes",

  salario: "salario",
  remuneracao: "salario",
  renda: "salario",
  pagamento: "salario",
  provento: "salario",
  proventos: "salario",

  outros: "outros",
  outro: "outros",
  diverso: "outros",
  diversos: "outros",

  pets: "pets",
  pet: "pets",
  cachorro: "pets",
  gato: "pets",
  veterinario: "pets",

  mercado: "mercado",
  supermercado: "mercado",
  feira: "mercado",
  hortifruti: "mercado",

  saude: "saude",
  farmacia: "saude",
  remedio: "saude",
  remedios: "saude",
  medico: "saude",
  consulta: "saude",
  exames: "saude",
};

export function resolveCategoryKey(category: string): CategoryKey {
  const normalizedCategory = normalizeCategory(category);

  if (isCategoryKey(normalizedCategory)) {
    return normalizedCategory;
  }

  return categoryAliases[normalizedCategory] ?? "outros";
}

export function getCategoryMeta(category: string): CategoryMeta {
  return categoryMap[resolveCategoryKey(category)];
}
