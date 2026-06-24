import { createHash, randomUUID } from "node:crypto";

import pg from "pg";

// Seed de desenvolvimento — dados 100% fictícios.
// Risk: NUNCA usar dados financeiros reais aqui. Valores e descrições abaixo
// são genéricos e inventados.
const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://finsight:finsight@localhost:5434/finsight_ai";

const SEED_EMAIL = "dev@finsight.local";

// dedupe_hash = sha256(date + amount + description + account_id)
function dedupeHash({ date, amount, description, accountId }) {
  return createHash("sha256")
    .update(`${date}${amount}${description}${accountId}`)
    .digest("hex");
}

function daysAgo(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

async function seed() {
  const pool = new Pool({ connectionString });

  try {
    // Idempotente: remove o usuário de seed; o cascade limpa profile, contas,
    // categorias e transações vinculadas.
    await pool.query("DELETE FROM users WHERE email = $1", [SEED_EMAIL]);

    const userId = randomUUID();
    await pool.query(
      `INSERT INTO users (id, name, email, oauth_provider)
       VALUES ($1, $2, $3, 'credentials')`,
      [userId, "Dev User", SEED_EMAIL],
    );

    await pool.query(
      `INSERT INTO user_profiles (user_id, currency, primary_goal, closing_day)
       VALUES ($1, 'BRL', 'Organizar finanças e quitar dívidas', 5)`,
      [userId],
    );

    const checkingId = randomUUID();
    const savingsId = randomUUID();
    await pool.query(
      `INSERT INTO accounts (id, user_id, name, type, institution) VALUES
       ($1, $5, 'Conta Corrente', 'checking', 'Banco Fictício'),
       ($2, $5, 'Poupança', 'savings', 'Banco Fictício'),
       ($3, $5, 'Cartão de Crédito', 'credit_card', 'Banco Fictício'),
       ($4, $5, 'Investimentos', 'investment', 'Corretora Fictícia')`,
      [checkingId, savingsId, randomUUID(), randomUUID(), userId],
    );

    // Categorias (cores estáveis em #RRGGBB).
    const cats = {
      salary: randomUUID(),
      groceries: randomUUID(),
      housing: randomUUID(),
      dining: randomUUID(),
      transport: randomUUID(),
      subscriptions: randomUUID(),
      health: randomUUID(),
    };
    await pool.query(
      `INSERT INTO categories (id, user_id, name, color, kind) VALUES
       ($1, $8, 'Salário', '#16A34A', 'income'),
       ($2, $8, 'Mercado', '#F59E0B', 'expense'),
       ($3, $8, 'Moradia', '#3B82F6', 'expense'),
       ($4, $8, 'Restaurantes', '#EF4444', 'expense'),
       ($5, $8, 'Transporte', '#8B5CF6', 'expense'),
       ($6, $8, 'Assinaturas', '#EC4899', 'expense'),
       ($7, $8, 'Saúde', '#06B6D4', 'expense')`,
      [
        cats.salary,
        cats.groceries,
        cats.housing,
        cats.dining,
        cats.transport,
        cats.subscriptions,
        cats.health,
        userId,
      ],
    );

    // Transações variadas: receitas, despesas e transferência, em datas
    // diferentes, valores diversos e duas categorias nulas (não categorizadas).
    const rows = [
      {
        d: 60,
        amount: "5200.00",
        kind: "income",
        cat: cats.salary,
        acc: checkingId,
        desc: "Salário mensal",
      },
      {
        d: 58,
        amount: "1450.00",
        kind: "expense",
        cat: cats.housing,
        acc: checkingId,
        desc: "Aluguel",
      },
      {
        d: 55,
        amount: "320.45",
        kind: "expense",
        cat: cats.groceries,
        acc: checkingId,
        desc: "Supermercado",
      },
      {
        d: 52,
        amount: "89.90",
        kind: "expense",
        cat: cats.subscriptions,
        acc: null,
        desc: "Assinatura streaming",
      },
      {
        d: 48,
        amount: "47.30",
        kind: "expense",
        cat: cats.transport,
        acc: checkingId,
        desc: "Aplicativo de transporte",
      },
      {
        d: 45,
        amount: "210.00",
        kind: "expense",
        cat: cats.dining,
        acc: checkingId,
        desc: "Jantar com amigos",
      },
      {
        d: 40,
        amount: "500.00",
        kind: "transfer",
        cat: null,
        acc: savingsId,
        desc: "Transferência para poupança",
      },
      {
        d: 35,
        amount: "132.70",
        kind: "expense",
        cat: cats.groceries,
        acc: checkingId,
        desc: "Feira e padaria",
      },
      {
        d: 30,
        amount: "5200.00",
        kind: "income",
        cat: cats.salary,
        acc: checkingId,
        desc: "Salário mensal",
      },
      {
        d: 28,
        amount: "1450.00",
        kind: "expense",
        cat: cats.housing,
        acc: checkingId,
        desc: "Aluguel",
      },
      {
        d: 25,
        amount: "75.00",
        kind: "expense",
        cat: cats.health,
        acc: checkingId,
        desc: "Farmácia",
      },
      {
        d: 22,
        amount: "38.50",
        kind: "expense",
        cat: cats.transport,
        acc: checkingId,
        desc: "Recarga de transporte",
      },
      {
        d: 18,
        amount: "265.80",
        kind: "expense",
        cat: cats.groceries,
        acc: checkingId,
        desc: "Compras do mês",
      },
      {
        d: 14,
        amount: "120.00",
        kind: "expense",
        cat: cats.dining,
        acc: checkingId,
        desc: "Almoços da semana",
      },
      {
        d: 10,
        amount: "89.90",
        kind: "expense",
        cat: cats.subscriptions,
        acc: null,
        desc: "Assinatura streaming",
      },
      {
        d: 7,
        amount: "300.00",
        kind: "income",
        cat: null,
        acc: checkingId,
        desc: "Freelance",
      },
      {
        d: 4,
        amount: "54.20",
        kind: "expense",
        cat: cats.transport,
        acc: checkingId,
        desc: "Combustível",
      },
      {
        d: 1,
        amount: "180.00",
        kind: "expense",
        cat: cats.health,
        acc: checkingId,
        desc: "Consulta médica",
      },
    ];

    for (const row of rows) {
      const occurredAt = daysAgo(row.d);
      const dateStr = occurredAt.toISOString().slice(0, 10);
      const accountId = row.acc ?? checkingId;
      await pool.query(
        `INSERT INTO transactions
           (id, user_id, account_id, category_id, amount, currency, kind, description, occurred_at, origin, dedupe_hash)
         VALUES ($1, $2, $3, $4, $5, 'BRL', $6, $7, $8, 'manual', $9)`,
        [
          randomUUID(),
          userId,
          accountId,
          row.cat,
          row.amount,
          row.kind,
          row.desc,
          occurredAt,
          dedupeHash({
            date: dateStr,
            amount: row.amount,
            description: row.desc,
            accountId,
          }),
        ],
      );
    }

    process.stdout.write(
      `Seed concluído: usuário ${SEED_EMAIL} com ${rows.length} transações.\n`,
    );
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Falha no seed:", error);
  process.exit(1);
});
