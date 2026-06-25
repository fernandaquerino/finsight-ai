// Entrada mínima necessária para os cálculos — desacopla o cálculo do schema
// completo de transação (facilita o teste unitário).
export type MetricsTransaction = {
  kind: "income" | "expense" | "transfer";
  amount: string;
};

export type DashboardMetrics = {
  // Valores em unidades maiores (reais), prontos para formatação.
  income: number;
  expenses: number;
  balance: number;
  savings: number;
};

// amount vem do Postgres como string (numeric). Convertemos para centavos
// inteiros antes de somar para evitar erros de ponto flutuante.
function toCents(amount: string): number {
  return Math.round(Number(amount) * 100);
}

export function calculateMetrics(
  transactions: readonly MetricsTransaction[],
): DashboardMetrics {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const transaction of transactions) {
    const cents = toCents(transaction.amount);

    if (transaction.kind === "income") {
      incomeCents += cents;
    } else if (transaction.kind === "expense") {
      expenseCents += cents;
    }
    // `transfer` não afeta receita/despesa (movimentação entre contas).
  }

  const balanceCents = incomeCents - expenseCents;
  const savingsCents = Math.max(0, balanceCents);

  return {
    income: incomeCents / 100,
    expenses: expenseCents / 100,
    balance: balanceCents / 100,
    savings: savingsCents / 100,
  };
}
