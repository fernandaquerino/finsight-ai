import { desc, eq } from "drizzle-orm";

import { auditLogs, type NewAuditLog } from "@/../db/schema";

import type { Database } from "./types";

// Tabela append-only: este repository expõe APENAS insert e select.
// Nunca adicionar update/delete aqui (ver comentário em db/schema/audit-logs).
export const auditLogRepository = {
  async record(db: Database, data: NewAuditLog) {
    const [log] = await db.insert(auditLogs).values(data).returning();

    if (!log) {
      throw new Error("Failed to record audit log");
    }

    return log;
  },

  listByUser(db: Database, userId: string, limit = 50) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  },
};
