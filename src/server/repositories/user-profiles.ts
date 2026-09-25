import { eq } from "drizzle-orm";

import { userProfiles, type NewUserProfile } from "@/../db/schema";

import type { Database } from "./types";

// Campos editáveis em Configurações / Minha conta. Não inclui os campos que
// pertencem ao onboarding (currency, trackingStartMonth, consentimento).
type UserProfileSettingsUpdate = Partial<
  Pick<
    NewUserProfile,
    "phone" | "cpf" | "aiAutoCategorize" | "aiProactiveInsights"
  >
>;

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

  // Update (não upsert): estas telas só são alcançáveis depois do onboarding,
  // então a linha já existe. Se não existir, devolve undefined e o service
  // trata — em vez de criar um profile pela metade, sem currency nem consent.
  async updateSettings(
    db: Database,
    userId: string,
    data: UserProfileSettingsUpdate,
  ) {
    const [profile] = await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId))
      .returning();

    return profile;
  },
};
