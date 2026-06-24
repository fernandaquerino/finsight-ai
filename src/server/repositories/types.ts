import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "@/../db/schema";

// Tipo da instância Drizzle injetada nos repositórios.
//
// Decisão de design: cada função de repositório recebe `db` por parâmetro
// (injeção de dependência) em vez de chamar getDb() internamente. Isso permite
// que os testes de integração apontem para um banco de teste e que os services
// passem a mesma transação/conexão para várias operações.
export type Database = NodePgDatabase<typeof schema>;
