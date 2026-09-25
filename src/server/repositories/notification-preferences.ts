import { eq } from "drizzle-orm";

import {
  notificationPreferences,
  type NewNotificationPreferences,
} from "@/../db/schema";

import type { Database } from "./types";

// notification_preferences tem userId como PK (relação 1:1 com users).
// Isolamento pela PK — o mesmo padrão de userProfileRepository.
export const notificationPreferenceRepository = {
  getByUserId(db: Database, userId: string) {
    return db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });
  },

  // Upsert porque a linha só nasce quando o usuário mexe nas preferências pela
  // primeira vez: quem nunca abriu Configurações lê os defaults do schema.
  async upsert(
    db: Database,
    userId: string,
    data: Omit<NewNotificationPreferences, "userId">,
  ) {
    const [preferences] = await db
      .insert(notificationPreferences)
      .values({ ...data, userId })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: data,
      })
      .returning();

    if (!preferences) {
      throw new Error("Failed to upsert notification preferences");
    }

    return preferences;
  },
};
