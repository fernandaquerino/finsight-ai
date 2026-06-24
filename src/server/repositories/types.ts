import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";

import type * as schema from "@/../db/schema";

// Tipo da instância Drizzle injetada nos repositórios.
//
// Decisão de design: cada função de repositório recebe `db` por parâmetro
// (injeção de dependência) em vez de chamar getDb() internamente. Isso permite
// que os testes de integração apontem para um banco de teste e que os services
// passem a mesma transação/conexão para várias operações.
//
// Usamos PgDatabase (e não NodePgDatabase) para que tanto a conexão quanto uma
// transação (`db.transaction((tx) => ...)`) sejam aceitas — a tx é um
// PgDatabase, permitindo reaproveitar os mesmos repositórios dentro dela.
export type Database = PgDatabase<NodePgQueryResultHKT, typeof schema>;
