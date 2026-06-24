import { eq } from "drizzle-orm";

import { users } from "@/../db/schema";

import type { Database } from "./types";

// users é a tabela de identidade — não tem coluna userId. O isolamento aqui é
// pela própria PK (id): cada acesso busca o próprio usuário pelo id da sessão.
export const userRepository = {
  findById(db: Database, id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  },

  findByEmail(db: Database, email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  },
};
