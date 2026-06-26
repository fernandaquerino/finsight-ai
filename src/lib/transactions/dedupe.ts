import { createHash } from "node:crypto";

// dedupe_hash = sha256(date + amount + description + account_id).
// Mesma fórmula usada no seed (db/seed/index.mjs). Mantida aqui em TS para o
// fluxo de criação manual e, futuramente, a importação de CSV.
//
// Normalizações para garantir determinismo independente da origem:
// - date: YYYY-MM-DD (sem hora/timezone), pois a deduplicação é por dia.
// - amount: string com 2 casas (mesma escala da coluna numeric(14,2)).
// - description: trimada; null/undefined viram string vazia.
type DedupeInput = {
  occurredAt: Date;
  amount: string;
  description?: string | null;
  accountId: string;
};

export function computeDedupeHash({
  occurredAt,
  amount,
  description,
  accountId,
}: DedupeInput): string {
  const date = occurredAt.toISOString().slice(0, 10);
  const normalizedAmount = Number(amount).toFixed(2);
  const normalizedDescription = (description ?? "").trim();

  return createHash("sha256")
    .update(`${date}${normalizedAmount}${normalizedDescription}${accountId}`)
    .digest("hex");
}
