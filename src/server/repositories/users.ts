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

  async updateName(db: Database, id: string, name: string) {
    const [user] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, id))
      .returning();

    return user;
  },

  async updatePasswordHash(db: Database, id: string, passwordHash: string) {
    const [user] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return user;
  },

  // Hard delete — único lugar do app onde dados saem de vez do banco (exclusão
  // de conta, LGPD/GDPR). Todas as tabelas de domínio têm FK com
  // onDelete: cascade, então este DELETE apaga tudo. audit_logs é a exceção
  // proposital (onDelete: set null): a trilha sobrevive à exclusão que prova.
  async hardDelete(db: Database, id: string) {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return user;
  },
};
