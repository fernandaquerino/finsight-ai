-- Passo de limpeza de dados adicionado manualmente: o índice único abaixo
-- falharia se já existissem categorias duplicadas (mesmo user_id, name, kind).
-- O drizzle-kit não gera migração de dados, então deduplicamos antes de criar
-- a constraint. Mantém a categoria de menor id e repõe as transações.

-- 1) Repõe transações que apontam para uma categoria duplicada para a mantida.
UPDATE "transactions" AS t
SET "category_id" = r."keep_id"
FROM (
  SELECT
    "id",
    first_value("id") OVER (
      PARTITION BY "user_id", "name", "kind" ORDER BY "id"
    ) AS "keep_id"
  FROM "categories"
) AS r
WHERE t."category_id" = r."id" AND r."id" <> r."keep_id";
--> statement-breakpoint

-- 2) Remove as categorias duplicadas, preservando a de menor id por grupo.
DELETE FROM "categories" AS c
USING (
  SELECT
    "id",
    first_value("id") OVER (
      PARTITION BY "user_id", "name", "kind" ORDER BY "id"
    ) AS "keep_id"
  FROM "categories"
) AS r
WHERE c."id" = r."id" AND r."id" <> r."keep_id";
--> statement-breakpoint

CREATE UNIQUE INDEX "categories_user_id_name_kind_unique_idx" ON "categories" USING btree ("user_id","name","kind");
