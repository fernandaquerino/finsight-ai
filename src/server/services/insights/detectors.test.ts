import { describe, expect, it } from "vitest";

import {
  ABOVE_AVERAGE_MIN_EXCESS,
  detectBudgetOverruns,
  detectCategoriesAboveAverage,
  detectGoalsBehind,
  detectInsights,
  detectNewRecurring,
  detectPossibleDuplicates,
  detectRecurringCharges,
  formatMonthKey,
  groupRecurringCharges,
  normalizeDescription,
  sortInsights,
  type InsightBudgetCategory,
  type InsightGoal,
  type InsightTransaction,
} from "./detectors";
import type { Insight } from "./types";

// Mês de referência fixo em todos os testes: maio de 2026.
const MONTH = "2026-05";

const CATEGORIES = new Map([
  ["cat-food", "Alimentação"],
  ["cat-subs", "Assinaturas"],
]);

let sequence = 0;

function expense(
  overrides: Partial<InsightTransaction> = {},
): InsightTransaction {
  sequence += 1;

  return {
    id: `t${sequence}`,
    description: "Spotify Premium",
    amount: "21.90",
    kind: "expense",
    origin: "import",
    occurredAt: new Date(2026, 4, 10),
    categoryId: "cat-subs",
    isRecurring: false,
    ...overrides,
  };
}

// Mesma cobrança repetida em N meses consecutivos terminando em maio/2026.
function monthlyCharge(
  monthsBack: number,
  overrides: Partial<InsightTransaction> = {},
): InsightTransaction[] {
  return Array.from({ length: monthsBack }, (_, index) =>
    expense({
      occurredAt: new Date(2026, 4 - index, 10),
      ...overrides,
    }),
  );
}

describe("normalizeDescription", () => {
  it("strips accents, case and punctuation so the same merchant groups", () => {
    expect(normalizeDescription("UBER *TRIP")).toBe("uber trip");
    expect(normalizeDescription("Alimentação · Padaria!")).toBe(
      "alimentacao padaria",
    );
  });

  it("returns an empty string for a missing description", () => {
    expect(normalizeDescription(null)).toBe("");
  });
});

describe("formatMonthKey", () => {
  it("renders the month key in PT-BR", () => {
    expect(formatMonthKey("2026-05")).toBe("mai 2026");
  });
});

describe("groupRecurringCharges", () => {
  it("keeps a charge repeated across three distinct months", () => {
    const groups = groupRecurringCharges(monthlyCharge(3));

    expect(groups).toHaveLength(1);
    expect(groups[0]?.months).toEqual(["2026-03", "2026-04", "2026-05"]);
    expect(groups[0]?.amount).toBe(21.9);
  });

  it("ignores a charge that appears in only two months", () => {
    expect(groupRecurringCharges(monthlyCharge(2))).toHaveLength(0);
  });

  it("ignores a group whose amounts vary beyond the tolerated spread", () => {
    const transactions = [
      ...monthlyCharge(2),
      expense({ occurredAt: new Date(2026, 2, 10), amount: "120.00" }),
    ];

    expect(groupRecurringCharges(transactions)).toHaveLength(0);
  });

  it("tolerates a small price adjustment", () => {
    const transactions = [
      ...monthlyCharge(2),
      expense({ occurredAt: new Date(2026, 2, 10), amount: "20.90" }),
    ];

    expect(groupRecurringCharges(transactions)).toHaveLength(1);
  });

  it("ignores income", () => {
    const transactions = monthlyCharge(3, {
      kind: "income",
      description: "Salário",
    });

    expect(groupRecurringCharges(transactions)).toHaveLength(0);
  });
});

describe("detectRecurringCharges", () => {
  const twoSubscriptions = [
    ...monthlyCharge(3),
    ...monthlyCharge(3, { description: "Netflix", amount: "44.90" }),
  ];

  it("annualizes only the monthly total and cites the source", () => {
    const insight = detectRecurringCharges(
      groupRecurringCharges(twoSubscriptions),
      MONTH,
      CATEGORIES,
    );

    expect(insight?.severity).toBe("opportunity");
    expect(insight?.impact).toBe(66.8);
    expect(insight?.impactDirection).toBe("savings");
    expect(insight?.impactPeriod).toBe("monthly");
    expect(insight?.impactLabel).toContain("801,60");
    expect(insight?.source).toContain("6 cobranças repetidas");
  });

  // O app não tem dado de uso; afirmar "assinatura pouco usada" seria inventar.
  it("never claims the subscription is unused", () => {
    const insight = detectRecurringCharges(
      groupRecurringCharges(twoSubscriptions),
      MONTH,
      CATEGORIES,
    );

    expect(`${insight?.reason} ${insight?.headline}`).not.toMatch(/us[oa]/i);
  });

  it("returns null with a single recurring charge", () => {
    expect(
      detectRecurringCharges(
        groupRecurringCharges(monthlyCharge(3)),
        MONTH,
        CATEGORIES,
      ),
    ).toBeNull();
  });

  it("returns null when the charge stopped before the analysed month", () => {
    const stopped = monthlyCharge(3).map((transaction) => ({
      ...transaction,
      occurredAt: new Date(
        transaction.occurredAt.getFullYear(),
        transaction.occurredAt.getMonth() - 1,
        10,
      ),
    }));

    expect(
      detectRecurringCharges(groupRecurringCharges(stopped), MONTH, CATEGORIES),
    ).toBeNull();
  });
});

describe("detectNewRecurring", () => {
  it("flags a charge that just crossed the third month", () => {
    const insight = detectNewRecurring(
      groupRecurringCharges(monthlyCharge(3)),
      MONTH,
      CATEGORIES,
    );

    expect(insight?.severity).toBe("info");
    expect(insight?.impact).toBe(0);
    expect(insight?.impactDirection).toBe("none");
  });

  it("stays quiet once the user already marked it as recurring", () => {
    const insight = detectNewRecurring(
      groupRecurringCharges(monthlyCharge(3, { isRecurring: true })),
      MONTH,
      CATEGORIES,
    );

    expect(insight).toBeNull();
  });

  it("stays quiet for a charge already recurring for four months", () => {
    const insight = detectNewRecurring(
      groupRecurringCharges(monthlyCharge(4)),
      MONTH,
      CATEGORIES,
    );

    expect(insight).toBeNull();
  });
});

describe("detectCategoriesAboveAverage", () => {
  // 3 meses anteriores a R$ 100 (média 100) e maio a R$ 400: excesso de 300.
  function history(): InsightTransaction[] {
    return [
      expense({
        categoryId: "cat-food",
        description: "Mercado março",
        amount: "100.00",
        occurredAt: new Date(2026, 1, 5),
      }),
      expense({
        categoryId: "cat-food",
        description: "Mercado março",
        amount: "100.00",
        occurredAt: new Date(2026, 2, 5),
      }),
      expense({
        categoryId: "cat-food",
        description: "Mercado abril",
        amount: "100.00",
        occurredAt: new Date(2026, 3, 5),
      }),
    ];
  }

  it("reports the excess over the historical average", () => {
    const [insight] = detectCategoriesAboveAverage(
      [
        ...history(),
        expense({
          categoryId: "cat-food",
          description: "Restaurante",
          amount: "400.00",
          occurredAt: new Date(2026, 4, 22),
        }),
      ],
      MONTH,
      CATEGORIES,
    );

    expect(insight?.severity).toBe("attention");
    expect(insight?.title).toBe("Alimentação acima da sua média");
    expect(insight?.impact).toBe(300);
    expect(insight?.impactDirection).toBe("overspend");
    expect(insight?.impactPeriod).toBe("one-off");
    expect(insight?.evidence).toHaveLength(1);
  });

  it("stays quiet without enough history to average", () => {
    const insights = detectCategoriesAboveAverage(
      [
        ...history().slice(0, 2),
        expense({
          categoryId: "cat-food",
          amount: "400.00",
          occurredAt: new Date(2026, 4, 22),
        }),
      ],
      MONTH,
      CATEGORIES,
    );

    expect(insights).toHaveLength(0);
  });

  it("stays quiet when the excess is below the noise threshold", () => {
    const insights = detectCategoriesAboveAverage(
      [
        ...history(),
        expense({
          categoryId: "cat-food",
          amount: String(100 + ABOVE_AVERAGE_MIN_EXCESS - 1),
          occurredAt: new Date(2026, 4, 22),
        }),
      ],
      MONTH,
      CATEGORIES,
    );

    expect(insights).toHaveLength(0);
  });
});

describe("detectPossibleDuplicates", () => {
  function pair(): InsightTransaction[] {
    return [
      expense({
        description: "Posto Shell",
        amount: "210.00",
        origin: "import",
        occurredAt: new Date(2026, 4, 29),
      }),
      expense({
        description: "Posto Shell",
        amount: "210.00",
        origin: "manual",
        occurredAt: new Date(2026, 4, 30),
      }),
    ];
  }

  it("counts only one side of the pair as the amount under review", () => {
    const insight = detectPossibleDuplicates(pair(), MONTH, CATEGORIES);

    expect(insight?.severity).toBe("risk");
    expect(insight?.impact).toBe(210);
    expect(insight?.impactDirection).toBe("review");
    expect(insight?.evidence).toHaveLength(2);
  });

  it("does not pair the same transaction twice", () => {
    const insight = detectPossibleDuplicates(
      [...pair(), ...pair()],
      MONTH,
      CATEGORIES,
    );

    // 4 lançamentos idênticos = 2 pares, não 3.
    expect(insight?.impact).toBe(420);
    expect(insight?.title).toBe("2 possíveis duplicidades");
  });

  it("ignores lookalikes outside the window", () => {
    const [first, second] = pair();
    const far = [first!, { ...second!, occurredAt: new Date(2026, 4, 20) }];

    expect(detectPossibleDuplicates(far, MONTH, CATEGORIES)).toBeNull();
  });

  it("ignores same-day charges with different amounts", () => {
    const [first, second] = pair();
    const different = [first!, { ...second!, amount: "99.00" }];

    expect(detectPossibleDuplicates(different, MONTH, CATEGORIES)).toBeNull();
  });
});

describe("detectBudgetOverruns", () => {
  function category(
    overrides: Partial<InsightBudgetCategory> = {},
  ): InsightBudgetCategory {
    return {
      id: "cat-fun",
      name: "Lazer",
      monthlyBudget: 500,
      amount: 638.4,
      budgetStatus: "over",
      ...overrides,
    };
  }

  it("reports the amount above the budget", () => {
    const [insight] = detectBudgetOverruns([category()], MONTH);

    expect(insight?.title).toBe("Orçamento de Lazer estourado");
    expect(insight?.impact).toBe(138.4);
    expect(insight?.impactDirection).toBe("overspend");
  });

  it("ignores categories within the budget", () => {
    expect(
      detectBudgetOverruns([category({ budgetStatus: "warning" })], MONTH),
    ).toHaveLength(0);
  });

  it("keeps at most the two worst overruns", () => {
    const insights = detectBudgetOverruns(
      [
        category({ id: "a", amount: 600 }),
        category({ id: "b", amount: 900 }),
        category({ id: "c", amount: 700 }),
      ],
      MONTH,
    );

    expect(insights.map((insight) => insight.impact)).toEqual([400, 200]);
  });
});

describe("detectGoalsBehind", () => {
  function goal(overrides: Partial<InsightGoal> = {}): InsightGoal {
    return {
      id: "g1",
      name: "Novo notebook",
      status: "behind",
      currentAmount: 1100,
      targetAmount: 7500,
      monthlyContribution: 400,
      projection: {
        requiredMonthlyContribution: 1600,
        monthsToDeadline: 4,
        message: "No ritmo atual a meta não bate o prazo.",
      },
      ...overrides,
    };
  }

  it("reports the monthly gap and never counts it as savings", () => {
    const [insight] = detectGoalsBehind([goal()], MONTH);

    expect(insight?.severity).toBe("attention");
    expect(insight?.impact).toBe(1200);
    expect(insight?.impactDirection).toBe("none");
  });

  it("ignores goals that are on track", () => {
    expect(
      detectGoalsBehind([goal({ status: "on-track" })], MONTH),
    ).toHaveLength(0);
  });
});

describe("sortInsights", () => {
  function insight(severity: Insight["severity"], impact: number): Insight {
    return {
      id: `${severity}-${impact}`,
      kind: "budget-overrun",
      severity,
      title: "t",
      reason: "r",
      headline: "h",
      impact,
      impactDirection: "none",
      impactPeriod: "one-off",
      impactLabel: "l",
      source: "s",
      evidence: [],
      steps: [],
      action: null,
    };
  }

  it("puts risk first, then opportunity, attention and info", () => {
    const sorted = sortInsights([
      insight("info", 10),
      insight("attention", 10),
      insight("opportunity", 10),
      insight("risk", 10),
    ]);

    expect(sorted.map((item) => item.severity)).toEqual([
      "risk",
      "opportunity",
      "attention",
      "info",
    ]);
  });

  it("puts the larger amount first within the same severity", () => {
    const sorted = sortInsights([insight("risk", 10), insight("risk", 90)]);

    expect(sorted.map((item) => item.impact)).toEqual([90, 10]);
  });
});

describe("detectInsights", () => {
  it("returns nothing for a user without data", () => {
    expect(
      detectInsights({
        monthKey: MONTH,
        transactions: [],
        categories: [],
        budgetCategories: [],
        goals: [],
      }),
    ).toEqual([]);
  });

  it("produces stable ids across runs with the same input", () => {
    const input = {
      monthKey: MONTH,
      transactions: [
        ...monthlyCharge(3),
        ...monthlyCharge(3, { description: "Netflix", amount: "44.90" }),
      ],
      categories: [{ id: "cat-subs", name: "Assinaturas" }],
      budgetCategories: [],
      goals: [],
    };

    expect(detectInsights(input).map((item) => item.id)).toEqual(
      detectInsights(input).map((item) => item.id),
    );
  });
});
