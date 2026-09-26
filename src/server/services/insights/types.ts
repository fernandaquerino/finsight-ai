// Contratos da análise de insights. Compartilhados entre service, API e front
// (o front reexporta daqui via features/insights/types).

export type InsightSeverity = "risk" | "opportunity" | "attention" | "info";

// Cada kind é um detector determinístico em `detectors.ts`. O kind entra no id
// do insight, então renomear um kind muda o id — trate como contrato.
export type InsightKind =
  | "recurring-charges"
  | "category-above-average"
  | "possible-duplicate"
  | "budget-overrun"
  | "goal-behind"
  | "new-recurring";

// Como ler `impact`: sempre uma magnitude positiva em BRL.
// - "savings": dinheiro que o usuário pode recuperar se agir.
// - "overspend": dinheiro já gasto acima do padrão dele (não é recuperável).
// - "review": valor em dúvida, pendente de confirmação do usuário.
// - "none": o insight não tem efeito financeiro direto.
export type InsightImpactDirection =
  | "savings"
  | "overspend"
  | "review"
  | "none";

// "monthly" = se repete todo mês (pode ser anualizado). "one-off" = só este mês.
export type InsightImpactPeriod = "monthly" | "one-off";

// Uma linha de evidência: sempre um dado real do usuário, nunca texto gerado.
export type InsightEvidence = Readonly<{
  description: string;
  // Contexto curto da linha: data, origem, frequência.
  detail: string;
  categoryName: string | null;
  // Negativo em despesas, positivo em receitas — mesma convenção da UI.
  amount: number;
}>;

// Para onde o insight leva. É sempre navegação: o usuário decide e age na tela
// do domínio. A IA nunca aplica mudança sozinha.
export type InsightAction = Readonly<{
  label: string;
  href: string;
}>;

export type Insight = Readonly<{
  // Determinístico e estável entre requests (chave de lista e de detalhe).
  id: string;
  kind: InsightKind;
  severity: InsightSeverity;
  title: string;
  // Uma frase: o que foi observado.
  reason: string;
  // Frase do detalhe, com o número e o efeito de agir.
  headline: string;
  impact: number;
  impactDirection: InsightImpactDirection;
  impactPeriod: InsightImpactPeriod;
  impactLabel: string;
  // Obrigatório: todo número financeiro na UI cita a fonte.
  source: string;
  evidence: readonly InsightEvidence[];
  steps: readonly string[];
  action: InsightAction | null;
}>;

export type InsightCounts = Readonly<Record<InsightSeverity | "all", number>>;

export type InsightTotals = Readonly<{
  // Soma dos impactos recorrentes recuperáveis (direction "savings",
  // period "monthly").
  potentialMonthlySavings: number;
  // potentialMonthlySavings * 12. Só anualiza o que de fato se repete.
  potentialAnnualSavings: number;
  // Soma dos valores em dúvida (direction "review") — não entra na economia.
  amountUnderReview: number;
}>;

export type InsightsSummary = Readonly<{
  // Mês analisado, "YYYY-MM".
  month: string;
  items: readonly Insight[];
  counts: InsightCounts;
  totals: InsightTotals;
}>;
