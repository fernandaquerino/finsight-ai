import { eq } from "drizzle-orm";

import { userProfiles, type NewUserProfile } from "@/../db/schema";

import type { Database } from "./types";

// user_profiles tem userId como PK (relação 1:1 com users). Isolamento pela PK.
export const userProfileRepository = {
  getByUserId(db: Database, userId: string) {
    return db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });
  },

  // Upsert: o DrizzleAdapter cria o usuário mas não o profile, então o primeiro
  // onboarding insere; execuções seguintes atualizam. onConflict pela PK userId.
  async upsert(
    db: Database,
    userId: string,
    data: Omit<NewUserProfile, "userId">,
  ) {
    const [profile] = await db
      .insert(userProfiles)
      .values({ ...data, userId })
      .onConflictDoUpdate({ target: userProfiles.userId, set: data })
      .returning();

    if (!profile) {
      throw new Error("Failed to upsert user profile");
    }

    return profile;
  },
};
