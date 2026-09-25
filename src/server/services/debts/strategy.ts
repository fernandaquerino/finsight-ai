// Estratégias de quitação e simulação de amortização.
//
// Tudo aqui é função pura sobre números — nenhum I/O, nenhuma chamada de LLM.
// A simulação roda em centavos inteiros: valores financeiros em float acumulam
// erro ao longo de dezenas de iterações mensais.
//
// Aviso de produto: os resultados são estimativas com base nos dados informados
// pelo usuário (saldo, parcela, taxa), não aconselhamento financeiro.

export type DebtStrategy = "avalanche" | "snowball";

// Teto de segurança: uma dívida cujo orçamento não cobre os juros nunca quita.
// Cortamos a simulação em 100 anos em vez de girar para sempre.
const MAX_SIMULATED_MONTHS = 1200;

export type SimulationDebt = Readonly<{
  id: string;
  remainingAmount: number;
  // Juros mensais em pontos percentuais (13.9 = 13,9% a.m.).
  interestRate: number;
  monthlyPayment: number;
}>;

export type PayoffSimulation = Readonly<{
  // Meses até zerar tudo. null quando o orçamento não cobre os juros.
  months: number | null;
  totalInterest: number;
  // Ordem em que as dívidas foram quitadas (primeira = foco inicial).
  payoffOrder: readonly string[];
}>;

export type StrategyComparison = Readonly<{
  recommended: DebtStrategy;
  avalanche: PayoffSimulation;
  snowball: PayoffSimulation;
  // Juros economizados pela estratégia recomendada vs. a outra (>= 0).
  interestSaved: number;
  // Meses economizados pela recomendada vs. a outra. null se alguma não quita.
  monthsSaved: number | null;
}>;

function toCents(value: number): number {
  return Math.round(value * 100);
}

// Ordena as dívidas pela estratégia. Avalanche ataca o maior juro (economiza
// mais); bola de neve ataca o menor saldo (entrega a primeira vitória antes).
// Empates caem no id para a ordem ser estável entre chamadas.
export function orderByStrategy<T extends SimulationDebt>(
  debts: readonly T[],
  strategy: DebtStrategy,
): T[] {
  return [...debts].sort((a, b) => {
    const primary =
      strategy === "avalanche"
        ? b.interestRate - a.interestRate
        : a.remainingAmount - b.remainingAmount;

    return primary || a.id.localeCompare(b.id);
  });
}

// Juros do próximo mês se nada for pago — o "custo de carregar" a dívida hoje.
export function monthlyInterestEstimate(
  debts: readonly SimulationDebt[],
): number {
  const cents = debts.reduce(
    (total, debt) =>
      total +
      Math.round(toCents(debt.remainingAmount) * (debt.interestRate / 100)),
    0,
  );

  return cents / 100;
}

// Simula a quitação mês a mês. O orçamento total é constante (soma das parcelas
// + aporte extra): conforme uma dívida é quitada, a parcela liberada vai para a
// próxima da fila — é isso que caracteriza avalanche e bola de neve.
export function simulatePayoff(
  debts: readonly SimulationDebt[],
  strategy: DebtStrategy,
  extraMonthly = 0,
): PayoffSimulation {
  const ordered = orderByStrategy(debts, strategy);

  const state = ordered.map((debt) => ({
    id: debt.id,
    remaining: toCents(debt.remainingAmount),
    minimum: toCents(Math.max(0, debt.monthlyPayment)),
    rate: debt.interestRate / 100,
  }));

  const budget =
    state.reduce((total, debt) => total + debt.minimum, 0) +
    toCents(Math.max(0, extraMonthly));

  const payoffOrder: string[] = [];
  let totalInterest = 0;
  let months = 0;

  const open = () => state.filter((debt) => debt.remaining > 0);

  if (open().length === 0) {
    return { months: 0, totalInterest: 0, payoffOrder: [] };
  }

  while (open().length > 0) {
    if (months >= MAX_SIMULATED_MONTHS || budget <= 0) {
      return { months: null, totalInterest: totalInterest / 100, payoffOrder };
    }

    months += 1;
    const before = open().reduce((total, debt) => total + debt.remaining, 0);

    // 1. Juros do mês sobre o saldo aberto.
    for (const debt of open()) {
      const interest = Math.round(debt.remaining * debt.rate);
      debt.remaining += interest;
      totalInterest += interest;
    }

    // 2. Parcela mínima de cada dívida que não é o foco.
    const [focus, ...rest] = open();
    let available = budget;

    for (const debt of rest) {
      const payment = Math.min(debt.minimum, debt.remaining, available);
      debt.remaining -= payment;
      available -= payment;
    }

    // 3. Todo o restante do orçamento vai para o foco.
    if (focus) {
      const payment = Math.min(focus.remaining, available);
      focus.remaining -= payment;
      available -= payment;
    }

    // 4. Sobrou orçamento (dívidas quitadas no mês)? Reaplica na fila.
    while (available > 0) {
      const next = open()[0];
      if (!next) break;
      const payment = Math.min(next.remaining, available);
      next.remaining -= payment;
      available -= payment;
    }

    for (const debt of state) {
      if (debt.remaining <= 0 && !payoffOrder.includes(debt.id)) {
        payoffOrder.push(debt.id);
      }
    }

    // Saldo total não caiu: o orçamento não cobre nem os juros. Nunca quita.
    const after = open().reduce((total, debt) => total + debt.remaining, 0);
    if (after >= before && after > 0) {
      return { months: null, totalInterest: totalInterest / 100, payoffOrder };
    }
  }

  return {
    months,
    totalInterest: Math.round(totalInterest) / 100,
    payoffOrder,
  };
}

// Compara as duas estratégias com o mesmo orçamento. Avalanche é matematicamente
// igual ou melhor em juros; a comparação existe para mostrar *quanto* melhor.
export function compareStrategies(
  debts: readonly SimulationDebt[],
  extraMonthly = 0,
): StrategyComparison {
  const avalanche = simulatePayoff(debts, "avalanche", extraMonthly);
  const snowball = simulatePayoff(debts, "snowball", extraMonthly);

  const recommended: DebtStrategy =
    avalanche.totalInterest <= snowball.totalInterest
      ? "avalanche"
      : "snowball";
  const other = recommended === "avalanche" ? snowball : avalanche;
  const best = recommended === "avalanche" ? avalanche : snowball;

  const monthsSaved =
    best.months === null || other.months === null
      ? null
      : other.months - best.months;

  return {
    recommended,
    avalanche,
    snowball,
    interestSaved:
      Math.round((other.totalInterest - best.totalInterest) * 100) / 100,
    monthsSaved,
  };
}
